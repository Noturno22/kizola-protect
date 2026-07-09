import type { IapPlatform, IapProduct, IapPurchase, IapVerificationResult, PurchaseResult } from '@/services/iap/types';

describe('IapPlatform', () => {
  it('accepts "apple" and "google" only', () => {
    const apple: IapPlatform = 'apple';
    const google: IapPlatform = 'google';
    expect(apple).toBe('apple');
    expect(google).toBe('google');
  });
});

describe('IapProduct', () => {
  it('can represent a valid product', () => {
    const product: IapProduct = {
      productId: 'com.kizola.protect.pro',
      title: 'Pro Plan',
      description: 'Full protection suite',
      price: '$34.99',
      priceAmountMicros: 34990000,
      currency: 'USD',
      subscriptionPeriod: 'P1M',
      planId: 'pro',
    };
    expect(product.planId).toBe('pro');
    expect(product.price).toBe('$34.99');
    expect(product.currency).toBe('USD');
  });

  it('allows optional subscriptionPeriod', () => {
    const product: IapProduct = {
      productId: 'com.kizola.protect.basic',
      title: 'Basic',
      description: 'Basic plan',
      price: '$19.99',
      priceAmountMicros: 19990000,
      currency: 'USD',
      planId: 'basic',
    };
    expect(product.subscriptionPeriod).toBeUndefined();
  });
});

describe('IapPurchase', () => {
  it('can represent a valid purchase', () => {
    const purchase: IapPurchase = {
      purchaseToken: 'tok_abc123',
      productId: 'com.kizola.protect.pro',
      platform: 'apple',
      receipt: 'base64receiptdata',
      purchaseTime: '2026-06-15T10:30:00Z',
      autoRenewing: true,
    };
    expect(purchase.platform).toBe('apple');
    expect(purchase.autoRenewing).toBe(true);
  });
});

describe('IapVerificationResult', () => {
  it('can represent a successful verification', () => {
    const result: IapVerificationResult = {
      valid: true,
      entitlement: {
        productId: 'com.kizola.protect.pro',
        planId: 'pro',
        expirationDate: '2026-07-15T10:30:00Z',
        autoRenewing: true,
        platform: 'apple',
      },
    };
    expect(result.valid).toBe(true);
    expect(result.entitlement?.planId).toBe('pro');
  });

  it('can represent a failed verification', () => {
    const result: IapVerificationResult = {
      valid: false,
      error: 'Receipt expired',
    };
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Receipt expired');
  });
});

describe('PurchaseResult', () => {
  it('can represent a successful purchase', () => {
    const result: PurchaseResult = {
      success: true,
      purchase: {
        purchaseToken: 'tok_xyz',
        productId: 'com.kizola.protect.basic',
        platform: 'google',
        receipt: 'google-receipt',
        purchaseTime: '2026-07-01T12:00:00Z',
        autoRenewing: true,
      },
    };
    if (result.success) {
      expect(result.purchase.platform).toBe('google');
    }
  });

  it('can represent a cancelled purchase', () => {
    const result: PurchaseResult = {
      success: false,
      error: 'User cancelled',
      userCancelled: true,
    };
    if (!result.success) {
      expect(result.userCancelled).toBe(true);
    }
  });

  it('can represent a failed purchase', () => {
    const result: PurchaseResult = {
      success: false,
      error: 'Network error',
    };
    if (!result.success) {
      expect(result.error).toBe('Network error');
      expect(result.userCancelled).toBeUndefined();
    }
  });
});
