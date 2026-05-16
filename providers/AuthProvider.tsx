import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { supabase, type User, isSupabaseConfigured } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_MODE_KEY = '@kizola_demo_user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string, authEmail?: string) => {
    try {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setUser(null);
        return;
      }

      // 2. Fetch Active Subscription for Plan
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Profile doesn't exist yet (e.g. after email confirmation with RLS blocking initial insert)
      // → create it now that the user is authenticated
      if (!profileData) {
        console.warn('[Auth] Profile not found, attempting to create it now...');
        const email = authEmail ?? '';
        const policyNumber = `KP-${Math.floor(100000 + Math.random() * 900000)}`;
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email,
            full_name: email.split('@')[0] ?? 'Utilizador',
            role: email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : 'user',
            policy_number: policyNumber,
          })
          .select()
          .single();

        if (insertError) {
          console.error('[Auth] Failed to auto-create profile:', insertError);
          setUser(null);
          return;
        }

        const userData = {
          ...newProfile,
          name: newProfile.full_name,
          plan: subData?.plan_id || 'none',
          status: newProfile.status || 'inactive',
          role: email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : (newProfile.role || 'user'),
          policy_number: newProfile.policy_number,
        } as User;
        setUser(userData);
        return;
      }

      const userData = {
        ...profileData,
        name: profileData.full_name,
        plan: subData?.plan_id || 'none',
        status: profileData.status || 'inactive',
        role: profileData.email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : (profileData.role || 'user'),
        policy_number: profileData.policy_number,
      } as User;

      setUser(userData);
      
      // 3. Check for incomplete profile notification
      if (!userData.phone || !userData.policy_number) {
        // Only trigger if we are in demo mode or if we want to add a real notification
        // For simplicity, let's just use a local check or insert if not exists
        // However, we don't have a check-if-exists easily here without another query
        // Let's just focus on the signUp and subscription triggers for now as they are one-time events.
      }

    } catch (error) {
      console.error('[Auth] fetchUserProfile error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;

    const bootstrap = async () => {
      try {
        if (!isSupabaseConfigured()) {
          const demoUserJson = await AsyncStorage.getItem(DEMO_MODE_KEY);
          if (!cancelled && demoUserJson) {
            setUser(JSON.parse(demoUserJson));
            setIsDemoMode(true);
          }
          if (!cancelled) setLoading(false);
          return;
        }

        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (cancelled) return;
        setSession(initialSession);
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        } else {
          setLoading(false);
        }

        const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
          console.log('[Auth] onAuthStateChange event:', event);
          setSession(nextSession);
          if (nextSession?.user) {
            // Pass email so profile can be auto-created if needed
            fetchUserProfile(nextSession.user.id, nextSession.user.email);
          } else {
            setUser(null);
            setLoading(false);
          }
        });
        subscription = data.subscription;
      } catch (error) {
        console.error('Session check error:', error);
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    if (!isSupabaseConfigured()) {
      const demoUser: User = {
        id: 'demo-' + Date.now(),
        email,
        name,
        phone,
        plan: 'none',
        status: 'inactive',
        role: email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : 'user',
        created_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(DEMO_MODE_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      setIsDemoMode(true);
      return { user: { id: demoUser.id } };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name: name,
          phone: phone || '',
          plan: 'none',
          status: 'inactive',
          role: 'user',
        }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      const policyNumber = `KP-${Math.floor(100000 + Math.random() * 900000)}`;
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        full_name: name,
        phone: phone || null,
        role: email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : 'user',
        policy_number: policyNumber,
      });

      if (profileError) {
        // Code 23505 = duplicate key (profile already exists) → safe to ignore
        // Other errors (e.g. RLS when email not yet confirmed) → log but don't throw;
        // fetchUserProfile will auto-create the profile on next login.
        console.warn('[Auth] Profile insert warning (will retry on login):', profileError.code, profileError.message);
      }
      
      // Trigger Welcome Notification
      try {
        await supabase.from('notifications').insert({
          user_id: authData.user.id,
          title: 'Bem-vindo à Kizola Protect! 🛡️',
          message: 'Sua conta foi criada com sucesso. Explore nossos benefícios e proteja seu futuro.',
          type: 'success',
          read: false,
        });
        
        // Trigger Incomplete Profile Notification if no phone
        if (!phone) {
          await supabase.from('notifications').insert({
            user_id: authData.user.id,
            title: 'Complete seu perfil 📝',
            message: 'Adicione seu número de telefone e documentos para verificação de identidade.',
            type: 'warning',
            read: false,
          });
        }
      } catch (notifError) {
        console.error('[Auth] Failed to trigger welcome notifications:', notifError);
      }
    }

    // Garanta que o estado local reflita a autenticação imediatamente quando houver sessão.
    if (authData.session) {
      setSession(authData.session);
      await fetchUserProfile(authData.session.user.id);
    }

    return authData;
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      const demoUser: User = {
        id: 'demo-' + Date.now(),
        email,
        name: email.split('@')[0],
        plan: 'basic',
        status: 'active',
        role: email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : 'user',
        created_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(DEMO_MODE_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      setIsDemoMode(true);
      return { user: { id: demoUser.id } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Evita race condition com `app/index.tsx` (que redireciona para /login quando session ainda é null).
    if (data.session) {
      setSession(data.session);
      await fetchUserProfile(data.session.user.id);
    } else if (data.user) {
      // Fallback raro: usuário veio sem sessão.
      await fetchUserProfile(data.user.id);
    }

    return data;
  };

  const signOut = async () => {
    if (isDemoMode) {
      await AsyncStorage.removeItem(DEMO_MODE_KEY);
      setUser(null);
      setSession(null);
      setIsDemoMode(false);
      return;
    }

    setSession(null);
    setUser(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithOtp = async (phone: string) => {
    if (!isSupabaseConfigured()) {
      return { data: {}, error: null };
    }
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send code');
      return { data: result, error: null };
    } catch (error: any) {
      throw error;
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    if (!isSupabaseConfigured()) {
      const demoUser: User = {
        id: 'demo-' + Date.now(),
        email: `${phone}@demo.com`,
        name: 'Demo Phone User',
        phone,
        plan: 'basic',
        status: 'active',
        role: 'user',
        created_at: new Date().toISOString(),
      };
      await AsyncStorage.setItem(DEMO_MODE_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      setIsDemoMode(true);
      return { data: { session: {} as Session, user: demoUser } };
    }

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Invalid code');

      // Use the access token from backend to set Supabase session
      if (result.accessToken) {
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: result.accessToken,
          refresh_token: result.refreshToken || '',
        });

        if (sessionError) throw sessionError;

        if (sessionData.session) {
          setSession(sessionData.session);
          await fetchUserProfile(sessionData.session.user.id);
        }
      }

      return { data: result, error: null };
    } catch (error: any) {
      throw error;
    }
  };

  const updateUserPlan = async (plan: 'free' | 'basic' | 'pro' | 'premium') => {
    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(nextBilling.getMonth() + 1);

    if (isDemoMode && user) {
      const updatedUser = {
        ...user,
        plan,
        status: 'active' as const,
      };
      await AsyncStorage.setItem(DEMO_MODE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Demo Notification
      const demoNotif = {
        id: 'sub-' + Date.now(),
        user_id: user.id,
        title: 'Assinatura Ativada! ✨',
        message: `Parabéns! Você agora é um membro ${plan.toUpperCase()}. Seus benefícios já estão disponíveis.`,
        type: 'success' as const,
        read: false,
        created_at: new Date().toISOString(),
      };
      const existingNotifs = await AsyncStorage.getItem(`@kizola_notifications_${user.id}`);
      const parsedNotifs = existingNotifs ? JSON.parse(existingNotifs) : [];
      await AsyncStorage.setItem(`@kizola_notifications_${user.id}`, JSON.stringify([demoNotif, ...parsedNotifs]));
      
      return;
    }

    if (!session?.user) {
      throw new Error('No session found. Please log in.');
    }

    // Se `plan` e `status` não existem na tabela `profiles`, atualize apenas outras informações se necessário,
    // ou se eles existirem (mas foi erro de cache), você pode querer tentar.
    // Vamos remover daqui para evitar o erro de cache, já que a subscription lida com o plano.
    /*
    const { error: userError } = await supabase
      .from('profiles')
      .update({ plan, status: 'active' })
      .eq('id', session.user.id);

    if (userError) throw userError;
    */

    const { error: subError } = await supabase.from('subscriptions').insert({
      user_id: session.user.id,
      plan_id: plan,
      status: 'active',
      start_date: now.toISOString(),
      next_billing_date: nextBilling.toISOString(),
    });

    if (subError) throw subError;

    // 2. Update Profile Status to Active
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', session.user.id);

    if (profileError) {
      console.error('Error updating profile status:', profileError);
    }
    
    // Trigger Subscription Notification
    try {
      await supabase.from('notifications').insert({
        user_id: session.user.id,
        title: 'Plano Ativado com Sucesso! ✅',
        message: `Sua assinatura do plano ${plan.toUpperCase()} foi confirmada. Aproveite todos os seus benefícios agora mesmo.`,
        type: 'success',
        read: false,
      });
    } catch (notifError) {
      console.error('[Auth] Failed to trigger subscription notification:', notifError);
    }
    
    await fetchUserProfile(session.user.id);
  };

  const updateAvatar = async (url: string) => {
    if (isDemoMode && user) {
      const updatedUser = { ...user, avatar_url: url };
      await AsyncStorage.setItem(DEMO_MODE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return;
    }

    if (!session?.user) throw new Error('No session');

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', session.user.id);

    if (error) throw error;
    await fetchUserProfile(session.user.id);
  };

  return {
    session,
    user,
    loading,
    isDemoMode,
    signUp,
    signIn,
    signInWithOtp,
    verifyOtp,
    signOut,
    updateUserPlan,
    updateAvatar,
  };
});
