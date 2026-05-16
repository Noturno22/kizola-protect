/**
 * usePhoneAuth — hook that orchestrates the full OTP login flow.
 *
 * Usage:
 *   const { sendCode, verifyCode, isLoading, error } = usePhoneAuth();
 */

import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import {
  sendVerificationCode,
  verifyAndSignIn,
  type AuthServiceError,
} from '@/services/auth/phoneAuthService';

export const usePhoneAuth = () => {
  const router = useRouter();
  const { isLoading, error, setLoading, setError, savePendingPhone, clearPendingPhone } =
    useAuthStore();

  /**
   * Send OTP to `phone`. On success, navigate to the verify screen.
   */
  const sendCode = useCallback(
    async (phone: string) => {
      setError(null);
      setLoading(true);
      try {
        await sendVerificationCode(phone);
        await savePendingPhone(phone);
        router.push('/(auth)/verify');
      } catch (err) {
        const e = err as AuthServiceError;
        setError(e.message ?? 'Failed to send verification code.');
      } finally {
        setLoading(false);
      }
    },
    [router, setError, setLoading, savePendingPhone]
  );

  /**
   * Verify `code` for `phone`. On success, navigate to the protected area.
   */
  const verifyCode = useCallback(
    async (phone: string, code: string) => {
      setError(null);
      setLoading(true);
      try {
        await verifyAndSignIn(phone, code);
        clearPendingPhone();
        // Replace so the user cannot back-navigate to the OTP screen
        router.replace('/(app)/dashboard');
      } catch (err) {
        const e = err as AuthServiceError;
        setError(e.message ?? 'Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [router, setError, setLoading, clearPendingPhone]
  );

  const clearError = useCallback(() => setError(null), [setError]);

  return { sendCode, verifyCode, isLoading, error, clearError };
};
