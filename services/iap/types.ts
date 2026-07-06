export type IapPlatform = 'apple' | 'google';

export interface IapProduct {
  /** Platform-specific product/sku identifier */
  productId: string;
  /** Human-readable title */
  title: string;
  /** Human-readable description */
  description: string;
  /** Price string as returned by store (e.g. "$9.99", "R$ 14,90") */
  price: string;
  /** Price in micro-units (cents for most currencies) */
  priceAmountMicros: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Subscription period (iOS: "P1M", Android: "monthly") */
  subscriptionPeriod?: string;
  /** Plan key in the app's PLANS constant */
  planId: 'basic' | 'pro' | 'premium';
}

export interface IapPurchase {
  /** Platform-specific purchase token / transaction receipt */
  purchaseToken: string;
  /** Product identifier of the purchased item */
  productId: string;
  /** Platform */
  platform: IapPlatform;
  /** Base64-encoded receipt (iOS) or purchase data JSON (Android) */
  receipt: string;
  /** ISO timestamp of the purchase */
  purchaseTime: string;
  /** Whether the subscription is auto-renewing */
  autoRenewing: boolean;
}

export interface IapVerificationResult {
  valid: boolean;
  /** Expanded entitlement data returned by the verification endpoint */
  entitlement?: {
    productId: string;
    planId: 'basic' | 'pro' | 'premium';
    expirationDate: string;
    autoRenewing: boolean;
    platform: IapPlatform;
  };
  error?: string;
}

/**
 * Result returned by the platform-specific store APIs.
 * ⚠️ This app does NOT bundle RevenueCat or similar SDK.
 * Purchases use bare `expo-in-app-purchases` / `react-native-iap`.
 */
export type PurchaseResult =
  | { success: true; purchase: IapPurchase }
  | { success: false; error: string; userCancelled?: boolean };
