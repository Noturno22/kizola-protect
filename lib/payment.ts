import { Platform } from 'react-native';
import { PLANS } from './supabase';
import type { IapProduct, IapPurchase } from '@/services/iap/types';

/**
 * Payment module: Stripe (legacy/web) + IAP (Apple/Google).
 */
export interface CardData {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  cardholderName: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  message?: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
}

const SIMULATED_DELAY = 2000;

const generateTransactionId = (): string => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return '•••• •••• •••• ••••';
  const last4 = cleaned.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

export const validateCard = (card: CardData): { valid: boolean; error?: string } => {
  const cleanedNumber = card.cardNumber.replace(/\D/g, '');
  
  if (!cleanedNumber || cleanedNumber.length < 13 || cleanedNumber.length > 19) {
    return { valid: false, error: 'Invalid card number' };
  }

  if (!luhnCheck(cleanedNumber)) {
    return { valid: false, error: 'Invalid card number (failed Luhn check)' };
  }

  const expiryParts = card.expiryDate.split('/');
  if (expiryParts.length !== 2) {
    return { valid: false, error: 'Invalid expiry date format (use MM/YY)' };
  }

  const month = parseInt(expiryParts[0], 10);
  const year = parseInt(expiryParts[1], 10);
  
  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return { valid: false, error: 'Invalid expiry date' };
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, error: 'Card has expired' };
  }

  if (!card.cvc || card.cvc.length < 3 || card.cvc.length > 4) {
    return { valid: false, error: 'Invalid CVC' };
  }

  if (!card.cardholderName || card.cardholderName.trim().length < 2) {
    return { valid: false, error: 'Invalid cardholder name' };
  }

  return { valid: true };
};

const luhnCheck = (cardNumber: string): boolean => {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const getCardBrand = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  
  return 'Unknown';
};

export const processPayment = async (
  card: CardData,
  plan: PaymentPlan
): Promise<PaymentResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const validation = validateCard(card);
      
      if (!validation.valid) {
        resolve({
          success: false,
          error: validation.error,
          message: 'Payment failed',
        });
        return;
      }

      const cardNumber = card.cardNumber.replace(/\D/g, '');
      const last4 = cardNumber.slice(-4);
      const brand = getCardBrand(card.cardNumber);

      console.log(`[Stripe Mock] Processing payment:`);
      console.log(`  - Card: ${brand} ending in ${last4}`);
      console.log(`  - Amount: $${plan.price}/${plan.interval}`);
      console.log(`  - Plan: ${plan.name}`);

      const shouldSucceed = !cardNumber.startsWith('4000000000000002') &&
                           !cardNumber.startsWith('4000000000009995') &&
                           !cardNumber.startsWith('4000000000000069');

      if (shouldSucceed) {
        const transactionId = generateTransactionId();
        
        console.log(`[Stripe Mock] Payment successful!`);
        console.log(`  - Transaction ID: ${transactionId}`);
        
        resolve({
          success: true,
          transactionId,
          message: `Payment successful! You are now subscribed to the ${plan.name} plan.`,
        });
      } else {
        const errorCode = cardNumber.startsWith('4000000000009995') ? 'card_declined' : 'generic_decline';
        
        console.log(`[Stripe Mock] Payment failed: ${errorCode}`);
        
        resolve({
          success: false,
          error: 'Your card was declined. Please try a different card.',
          message: 'Payment failed',
        });
      }
    }, SIMULATED_DELAY);
  });
};

export const formatCardNumberInput = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

export const formatExpiryInput = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
};

export const getPlanPrice = (planId: string): number => {
  const plan = PLANS[planId as keyof typeof PLANS];
  return plan ? plan.price : 0;
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

// IAP product-to-plan mapping
export const IAP_PRODUCT_PLANS: Record<string, 'basic' | 'pro' | 'premium'> = {
  'com.kizola.protect.basic.monthly': 'basic',
  'com.kizola.protect.pro.monthly': 'pro',
  'com.kizola.protect.premium.monthly': 'premium',
  'kizola_protect_basic_monthly': 'basic',
  'kizola_protect_pro_monthly': 'pro',
  'kizola_protect_premium_monthly': 'premium',
};

export const PLAN_IAP_PRODUCTS: Record<'basic' | 'pro' | 'premium', string> = {
  basic: 'com.kizola.protect.basic.monthly',
  pro: 'com.kizola.protect.pro.monthly',
  premium: 'com.kizola.protect.premium.monthly',
};

export function resolvePlanFromProduct(productId: string): 'basic' | 'pro' | 'premium' | null {
  return IAP_PRODUCT_PLANS[productId] ?? null;
}

export function isPaidPlan(planId: string): boolean {
  return planId === 'basic' || planId === 'pro' || planId === 'premium';
}

export function getPaymentPlatform(): 'stripe' | 'iap' {
  return 'stripe';
}