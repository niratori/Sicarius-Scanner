require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  zap: {
    apiUrl: process.env.ZAP_API_URL || 'http://localhost:8080',
    apiKey: process.env.ZAP_API_KEY || '',
    spiderTimeoutMs: Number(process.env.ZAP_SPIDER_TIMEOUT_MS) || 72000000,
    activeScanTimeoutMs: Number(process.env.ZAP_ACTIVE_SCAN_TIMEOUT_MS) || 72000000,
    pollIntervalMs: Number(process.env.ZAP_POLL_INTERVAL_MS) || 3000,
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
  },
};
