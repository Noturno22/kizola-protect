import { useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendWelcomeNotificationIfNeeded } from '@/lib/notifications';
import i18n from '@/lib/i18n';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import type { SessionManager } from './useSessionManager';
import type { SecurityManager } from './useSecurity';

const DEMO_MODE_KEY = 'kizola_demo_user';

export type AuthOperations = ReturnType<typeof useAuthOperations>;

export function useAuthOperations(ctx: {
  sessionManager: SessionManager;
  security: SecurityManager;
}) {
  const {
    setSession,
    setUser,
    setIsDemoMode,
    setLoading,
    fetchUserProfile,
  } = ctx.sessionManager;
  const { checkLockout, recordLoginAttempt } = ctx.security;

  const signUp = useCallback(async (email: string, password: string, name: string, phone?: string) => {
    if (!isSupabaseConfigured()) {
      const demoUser = {
        id: 'demo-' + Date.now(),
        email,
        name,
        phone,
        plan: 'none',
        status: 'inactive',
        role: email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : 'user',
        created_at: new Date().toISOString(),
      };
      await SecureStore.setItemAsync(DEMO_MODE_KEY, JSON.stringify(demoUser));
      setUser(demoUser as any);
      setIsDemoMode(true);
      return { user: { id: demoUser.id } };
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name,
          phone: phone || '',
          plan: 'none',
          status: 'inactive',
          role: 'user',
        },
      },
    });

    if (authError) throw authError;

    if (authData.user) {
      try {
        await supabase.from('notifications').insert({
          user_id: authData.user.id,
          title: i18n.t('notifWelcomeTitle'),
          message: i18n.t('notifWelcomeMessage'),
          type: 'success',
          read: false,
        });

        if (!phone) {
          await supabase.from('notifications').insert({
            user_id: authData.user.id,
            title: i18n.t('notifCompleteProfileTitle'),
            message: i18n.t('notifCompleteProfileMessage'),
            type: 'warning',
            read: false,
          });
        }
      } catch (notifError) {
        console.error('[Auth] Failed to trigger welcome notifications:', notifError);
      }
    }

    if (authData.session) {
      setSession(authData.session);
      await fetchUserProfile(authData.session.user.id);
    }

    return authData;
  }, [setSession, setUser, setIsDemoMode, fetchUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const locked = await checkLockout();
    if (locked) {
      const remainingMinutes = Math.ceil(
        (ctx.security.lockoutUntil - Date.now()) / 60000,
      );
      throw new Error(
        `Conta bloqueada por tentativas excessivas. Tente novamente em ${remainingMinutes} minutos.`,
      );
    }

    if (!isSupabaseConfigured()) {
      const demoUser = {
        id: 'demo-' + Date.now(),
        email,
        name: email.split('@')[0],
        plan: 'basic',
        status: 'active',
        role: email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : 'user',
        created_at: new Date().toISOString(),
      };
      await SecureStore.setItemAsync(DEMO_MODE_KEY, JSON.stringify(demoUser));
      setUser(demoUser as any);
      setIsDemoMode(true);
      await recordLoginAttempt(true);
      return { user: { id: demoUser.id } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await recordLoginAttempt(false);
      throw error;
    }

    await recordLoginAttempt(true);

    if (data.session) {
      setSession(data.session);
      await fetchUserProfile(data.session.user.id);
    } else if (data.user) {
      await fetchUserProfile(data.user.id);
    }

    return data;
  }, [setSession, setUser, setIsDemoMode, fetchUserProfile, checkLockout, recordLoginAttempt, ctx.security.lockoutUntil]);

  const signOut = useCallback(async () => {
    const { session: currentSession, isDemoMode: demo, user } = ctx.sessionManager;

    if (currentSession?.user && !demo) {
      try {
        await supabase.from('auth_audit_logs').insert({
          user_id: currentSession.user.id,
          action: 'logout',
          resource: 'auth',
          details: { email: currentSession.user.email },
          created_at: new Date().toISOString(),
        });
      } catch (logErr) {
        console.warn('Failed to log logout event:', logErr);
      }
    }

    if (demo) {
      await SecureStore.deleteItemAsync(DEMO_MODE_KEY);
      const { setUser: setUserState, setSession: setSess, setIsDemoMode: setDemo } = ctx.sessionManager;
      setUserState(null);
      setSess(null);
      setDemo(false);
      return;
    }

    setSession(null);
    setUser(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [ctx.sessionManager, setSession, setUser]);

  const signInWithOtp = useCallback(async (phone: string) => {
    if (!isSupabaseConfigured()) {
      return { data: {}, error: null };
    }

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const response = await fetch(`${supabaseUrl}/functions/v1/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ phone }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to send code');
    return { data: result, error: null };
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    if (!isSupabaseConfigured()) {
      const demoUser = {
        id: 'demo-' + Date.now(),
        email: `${phone}@demo.com`,
        name: 'Demo Phone User',
        phone,
        plan: 'basic',
        status: 'active',
        role: 'user',
        created_at: new Date().toISOString(),
      };
      await SecureStore.setItemAsync(DEMO_MODE_KEY, JSON.stringify(demoUser));
      setUser(demoUser as any);
      setIsDemoMode(true);
      return { data: { session: {} as Session, user: demoUser } };
    }

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const response = await fetch(`${supabaseUrl}/functions/v1/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ phone, code: token }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Invalid code');

    if (result.accessToken) {
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: result.accessToken,
        refresh_token: result.refreshToken || '',
      });

      if (sessionError) throw sessionError;

      if (sessionData.session) {
        setSession(sessionData.session);
        await fetchUserProfile(sessionData.session.user.id);
        sendWelcomeNotificationIfNeeded(sessionData.session.user.id);
      }
    }

    return { data: result, error: null };
  }, [setSession, setIsDemoMode, setUser, fetchUserProfile]);

  const signInDemo = useCallback(async () => {
    const demoUser = {
      id: 'demo-' + Date.now(),
      email: 'demo@kizola.app',
      name: 'Utilizador de Demonstração',
      plan: 'basic',
      status: 'active',
      role: 'user',
      created_at: new Date().toISOString(),
    };
    await SecureStore.setItemAsync(DEMO_MODE_KEY, JSON.stringify(demoUser));
    setUser(demoUser as any);
    setIsDemoMode(true);
    return { user: { id: demoUser.id } };
  }, [setUser, setIsDemoMode]);

  return { signUp, signIn, signOut, signInWithOtp, verifyOtp, signInDemo };
}
