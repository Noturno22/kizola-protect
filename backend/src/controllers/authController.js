/**
 * Auth controller.
 * Handles POST /auth/send-code and POST /auth/verify-code.
 */

const { sendVerificationCode, checkVerificationCode } = require('../services/twilioService');
const { getOrCreateUserByPhone } = require('../services/supabaseService');
const { validatePhone, validateCode } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * POST /auth/send-code
 * Body: { phone: string }
 */
const sendCode = async (req, res, next) => {
  try {
    const { phone: rawPhone } = req.body;

    // Validate phone
    const { valid, phone, error } = validatePhone(rawPhone);
    if (!valid) {
      return res.status(400).json({ success: false, error });
    }

    // Send via Twilio Verify (no OTP stored server-side)
    const result = await sendVerificationCode(phone);

    logger.info('OTP sent successfully', { phone: phone.slice(0, 6) + '***' });

    return res.status(200).json({
      success: true,
      message: 'Verification code sent.',
      status: result.status,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/verify-code
 * Body: { phone: string, code: string }
 */
const verifyCode = async (req, res, next) => {
  try {
    const { phone: rawPhone, code: rawCode } = req.body;

    // Validate inputs
    const phoneValidation = validatePhone(rawPhone);
    if (!phoneValidation.valid) {
      return res.status(400).json({ success: false, error: phoneValidation.error });
    }

    const codeValidation = validateCode(rawCode);
    if (!codeValidation.valid) {
      return res.status(400).json({ success: false, error: codeValidation.error });
    }

    const { phone } = phoneValidation;
    const code = rawCode.replace(/\s/g, '');

    // Check code against Twilio Verify
    const { valid, status } = await checkVerificationCode(phone, code);

    if (!valid) {
      logger.warn('OTP verification failed', { phone: phone.slice(0, 6) + '***', status });
      return res.status(400).json({
        success: false,
        error: status === 'pending'
          ? 'Invalid code. Please check and try again.'
          : 'Verification code has expired. Please request a new one.',
        status,
      });
    }

    // OTP approved — get or create Supabase user and generate session token
    const { userId, accessToken, refreshToken, isNew } = await getOrCreateUserByPhone(phone);

    logger.info('User authenticated via phone', { userId, isNew });

    return res.status(200).json({
      success: true,
      userId,
      accessToken,
      refreshToken,
      isNew,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendCode, verifyCode };
