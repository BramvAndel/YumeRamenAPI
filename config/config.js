require("dotenv").config();
const logger = require("../src/utils/logger");

let config;

/**
 * Application configuration object loaded from environment variables
 * @type {Object}
 * @property {string} port - Server port number
 * @property {Object} db - Database configuration
 * @property {string} db.host - Database host
 * @property {string} db.user - Database user
 * @property {string} db.password - Database password
 * @property {string} db.database - Database name
 * @property {Object} jwt - JWT configuration
 * @property {number} jwt.jwtAccessTokenExpoTime - Access token expiration time in milliseconds
 * @property {number} jwt.jwtRefreshTokenExpoTime - Refresh token expiration time in milliseconds
 * @property {string} jwt.jwtSecret - JWT secret for access tokens
 * @property {string} jwt.refreshTokenSecret - JWT secret for refresh tokens
 * @property {Object} rateLimit - Rate limiting configuration
 * @property {number} rateLimit.windowAmount - Max requests per window for general API
 * @property {number} rateLimit.windowMs - Time window in milliseconds
 * @property {number} rateLimit.authAmount - Max auth attempts per window
 * @property {number} rateLimit.authTime - Auth rate limit time window
 * @property {string} maxFileSizeMB - Maximum file upload size in MB
 */
try {
  config = {
    port: process.env.PORT,
    db: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    jwt: {
      jwtAccessTokenExpoTime: 15 * 60 * 1000, // 15 min
      jwtRefreshTokenExpoTime: 7 * 24 * 60 * 60 * 1000, // 7 days
      jwtSecret: process.env.JWT_SECRET,
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    },
    rateLimit: {
      windowAmount: 1000,
      windowMs: 15 * 60 * 1000, // 15 min
      authAmount: 3,
      authTime: 15 * 60 * 1000, // min
    },
    maxFileSizeMB: process.env.MAX_MB_FILE_SIZE,
  };
  logger.log("Configuration loaded successfully");
} catch (error) {
  console.error("Error loading configuration:", error);
  process.exit(1);
}

module.exports = config;
