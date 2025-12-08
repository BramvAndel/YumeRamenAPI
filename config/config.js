require("dotenv").config();
const logger = require("../src/utils/logger");

let config;

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
  };
  logger.log("Configuration loaded successfully");
} catch (error) {
  console.error("Error loading configuration:", error);
  process.exit(1);
}

module.exports = config;
