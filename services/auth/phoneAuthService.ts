/**
 * Phone auth service — frontend layer.
 * Calls Supabase Edge Functions for Twilio Verify + session management.
 */

import { supabase } from '@/lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────

export interface SendCodeResponse {
  success: boolean;
  message: string;
  status: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  userId: string;
  accessToken: string;
  refreshToken: string;
  isNew: boolean;
}

export interface AuthServiceError {
  message: string;
  code?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/** Calls a Supabase Edge Function */
const callEdgeFunction = async <T>(name: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const error: AuthServiceError = {
      message: data.error || 'An unexpected error occurred.',
      code: response.status,
    };
    throw error;
  }

  return data as T;
};

// ── Service ────────────────────────────────────────────────────────────────

/**
 * Step 1: Request OTP via Supabase Edge Function → Twilio Verify.
 */
export const sendVerificationCode = async (phone: string): Promise<SendCodeResponse> => {
  try {
    return await callEdgeFunction<SendCodeResponse>('send-code', { phone });
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'message' in err) throw err;
    throw { message: 'Failed to send verification code. Please try again.' };
  }
};

/**
 * Step 2: Verify OTP, get session tokens from Edge Function, exchange with Supabase.
 * Returns the Supabase session or throws an AuthServiceError.
 */
export const verifyAndSignIn = async (
  phone: string,
  code: string
): Promise<{ userId: string; isNew: boolean }> => {
  try {
    // 2a. Verify code via Edge Function (Twilio Verify + create/find user)
    const result = await callEdgeFunction<VerifyCodeResponse>('verify-code', { phone, code });

    // 2b. Set the session in Supabase client
    if (result.accessToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.accessToken,
        refresh_token: result.refreshToken || '',
      });

      if (sessionError) {
        throw { message: sessionError.message };
      }
    }

    return { userId: result.userId, isNew: result.isNew };
  } catch (err) {
    // Re-throw if already an AuthServiceError shape
    if (typeof err === 'object' && err !== null && 'message' in err) throw err;
    throw { message: 'Verification failed. Please try again.' };
  }
};
