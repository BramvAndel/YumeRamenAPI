const rateLimit = require("express-rate-limit");
const config = require("../../config/config");

/**
 * General API rate limiter middleware
 * Limits requests based on configuration settings
 * @type {Function}
 * @example
 * // Usage in app.js:
 * app.use('/api', apiLimiter);
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.windowAmount,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later.",
  },
});

/**
 * Stricter rate limiter for authentication routes to prevent brute force attacks
 * @type {Function}
 * @example
 * // Usage in routes:
 * router.post('/login', authLimiter, login);
 */
const authLimiter = rateLimit({
  windowMs: config.rateLimit.authTime,
  limit: config.rateLimit.authAmount,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts, please try again later.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
