const mysql = require("mysql2/promise");
const logger = require("./utils/logger");
const config = require("../config/config");

let pool;

const connectDb = async () => {
  try {
    pool = await mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    logger.log("Database pool created successfully with connection pooling");
    return pool;
  } catch (error) {
    logger.log("Error creating database pool: " + error.stack);
    throw error;
  }
};

const getConnection = async () => {
  if (!pool) {
    throw new Error("Database pool not initialized. Call connectDb() first.");
  }
  return await pool.getConnection();
};

module.exports = { getConnection, connectDb };
