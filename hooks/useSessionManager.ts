import { useCallback, useEffect, useState } from 'react';
import { supabase, type User, isSupabaseConfigured } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const DEMO_MODE_KEY = 'kizola_demo_user';
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export type SessionManager = ReturnType<typeof useSessionManager>;

export function useSessionManager() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const checkSupabaseConnectivity = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        process.env.EXPO_PUBLIC_SUPABASE_URL!,
        { method: 'HEAD', signal: controller.signal },
      );
      clearTimeout(timeout);
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  };

  const fetchUserProfile = useCallback(async (userId: string, authEmail?: string) => {
    try {
      let profileRow: Record<string, any> | null = null;
      let subPlanId: string | null = null;

      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.user) {
        console.warn('[Auth] No valid session - cannot fetch or create profile');
        setUser(null);
        setLoading(false);
        return;
      }

      const uid = currentSession.user.id;
      if (userId !== uid) {
        console.error('[Auth] User ID mismatch: requested', userId, 'but auth uid is', uid);
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('[Auth] Error fetching user profile:', profileError);
        setUser(null);
        return;
      }

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subData?.plan_id) {
        subPlanId = subData.plan_id;
      }

      if (!profileData) {
        console.warn('[Auth] Profile not found, requesting creation via backend...');

        const email = authEmail ?? currentSession.user.email ?? '';
        const token = currentSession.access_token;
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

        try {
          const response = await fetch(`${apiUrl}/auth/create-profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId,
              email,
              fullName: email.split('@')[0] ?? 'Utilizador',
            }),
          });

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            console.error('[Auth] Backend rejected profile creation:', response.status, errBody.error);
            setUser(null);
            return;
          }
        } catch (err) {
          console.error('[Auth] Failed to reach backend for profile creation:', err);
          setUser(null);
          return;
        }

        const { data: newProfile, error: refetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (refetchError || !newProfile) {
          console.error('[Auth] Profile not found after backend creation:', refetchError);
          setUser(null);
          return;
        }

        profileRow = newProfile;
      } else {
        profileRow = profileData;
      }

      const userData = {
        ...profileRow,
        name: profileRow.full_name,
        plan: subPlanId || 'none',
        status: profileRow.status || 'inactive',
        role: profileRow.email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : (profileRow.role || 'user'),
        policy_number: profileRow.policy_number,
      } as User;

      setUser(userData);
    } catch (error) {
      console.error('[Auth] fetchUserProfile error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    if (isSessionExpired) {
      setIsSessionExpired(false);
    }
  }, [isSessionExpired]);

  // Bootstrap — check existing session on mount
  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;

    const bootstrap = async () => {
      try {
        const isOnline = await checkSupabaseConnectivity();
        if (!isSupabaseConfigured() || !isOnline) {
          const demoUserJson = await SecureStore.getItemAsync(DEMO_MODE_KEY);
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
          setSession(nextSession);
          if (nextSession?.user) {
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

  // Session timeout check
  useEffect(() => {
    const checkTimeout = () => {
      if (session && !isDemoMode) {
        const inactiveTime = Date.now() - lastActivity;
        if (inactiveTime >= SESSION_TIMEOUT_MS) {
          setIsSessionExpired(true);
        }
      }
    };

    const interval = setInterval(checkTimeout, 60 * 1000);
    return () => clearInterval(interval);
  }, [session, isDemoMode, lastActivity]);

  return {
    session,
    setSession,
    user,
    setUser,
    loading,
    setLoading,
    isDemoMode,
    setIsDemoMode,
    isSessionExpired,
    lastActivity,
    setLastActivity,
    setIsSessionExpired,
    fetchUserProfile,
    updateActivity,
  };
}
