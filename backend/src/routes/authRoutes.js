/**
 * Auth routes.
 */

const express = require('express');
const router = express.Router();
const { sendCode, verifyCode } = require('../controllers/authController');
const { createProfile } = require('../controllers/profileController');
const { sendCodeLimiter, verifyCodeLimiter } = require('../middleware/rateLimiter');

// POST /auth/send-code
router.post('/send-code', sendCodeLimiter, sendCode);

// POST /auth/verify-code
router.post('/verify-code', verifyCodeLimiter, verifyCode);

// POST /auth/create-profile — upserts a profile row using the service role key
// Requires Authorization: Bearer <access_token> and body { userId, email?, fullName? }
router.post('/create-profile', createProfile);

module.exports = router;
