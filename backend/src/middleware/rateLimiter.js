/**
 * Rate limiting middleware.
 * Protects /auth/send-code and /auth/verify-code from spam/brute-force.
 */

const rateLimit = require('express-rate-limit');

const onLimitReached = (req, res) => {
  res.status(429).json({
    success: false,
    error: 'Too many requests. Please wait before trying again.',
  });
};

/** Strict limiter for sending OTP — max 5 requests per 10 minutes per IP */
const sendCodeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached,
});

/** Limiter for verifying OTP — max 10 attempts per 10 minutes per IP */
const verifyCodeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimitReached,
});

module.exports = { sendCodeLimiter, verifyCodeLimiter };
