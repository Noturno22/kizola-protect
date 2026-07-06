import { useCallback, useEffect, useState } from 'react';
import type { SessionManager } from './useSessionManager';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';

const LOGIN_ATTEMPTS_KEY = 'kizola_login_attempts';
const MFA_SECRET_KEY = 'kizola_mfa_secret';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export type SecurityManager = ReturnType<typeof useSecurity>;

export function useSecurity(ctx: { sessionManager: SessionManager }) {
  const { session: _session } = ctx.sessionManager;

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(0);

  // Check if account is locked out
  const checkLockout = useCallback(async (): Promise<boolean> => {
    if (isLockedOut && lockoutUntil > Date.now()) {
      return true;
    }
    if (isLockedOut && lockoutUntil <= Date.now()) {
      setIsLockedOut(false);
      setLoginAttempts(0);
      setLockoutUntil(0);
      await SecureStore.deleteItemAsync(LOGIN_ATTEMPTS_KEY);
      return false;
    }
    return false;
  }, [isLockedOut, lockoutUntil]);

  // Record login attempt
  const recordLoginAttempt = useCallback(async (success: boolean) => {
    if (success) {
      setLoginAttempts(0);
      await SecureStore.deleteItemAsync(LOGIN_ATTEMPTS_KEY);
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      await SecureStore.setItemAsync(
        LOGIN_ATTEMPTS_KEY,
        JSON.stringify({ attempts: newAttempts, timestamp: Date.now() }),
      );

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        setIsLockedOut(true);
        setLockoutUntil(until);
      }
    }
  }, [loginAttempts]);

  // Enable MFA for user
  const enableMfa = async () => {
    if (!_session?.user) throw new Error('No session');

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Kizola Protect Authenticator',
    });

    if (error) throw error;

    if (data.totp?.secret) {
      await SecureStore.setItemAsync(MFA_SECRET_KEY, data.totp.secret);
    }

    setMfaEnabled(true);
    return { secret: data.totp?.secret, qrCode: data.totp?.qr_code };
  };

  // Verify MFA challenge
  const verifyMfa = async (code: string) => {
    if (!_session?.user) throw new Error('No session');

    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: _session.user.id,
      code,
    });

    if (error) throw error;
    return data;
  };

  // Disable MFA
  const disableMfa = async () => {
    if (!_session?.user) throw new Error('No session');

    const { error } = await supabase.auth.mfa.unenroll({
      factorId: '',
    });

    if (error) throw error;

    await SecureStore.deleteItemAsync(MFA_SECRET_KEY);
    setMfaEnabled(false);
  };

  // Restore lockout state from SecureStore on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(LOGIN_ATTEMPTS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setLoginAttempts(parsed.attempts || 0);

          if (parsed.attempts >= MAX_LOGIN_ATTEMPTS) {
            const elapsed = Date.now() - (parsed.timestamp || Date.now());
            const remaining = LOCKOUT_DURATION_MS - elapsed;
            if (remaining > 0) {
              setIsLockedOut(true);
              setLockoutUntil(Date.now() + remaining);
            } else {
              await SecureStore.deleteItemAsync(LOGIN_ATTEMPTS_KEY);
            }
          }
        }
      } catch {
        // Ignore parse errors on stale data
      }
    })();
  }, []);

  return {
    mfaEnabled,
    loginAttempts,
    isLockedOut,
    lockoutUntil,
    checkLockout,
    recordLoginAttempt,
    enableMfa,
    verifyMfa,
    disableMfa,
  };
}
