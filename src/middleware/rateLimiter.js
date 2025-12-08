const rateLimit = require("express-rate-limit");
const config = require("../../config/config");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.windowAmount,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later.",
  },
});

// Stricter limiter for authentication routes (brute force protection)
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
