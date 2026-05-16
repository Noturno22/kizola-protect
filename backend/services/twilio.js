const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

/**
 * Sends an OTP to the specified phone number.
 * @param {string} phone - The phone number in E.164 format.
 */
const sendOtp = async (phone) => {
  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: phone, channel: 'sms' });
    return verification;
  } catch (error) {
    console.error('Twilio Send OTP Error:', error);
    throw error;
  }
};

/**
 * Verifies the OTP for the specified phone number.
 * @param {string} phone - The phone number.
 * @param {string} code - The 6-digit OTP code.
 */
const verifyOtp = async (phone, code) => {
  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: phone, code });
    return verificationCheck;
  } catch (error) {
    console.error('Twilio Verify OTP Error:', error);
    throw error;
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};
