/**
 * Auth routes.
 */

const express = require('express');
const router = express.Router();
const { sendCode, verifyCode } = require('../controllers/authController');
const { sendCodeLimiter, verifyCodeLimiter } = require('../middleware/rateLimiter');

// POST /auth/send-code
router.post('/send-code', sendCodeLimiter, sendCode);

// POST /auth/verify-code
router.post('/verify-code', verifyCodeLimiter, verifyCode);

module.exports = router;
