/**
 * In-App Purchase service — abstraction over platform-specific purchase APIs.
 *
 * ⚠️  DEPENDENCY STATUS (Jul 2026):
 *   - `expo-in-app-purchases` is NOT installed in package.json.
 *   - IAP migration is DEFERRED (see us-market-execution-plan.md).
 *   - Before using purchase functions, run:
 *       npx expo install expo-in-app-purchases
 *     (Verify SDK 54 compatibility first.)
 *
 * STRATEGY
 * --------
 * This app uses a server-authoritative receipt-verification model:
 *   1. Initiate purchase via platform store (App Store / Google Play).
 *   2. Send the purchase receipt to our backend for verification.
 *   3. On success, the backend updates the user's subscription in Supabase.
 *   4. The app refreshes user data (AuthProvider fetches updated profile).
 *
 * ⚠️  This service does NOT bundle RevenueCat. It uses bare platform purchase
 *     APIs (`expo-in-app-purchases` for Expo managed / `react-native-iap` for
 *     bare RN). Install the appropriate package before using purchase functions.
 *
 *     For Expo SDK 54 managed workflow: `npx expo install expo-in-app-purchases`
 *     (Note: as of 2026, verify expo-in-app-purchases availability for SDK 54)
 */

import { supabase } from '@/lib/supabase';
import type {
  IapProduct,
  IapPurchase,
  IapVerificationResult,
  PurchaseResult,
  IapPlatform,
} from './types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

// ---------------------------------------------------------------------------
// Concessão de planos (fallback)
// ---------------------------------------------------------------------------

/**
 * Product-to-plan mapping.
 * Keys are the store product / SKU identifiers used in App Store Connect &
 * Google Play Console.
 */
export const PRODUCT_PLAN_MAP: Record<string, 'basic' | 'pro' | 'premium'> = {
  // iOS — App Store Connect
  'com.kizola.protect.basic.monthly': 'basic',
  'com.kizola.protect.pro.monthly': 'pro',
  'com.kizola.protect.premium.monthly': 'premium',
  // Android — Google Play Console
  'kizola_protect_basic_monthly': 'basic',
  'kizola_protect_pro_monthly': 'pro',
  'kizola_protect_premium_monthly': 'premium',
};

/** Reverse map: planId → default product ID (iOS first, then Android). */
export const PLAN_PRODUCT_MAP: Record<'basic' | 'pro' | 'premium', string> = {
  basic: 'com.kizola.protect.basic.monthly',
  pro: 'com.kizola.protect.pro.monthly',
  premium: 'com.kizola.protect.premium.monthly',
};

// ---------------------------------------------------------------------------
// Receipt verification (reads from constants for SKU mapping)
// ---------------------------------------------------------------------------

/**
 * Verify a purchase receipt against the Supabase Edge Function.
 *
 * The edge function `verify-receipt` performs server-side validation against
 * Apple VerifyReceipt / Google Play Developer API and updates the user's
 * subscription in the `subscriptions` table.
 */
export async function verifyReceipt(
  purchase: IapPurchase
): Promise<IapVerificationResult> {
  if (!SUPABASE_URL) {
    return { valid: false, error: 'Supabase URL not configured' };
  }

  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;
  if (!accessToken) {
    return { valid: false, error: 'No active session' };
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/verify-receipt`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
        },
        body: JSON.stringify({
          receipt: purchase.receipt,
          productId: purchase.productId,
          platform: purchase.platform,
          purchaseToken: purchase.purchaseToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        valid: false,
        error: data.error || `Verification failed (HTTP ${response.status})`,
      };
    }

    return {
      valid: true,
      entitlement: {
        productId: data.productId,
        planId: data.planId,
        expirationDate: data.expirationDate,
        autoRenewing: data.autoRenewing ?? false,
        platform: purchase.platform,
      },
    };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Network error during verification' };
  }
}

// ---------------------------------------------------------------------------
// Direct grant (for development / demo mode)
// ---------------------------------------------------------------------------

/**
 * Grant a plan directly via the backend (used in demo mode or for manual
 * entitlement restoration). Calls the backend endpoint which updates the
 * subscription in Supabase using SERVICE_ROLE.
 */
export async function grantPlan(planId: 'basic' | 'pro' | 'premium'): Promise<boolean> {
  const session = await supabase.auth.getSession();
  const accessToken = session.data.session?.access_token;
  if (!accessToken) return false;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/grant-plan`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
        },
        body: JSON.stringify({ planId }),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Plan ID from product ID mapping helper
// ---------------------------------------------------------------------------

/** Resolve a store product ID to an internal plan ID. */
export function productIdToPlan(productId: string): 'basic' | 'pro' | 'premium' | null {
  return PRODUCT_PLAN_MAP[productId] ?? null;
}

// ---------------------------------------------------------------------------
// Store-specific product helpers (stubs — implement when integrating the SDK)
// ---------------------------------------------------------------------------

/**
 * Fetch available products from the store.
 *
 * ⚠️  Requires `expo-in-app-purchases` or `react-native-iap` installed.
 *     When the SDK is available, call:
 *       getProducts([...Object.values(PRODUCT_PLAN_MAP)])
 *     and map the results to IapProduct[].
 */
export async function fetchProducts(): Promise<IapProduct[]> {
  // TODO: Integrate with expo-in-app-purchases / react-native-iap
  // Return static product list during development
  return [
    {
      productId: 'com.kizola.protect.basic.monthly',
      title: 'Basic Monthly',
      description: 'Essential protection and resources',
      price: '$9.99',
      priceAmountMicros: 9990000,
      currency: 'USD',
      subscriptionPeriod: 'P1M',
      planId: 'basic',
    },
    {
      productId: 'com.kizola.protect.pro.monthly',
      title: 'Pro Monthly',
      description: 'Advanced coverage and priority support',
      price: '$19.99',
      priceAmountMicros: 19990000,
      currency: 'USD',
      subscriptionPeriod: 'P1M',
      planId: 'pro',
    },
    {
      productId: 'com.kizola.protect.premium.monthly',
      title: 'Premium Monthly',
      description: 'Full access with all premium features',
      price: '$29.99',
      priceAmountMicros: 29990000,
      currency: 'USD',
      subscriptionPeriod: 'P1M',
      planId: 'premium',
    },
  ];
}

/**
 * Initiate a purchase for the given product.
 *
 * ⚠️  Requires store SDK installed.
 *     Steps:
 *       1. Call requestPurchase(productId) on the store SDK.
 *       2. On success, build an IapPurchase from the store result.
 *       3. Call verifyReceipt() to server-validate.
 *       4. On verification success, refresh user profile.
 */
export async function purchaseProduct(productId: string): Promise<PurchaseResult> {
  // TODO: Integrate with expo-in-app-purchases / react-native-iap
  return {
    success: false,
    error: 'Store SDK not yet integrated. See iapService.ts TODO.',
  };
}

/**
 * Restore previous purchases.
 *
 * ⚠️  Requires store SDK installed.
 */
export async function restorePurchases(): Promise<PurchaseResult[]> {
  // TODO: Integrate with store SDK restore APIs
  return [];
}
