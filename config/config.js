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
    jwtSecret: process.env.JWT_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    version: process.env.VERSION,
  };
  logger.log("Configuration loaded successfully");
} catch (error) {
  console.error("Error loading configuration:", error);
  process.exit(1);
}

module.exports = config;
