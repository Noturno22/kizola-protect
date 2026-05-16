/**
 * Simple structured logger for the backend.
 * Avoids logging sensitive data (tokens, passwords).
 */

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = process.env.NODE_ENV === 'production' ? 1 : 3;

const format = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const safeMsg = typeof message === 'string' ? message : JSON.stringify(message);
  return JSON.stringify({ timestamp, level, message: safeMsg, ...meta });
};

const logger = {
  error: (msg, meta) => LOG_LEVELS.error <= CURRENT_LEVEL && console.error(format('error', msg, meta)),
  warn:  (msg, meta) => LOG_LEVELS.warn  <= CURRENT_LEVEL && console.warn(format('warn',  msg, meta)),
  info:  (msg, meta) => LOG_LEVELS.info  <= CURRENT_LEVEL && console.log(format('info',   msg, meta)),
  debug: (msg, meta) => LOG_LEVELS.debug <= CURRENT_LEVEL && console.log(format('debug',  msg, meta)),
};

module.exports = logger;
