/**
 * Validators for auth routes.
 * All validation is done server-side to prevent client-side bypass.
 */

// Validates E.164 international phone format: +[country][number], 8–15 digits
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

/**
 * Validates and sanitizes a phone number.
 * @param {string} phone
 * @returns {{ valid: boolean; phone?: string; error?: string }}
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required.' };
  }

  // Remove spaces and dashes for normalization
  const cleaned = phone.replace(/[\s\-().]/g, '').trim();

  if (!PHONE_REGEX.test(cleaned)) {
    return {
      valid: false,
      error: 'Invalid phone number. Use international format (e.g. +2449XXXXXXX).',
    };
  }

  return { valid: true, phone: cleaned };
};

/**
 * Validates a 6-digit OTP code.
 * @param {string} code
 * @returns {{ valid: boolean; error?: string }}
 */
const validateCode = (code) => {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Verification code is required.' };
  }
  const cleaned = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(cleaned)) {
    return { valid: false, error: 'Verification code must be exactly 6 digits.' };
  }
  return { valid: true };
};

module.exports = { validatePhone, validateCode };
