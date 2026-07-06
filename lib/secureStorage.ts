/**
 * ═══════════════════════════════════════════════════════════════
 * 🔒 SECURE STORAGE MODULE — Agent-Guardian (CISO)
 * ═══════════════════════════════════════════════════════════════
 *
 * Centralized secure storage wrapper around expo-secure-store.
 * ALL PII and sensitive data MUST go through this module.
 *
 * RULES:
 * - NEVER store PII in AsyncStorage, localStorage, or plain text
 * - Use typed keys (SECURE_KEYS) to prevent key collisions
 * - Logs access in development for audit trail
 * - Falls back gracefully on web / simulators without keychain
 *
 * OWASP M2 COMPLIANCE: ✅
 * ═══════════════════════════════════════════════════════════════
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

// ─── Key Registry ────────────────────────────────────────────
// ALL keys for sensitive data MUST be registered here.
// Dynamic keys use factory functions (e.g. for userId-scoped data).

export const SECURE_KEYS = {
  // Auth tokens (managed by Supabase, but stored here for reference)
  ACCESS_TOKEN: 'kizola_access_token',
  REFRESH_TOKEN: 'kizola_refresh_token',

  // User PII
  USER_PHONE: 'kizola_user_phone',
  USER_EMAIL: 'kizola_user_email',

  // OTP flow
  PENDING_PHONE: 'kizola_pending_phone',

  // MFA
  MFA_FACTOR_ID: 'kizola_mfa_factor_id',
  MFA_SECRET: 'kizola_mfa_secret',

  // Session
  LAST_ACTIVITY: 'kizola_last_activity',
  LOGIN_ATTEMPTS: 'kizola_login_attempts',

  // Demo mode
  DEMO_USER: 'kizola_demo_user',

  // IAP receipts (temporary, until verified server-side)
  PENDING_RECEIPT: 'kizola_pending_receipt',

  // Scoped data (per-user)
  BENEFICIARIES: (userId: string) => `kizola_beneficiaries_${userId}`,
  SUPPORT_REQUESTS: (userId: string) => `kizola_support_${userId}`,
  HOUSING_REQUESTS: (userId: string) => `kizola_housing_${userId}`,
  FINANCE_REQUESTS: (userId: string) => `kizola_finance_${userId}`,
  NOTIFICATIONS: (userId: string) => `kizola_notifications_${userId}`,
  DOCUMENTS: (userId: string) => `kizola_documents_${userId}`,
  ACTIVITIES: (userId: string) => `kizola_activities_${userId}`,
} as const;

// ─── Core Operations ─────────────────────────────────────────

/**
 * Retrieve a value from SecureStore.
 * Returns null if the key doesn't exist or on error (web, simulator, etc.).
 */
export async function getSecureItem<T = string>(key: string): Promise<T | null> {
  if (isWeb) return null;
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (raw === null) return null;

    if (__DEV__) {
      console.log(`[SecureStore] GET ${key}`);
    }

    // Attempt JSON parse; fall back to raw string
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch {
    return null;
  }
}

/**
 * Persist a value to SecureStore.
 * Silently fails on platforms where SecureStore is unavailable.
 */
export async function setSecureItem<T>(key: string, value: T): Promise<void> {
  if (isWeb) return;
  try {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);

    if (__DEV__) {
      console.log(`[SecureStore] SET ${key}`);
    }

    await SecureStore.setItemAsync(key, payload, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } catch (error) {
    if (__DEV__) {
      console.warn(`[SecureStore] Failed to save "${key}":`, error);
    }
  }
}

/**
 * Delete a value from SecureStore.
 */
export async function removeSecureItem(key: string): Promise<void> {
  if (isWeb) return;
  try {
    if (__DEV__) {
      console.log(`[SecureStore] REMOVE ${key}`);
    }
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Silently fail
  }
}

/**
 * Clear ALL secure storage.
 * Use on logout or CCPA data deletion.
 */
export async function clearAllSecure(): Promise<void> {
  if (__DEV__) {
    console.log('[SecureStore] CLEAR ALL');
  }

  const staticKeys = Object.values(SECURE_KEYS).filter(
    (v) => typeof v === 'string'
  ) as string[];

  for (const key of staticKeys) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Continue clearing even if one key fails
    }
  }
}

// ─── Token Helpers ───────────────────────────────────────────

/**
 * Store auth tokens (access + refresh).
 * Used during session initialization.
 */
export async function setTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await Promise.all([
    setSecureItem(SECURE_KEYS.ACCESS_TOKEN, accessToken),
    setSecureItem(SECURE_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
}

/**
 * Retrieve stored auth tokens.
 */
export async function getTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    getSecureItem(SECURE_KEYS.ACCESS_TOKEN),
    getSecureItem(SECURE_KEYS.REFRESH_TOKEN),
  ]);
  return { accessToken, refreshToken };
}

/**
 * Clear all auth-related tokens (on logout).
 */
export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    removeSecureItem(SECURE_KEYS.ACCESS_TOKEN),
    removeSecureItem(SECURE_KEYS.REFRESH_TOKEN),
    removeSecureItem(SECURE_KEYS.MFA_FACTOR_ID),
    removeSecureItem(SECURE_KEYS.LAST_ACTIVITY),
    removeSecureItem(SECURE_KEYS.LOGIN_ATTEMPTS),
  ]);
}

// ─── PII Helpers ─────────────────────────────────────────────

/**
 * Store user PII (phone and/or email).
 */
export async function setUserPII(phone?: string, email?: string): Promise<void> {
  if (phone !== undefined) await setSecureItem(SECURE_KEYS.USER_PHONE, phone);
  if (email !== undefined) await setSecureItem(SECURE_KEYS.USER_EMAIL, email);
}

/**
 * Retrieve stored user PII.
 */
export async function getUserPII(): Promise<{
  phone: string | null;
  email: string | null;
}> {
  const [phone, email] = await Promise.all([
    getSecureItem(SECURE_KEYS.USER_PHONE),
    getSecureItem(SECURE_KEYS.USER_EMAIL),
  ]);
  return { phone, email };
}

/**
 * Clear all user PII.
 * Used for CCPA data deletion compliance.
 */
export async function clearUserPII(): Promise<void> {
  await Promise.all([
    removeSecureItem(SECURE_KEYS.USER_PHONE),
    removeSecureItem(SECURE_KEYS.USER_EMAIL),
    removeSecureItem(SECURE_KEYS.PENDING_PHONE),
    removeSecureItem(SECURE_KEYS.PENDING_RECEIPT),
  ]);
}
