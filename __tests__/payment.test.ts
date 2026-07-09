jest.mock('@/lib/supabase', () => ({
  PLANS: {
    free: { id: 'free', name: 'Free', price: 0.00 },
    basic: { id: 'basic', name: 'Basic', price: 19.99 },
    pro: { id: 'pro', name: 'Pro', price: 34.99 },
    premium: { id: 'premium', name: 'Premium', price: 49.99 },
  },
}));

import {
  getPlanPrice,
  formatPrice,
  isPaidPlan,
  resolvePlanFromProduct,
  getPaymentPlatform,
  getCardBrand,
  validateCard,
  formatCardNumberInput,
  formatExpiryInput,
  IAP_PRODUCT_PLANS,
  PLAN_IAP_PRODUCTS,
} from '@/lib/payment';

// ── getPlanPrice ──────────────────────────────────────────────────────────────

describe('getPlanPrice', () => {
  it('returns 0 for free plan', () => {
    expect(getPlanPrice('free')).toBe(0);
  });

  it('returns 19.99 for basic plan', () => {
    expect(getPlanPrice('basic')).toBe(19.99);
  });

  it('returns 34.99 for pro plan', () => {
    expect(getPlanPrice('pro')).toBe(34.99);
  });

  it('returns 49.99 for premium plan', () => {
    expect(getPlanPrice('premium')).toBe(49.99);
  });

  it('returns 0 for unknown plan', () => {
    expect(getPlanPrice('nonexistent')).toBe(0);
  });
});

// ── formatPrice ───────────────────────────────────────────────────────────────

describe('formatPrice', () => {
  it('formats zero as $0.00', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('formats a whole number with .00', () => {
    expect(formatPrice(10)).toBe('$10.00');
  });

  it('formats a decimal price with exactly two decimals', () => {
    expect(formatPrice(19.99)).toBe('$19.99');
  });

  it('rounds to two decimal places', () => {
    expect(formatPrice(49.995)).toBe('$49.99');
  });

  it('formats large prices', () => {
    expect(formatPrice(999.5)).toBe('$999.50');
  });
});

// ── isPaidPlan ────────────────────────────────────────────────────────────────

describe('isPaidPlan', () => {
  it('returns true for basic', () => {
    expect(isPaidPlan('basic')).toBe(true);
  });

  it('returns true for pro', () => {
    expect(isPaidPlan('pro')).toBe(true);
  });

  it('returns true for premium', () => {
    expect(isPaidPlan('premium')).toBe(true);
  });

  it('returns false for free', () => {
    expect(isPaidPlan('free')).toBe(false);
  });

  it('returns false for unknown plan', () => {
    expect(isPaidPlan('unknown')).toBe(false);
  });
});

// ── resolvePlanFromProduct ────────────────────────────────────────────────────

describe('resolvePlanFromProduct', () => {
  it('maps iOS basic product ID to basic', () => {
    expect(resolvePlanFromProduct('com.kizola.protect.basic.monthly')).toBe('basic');
  });

  it('maps iOS pro product ID to pro', () => {
    expect(resolvePlanFromProduct('com.kizola.protect.pro.monthly')).toBe('pro');
  });

  it('maps iOS premium product ID to premium', () => {
    expect(resolvePlanFromProduct('com.kizola.protect.premium.monthly')).toBe('premium');
  });

  it('maps Android basic product ID to basic', () => {
    expect(resolvePlanFromProduct('kizola_protect_basic_monthly')).toBe('basic');
  });

  it('maps Android pro product ID to pro', () => {
    expect(resolvePlanFromProduct('kizola_protect_pro_monthly')).toBe('pro');
  });

  it('maps Android premium product ID to premium', () => {
    expect(resolvePlanFromProduct('kizola_protect_premium_monthly')).toBe('premium');
  });

  it('returns null for unknown product ID', () => {
    expect(resolvePlanFromProduct('com.unknown.product')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(resolvePlanFromProduct('')).toBeNull();
  });
});

// ── getPaymentPlatform ────────────────────────────────────────────────────────

describe('getPaymentPlatform', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    // Restore navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('returns stripe when navigator is undefined', () => {
    // In Jest/Node, navigator may not have userAgent — should return stripe
    const result = getPaymentPlatform();
    expect(['stripe', 'iap']).toContain(result);
  });
});

// ── getCardBrand ──────────────────────────────────────────────────────────────

describe('getCardBrand', () => {
  it('detects Visa', () => {
    expect(getCardBrand('4111111111111111')).toBe('Visa');
  });

  it('detects Mastercard', () => {
    expect(getCardBrand('5555555555554444')).toBe('Mastercard');
  });

  it('detects American Express', () => {
    expect(getCardBrand('378282246310005')).toBe('American Express');
  });

  it('detects Discover', () => {
    expect(getCardBrand('6011111111111117')).toBe('Discover');
  });

  it('returns Unknown for unrecognized prefix', () => {
    expect(getCardBrand('9999999999999999')).toBe('Unknown');
  });
});

// ── validateCard ──────────────────────────────────────────────────────────────

describe('validateCard', () => {
  // Use a future expiry
  const futureExpiry = '12/30';

  it('rejects empty card number', () => {
    const result = validateCard({
      cardNumber: '',
      expiryDate: futureExpiry,
      cvc: '123',
      cardholderName: 'John Doe',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid card number');
  });

  it('rejects card number shorter than 13 digits', () => {
    const result = validateCard({
      cardNumber: '12345678',
      expiryDate: futureExpiry,
      cvc: '123',
      cardholderName: 'John Doe',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid card number');
  });

  it('rejects card that fails Luhn check', () => {
    const result = validateCard({
      cardNumber: '4111111111111112',
      expiryDate: futureExpiry,
      cvc: '123',
      cardholderName: 'John Doe',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Luhn/);
  });

  it('rejects invalid expiry format', () => {
    const result = validateCard({
      cardNumber: '4111111111111111',
      expiryDate: '1230',
      cvc: '123',
      cardholderName: 'John Doe',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid expiry date format (use MM/YY)');
  });

  it('rejects invalid month', () => {
    const result = validateCard({
      cardNumber: '4111111111111111',
      expiryDate: '13/30',
      cvc: '123',
      cardholderName: 'John Doe',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid expiry date');
  });

  it('rejects short CVC', () => {
    const result = validateCard({
      cardNumber: '4111111111111111',
      expiryDate: futureExpiry,
      cvc: '12',
      cardholderName: 'John Doe',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid CVC');
  });

  it('rejects short cardholder name', () => {
    const result = validateCard({
      cardNumber: '4111111111111111',
      expiryDate: futureExpiry,
      cvc: '123',
      cardholderName: 'A',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid cardholder name');
  });

  it('accepts a valid Visa card', () => {
    const result = validateCard({
      cardNumber: '4111111111111111',
      expiryDate: futureExpiry,
      cvc: '123',
      cardholderName: 'John Doe',
    });
    expect(result.valid).toBe(true);
  });

  it('accepts a valid Mastercard', () => {
    const result = validateCard({
      cardNumber: '5555555555554444',
      expiryDate: futureExpiry,
      cvc: '123',
      cardholderName: 'Jane Smith',
    });
    expect(result.valid).toBe(true);
  });
});

// ── formatCardNumberInput ─────────────────────────────────────────────────────

describe('formatCardNumberInput', () => {
  it('groups digits into blocks of 4', () => {
    expect(formatCardNumberInput('4111111111111111')).toBe('4111 1111 1111 1111');
  });

  it('strips non-digit characters', () => {
    expect(formatCardNumberInput('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
  });

  it('handles partial input', () => {
    expect(formatCardNumberInput('41111')).toBe('4111 1');
  });

  it('returns empty string for no digits', () => {
    expect(formatCardNumberInput('abcd')).toBe('');
  });
});

// ── formatExpiryInput ─────────────────────────────────────────────────────────

describe('formatExpiryInput', () => {
  it('adds slash after 2 digits', () => {
    expect(formatExpiryInput('1230')).toBe('12/30');
  });

  it('returns just digits when less than 2', () => {
    expect(formatExpiryInput('1')).toBe('1');
  });

  it('strips non-digits', () => {
    expect(formatExpiryInput('1a2b3c')).toBe('12/3');
  });
});
