/**
 * Shared TypeScript types for the phone auth flow.
 */

/** E.164 international phone string, e.g. "+2449XXXXXXX" */
export type PhoneE164 = string;

/** Response from POST /auth/send-code */
export interface SendCodeResponse {
  success: boolean;
  message: string;
  status: 'pending' | 'approved' | 'canceled';
}

/** Response from POST /auth/verify-code */
export interface VerifyCodeResponse {
  success: boolean;
  userId: string;
  sessionToken: string;
  isNew: boolean;
}

/** Normalized error shape thrown by phoneAuthService */
export interface AuthServiceError {
  message: string;
  code?: number;
}

/** Country option for the phone picker */
export interface Country {
  name: string;
  flag: string;
  code: string;  // dial code, e.g. "+244"
  iso: string;   // ISO 3166-1 alpha-2, e.g. "AO"
}
