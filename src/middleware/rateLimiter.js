const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 1000000000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: 'Too many requests, please try again later.'
    }
});

// Stricter limiter for authentication routes (brute force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 login attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many login attempts, please try again later.'
    }
});

module.exports = {
    apiLimiter,
    authLimiter
};
