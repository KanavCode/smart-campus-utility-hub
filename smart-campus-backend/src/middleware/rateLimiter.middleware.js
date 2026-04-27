const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Applied to all /api routes by default
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * Strict Auth Rate Limiter
 * Specifically for login and register endpoints to prevent brute-force attacks
 */
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5, // 5 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  // We want to limit both failed and successful attempts to prevent account enumeration 
  // and brute-force even if they manage to get a correct password eventually
  skipSuccessfulRequests: false, 
});

module.exports = {
  apiLimiter,
  authLimiter,
};
