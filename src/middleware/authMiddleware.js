const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const logger = require("../utils/logger");

const authenticateToken = (req, res, next) => {
  // Get token only from HTTP-only cookies (most secure)
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const jwtSecret = config.jwt.jwtSecret;

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      logger.error("Token verification error:", err.message);
      return res.status(403).json({ error: "Invalid token." });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
