/**
 * Global error handler middleware.
 * Must be registered LAST in the Express app.
 */

const logger = require('../utils/logger');

// Map Twilio error codes to user-friendly messages
const TWILIO_ERROR_MESSAGES = {
  60200: 'Invalid phone number format.',
  60202: 'Max send attempts reached. Please try again later.',
  60203: 'Max check attempts reached. Please request a new code.',
  60212: 'Phone number is not reachable.',
  20003: 'Authentication failed. Check server credentials.',
  60410: 'Invalid verification code.',
};

const errorHandler = (err, req, res, next) => {
  // Twilio errors have a numeric `status` and `code`
  if (err.status && err.code && TWILIO_ERROR_MESSAGES[err.code]) {
    logger.warn('Twilio API error', { code: err.code, status: err.status });
    return res.status(400).json({
      success: false,
      error: TWILIO_ERROR_MESSAGES[err.code],
      code: err.code,
    });
  }

  // Supabase errors
  if (err.message && err.__isAuthError) {
    logger.warn('Supabase auth error', { msg: err.message });
    return res.status(400).json({ success: false, error: err.message });
  }

  // Generic fallback
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'An internal server error occurred.';

  logger.error('Unhandled error', { status, msg: err.message, stack: err.stack });

  res.status(status).json({ success: false, error: message });
};

module.exports = errorHandler;
