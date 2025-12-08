const logger = require('../utils/logger');

/**
 * Global error handling middleware for Express
 * Logs errors server-side and returns appropriate error responses to clients
 * @param {Error} err - Error object
 * @param {string} [err.message] - Error message
 * @param {string} [err.stack] - Error stack trace
 * @param {string} [err.name] - Error type name
 * @param {number} [err.statusCode] - HTTP status code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Sends error response to client
 * @example
 * // Usage in app.js:
 * app.use(errorHandler);
 */
const errorHandler = (err, req, res, next) => {
    // Log the full error details server-side
    logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

    // If headers are already sent, delegate to the default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Invalid token' });
    }

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // In production, don't expose internal error details for 500s
    const isProduction = process.env.NODE_ENV === 'production';
    const message = (isProduction && statusCode === 500) 
        ? 'Internal Server Error' 
        : (err.message || 'Internal Server Error');

    res.status(statusCode).json({
        error: message
    });
}

module.exports = errorHandler;