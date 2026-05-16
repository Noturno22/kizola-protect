/**
 * Twilio Verify service.
 * Uses Twilio Verify API exclusively — no manual OTP storage.
 */

const twilio = require('twilio');
const logger = require('../utils/logger');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!VERIFY_SERVICE_SID) {
  logger.error('TWILIO_VERIFY_SERVICE_SID is not set. Twilio Verify will fail.');
}

/**
 * Sends an OTP to the given phone via Twilio Verify.
 * @param {string} phone - E.164 formatted phone number
 * @returns {Promise<{ sid: string; status: string }>}
 */
const sendVerificationCode = async (phone) => {
  const verification = await client.verify.v2
    .services(VERIFY_SERVICE_SID)
    .verifications.create({ to: phone, channel: 'sms' });

  logger.info('Twilio verification sent', { phone: phone.slice(0, 6) + '***', sid: verification.sid });

  return { sid: verification.sid, status: verification.status };
};

/**
 * Checks an OTP code against Twilio Verify.
 * @param {string} phone - E.164 formatted phone number
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<{ valid: boolean; status: string }>}
 */
const checkVerificationCode = async (phone, code) => {
  const check = await client.verify.v2
    .services(VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: phone, code });

  logger.info('Twilio verification check', { phone: phone.slice(0, 6) + '***', status: check.status });

  return { valid: check.status === 'approved', status: check.status };
};

module.exports = { sendVerificationCode, checkVerificationCode };
