/**
 * Phone auth service — frontend layer.
 * Calls the Kizola backend, then exchanges the session token with Supabase.
 */

import { apiClient } from '@/services/api/apiClient';
import { supabase } from '@/lib/supabase';
import { AxiosError } from 'axios';

// ── Types ──────────────────────────────────────────────────────────────────

export interface SendCodeResponse {
  success: boolean;
  message: string;
  status: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  userId: string;
  sessionToken: string;
  isNew: boolean;
}

export interface AuthServiceError {
  message: string;
  code?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Extracts a clean error message from Axios errors */
const extractError = (err: unknown): AuthServiceError => {
  if (err instanceof AxiosError && err.response?.data?.error) {
    return { message: err.response.data.error, code: err.response.status };
  }
  if (err instanceof Error) return { message: err.message };
  return { message: 'An unexpected error occurred. Please try again.' };
};

// ── Service ────────────────────────────────────────────────────────────────

/**
 * Step 1: Request OTP via backend → Twilio Verify.
 */
export const sendVerificationCode = async (phone: string): Promise<SendCodeResponse> => {
  try {
    const { data } = await apiClient.post<SendCodeResponse>('/auth/send-code', { phone });
    return data;
  } catch (err) {
    throw extractError(err);
  }
};

/**
 * Step 2: Verify OTP, get session token from backend, exchange with Supabase.
 * Returns the Supabase session or throws an AuthServiceError.
 */
export const verifyAndSignIn = async (
  phone: string,
  code: string
): Promise<{ userId: string; isNew: boolean }> => {
  try {
    // 2a. Check code against our backend (Twilio Verify)
    const { data } = await apiClient.post<VerifyCodeResponse>('/auth/verify-code', { phone, code });

    // 2b. Exchange backend session token with Supabase (magiclink type)
    const { error: supabaseError } = await supabase.auth.verifyOtp({
      email: `${phone.replace(/\W/g, '')}@phone.kizola.app`,
      token: data.sessionToken,
      type: 'magiclink',
    });

    if (supabaseError) {
      throw { message: supabaseError.message };
    }

    return { userId: data.userId, isNew: data.isNew };
  } catch (err) {
    // Re-throw if already an AuthServiceError shape
    if (typeof err === 'object' && err !== null && 'message' in err) throw err;
    throw extractError(err);
  }
};
