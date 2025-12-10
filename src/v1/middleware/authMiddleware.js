const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const logger = require("../../common/logger");

/**
 * Middleware to authenticate requests using JWT token from HTTP-only cookies
 * @param {Object} req - Express request object
 * @param {Object} req.cookies - HTTP cookies
 * @param {string} req.cookies.accessToken - JWT access token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() if authenticated, otherwise returns 401/403 error
 * @example
 * // Usage in routes:
 * router.get('/protected', authenticateToken, (req, res) => {
 *   console.log(req.user); // { userId, email, role }
 * });
 */
const authenticateToken = (req, res, next) => {
  // Get token only from HTTP-only cookies (most secure)
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const jwtSecret = config.jwt.jwtSecret;

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      logger.error("Token verification error", { message: err.message, stack: err.stack });
      return res.status(403).json({ error: "Invalid token." });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
