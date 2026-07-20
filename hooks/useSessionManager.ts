import { useCallback, useEffect, useState } from 'react';
import { supabase, type User, isSupabaseConfigured } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';

const DEMO_MODE_KEY = 'kizola_demo_user';
const CACHED_USER_KEY = 'kizola_cached_user_profile';
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const cacheUserProfile = async (userData: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHED_USER_KEY, JSON.stringify(userData));
  } catch { /* cache write failed, non-critical */ }
};

const getCachedUserProfile = async (): Promise<User | null> => {
  try {
    const raw = await AsyncStorage.getItem(CACHED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

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
        // Try cached profile when session unavailable offline
        const cachedUser = await getCachedUserProfile();
        if (cachedUser && cachedUser.id === userId) {
          console.log('[Auth] Restoring user from cache (no session)');
          setUser(cachedUser);
        } else {
          setUser(null);
        }
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

      const [profileResult, subResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const { data: profileData, error: profileError } = profileResult;

      if (profileError) {
        console.warn('[Auth] Error fetching user profile (offline?):', profileError.message);
        // Offline fallback: restore from cache
        const cachedUser = await getCachedUserProfile();
        if (cachedUser && cachedUser.id === userId) {
          console.log('[Auth] Restoring user from cache (fetch failed)');
          setUser(cachedUser);
        } else {
          setUser(null);
        }
        return;
      }

      if (subResult.data?.plan_id) {
        subPlanId = subResult.data.plan_id;
      }

      if (!profileData) {
        console.warn('[Auth] Profile not found, creating directly via Supabase...');

        const email = authEmail ?? currentSession.user.email ?? '';
        const policyNumber = `KP-${Math.floor(100000 + Math.random() * 900000)}`;

        const { error: insertError } = await supabase.from('profiles').upsert({
          id: userId,
          email: email || '',
          full_name: email.split('@')[0] || 'Utilizador',
          role: email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : 'user',
          policy_number: policyNumber,
        }, { onConflict: 'id', ignoreDuplicates: false });

        if (insertError) {
          console.error('[Auth] Failed to create profile via Supabase:', insertError);
          setUser(null);
          return;
        }

        const { data: newProfile, error: refetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (refetchError || !newProfile) {
          console.error('[Auth] Profile not found after creation:', refetchError);
          setUser(null);
          return;
        }

        profileRow = newProfile;
      } else {
        profileRow = profileData;
      }

      if (!profileRow) {
        console.error('[Auth] Profile row is null after creation/fetch');
        setUser(null);
        return;
      }

      const userData = {
        ...profileRow,
        name: profileRow.full_name,
        plan: subPlanId || 'none',
        status: profileRow.status || 'inactive',
        role: profileRow.email === 'Jeronimo.samaina239898@gmail.com' ? 'admin' : (profileRow.role || 'user'),
        policy_number: profileRow.policy_number,
      } as User;

      if (!userData.avatar_url) {
        const googleAvatar = currentSession.user.user_metadata?.picture;
        if (googleAvatar) {
          userData.avatar_url = googleAvatar;
          supabase
            .from('profiles')
            .update({ avatar_url: googleAvatar })
            .eq('id', userId);
        }
      }

      // Cache user profile for offline access
      await cacheUserProfile(userData);
      setUser(userData);
    } catch (error) {
      console.error('[Auth] fetchUserProfile error:', error);
      // Offline fallback: restore from cache on any error
      const cachedUser = await getCachedUserProfile();
      if (cachedUser) {
        console.log('[Auth] Restoring user from cache (error fallback)');
        setUser(cachedUser);
      } else {
        setUser(null);
      }
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
        if (!isSupabaseConfigured()) {
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

          const initialUrl = await Linking.getInitialURL();
          if (initialUrl && !cancelled) {
            const { params: query } = QueryParams.getQueryParams(initialUrl);
            let merged: Record<string, string> = { ...query };
            try {
              const urlObj = new URL(initialUrl);
              if (urlObj.hash) {
                urlObj.hash.substring(1).split('&').forEach((pair) => {
                  const [k, v] = pair.split('=');
                  if (k && v) merged[decodeURIComponent(k)] = decodeURIComponent(v);
                });
              }
            } catch { /* not parseable — query params only */ }

            if (merged.code) {
              const { data: sd, error } = await supabase.auth.exchangeCodeForSession(merged.code);
              if (!error && sd?.session) {
                setSession(sd.session);
                await fetchUserProfile(sd.session.user.id);
              }
            } else if (merged.access_token) {
              const { data: sd, error } = await supabase.auth.setSession({
                access_token: merged.access_token,
                refresh_token: merged.refresh_token ?? '',
              });
              if (!error && sd?.session) {
                setSession(sd.session);
                await fetchUserProfile(sd.session.user.id);
              }
            }
          }
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
