/**
 * Backend entry point.
 * Express server with Twilio Verify + Supabase auth.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// --- Validate required env vars at startup ---
const REQUIRED_ENV = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_VERIFY_SERVICE_SID',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// --- App setup ---
const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// CORS — in production, restrict to your app domain
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://kizola.app'] // replace with your domain
    : '*',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// HTTP request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// Global error handler (must be last)
app.use(errorHandler);

// --- Start ---
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Kizola Auth Backend running on port ${PORT}`, {
    env: process.env.NODE_ENV || 'development',
    url: `http://192.168.0.192:${PORT}`,
  });
});

module.exports = app;
