const mysql = require("mysql2/promise");
const logger = require("./utils/logger");
const config = require("../config/config");

let pool;

/**
 * Creates and initializes a MySQL connection pool
 * @async
 * @returns {Promise<Object>} MySQL connection pool instance
 * @throws {Error} If pool creation fails
 * @example
 * await connectDb();
 */
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

/**
 * Gets a connection from the MySQL pool
 * @async
 * @returns {Promise<Object>} MySQL connection object (must be released after use)
 * @throws {Error} If pool is not initialized
 * @example
 * const connection = await getConnection();
 * try {
 *   const [results] = await connection.query('SELECT * FROM users');
 * } finally {
 *   await connection.release();
 * }
 */
const getConnection = async () => {
  if (!pool) {
    throw new Error("Database pool not initialized. Call connectDb() first.");
  }
  return await pool.getConnection();
};

module.exports = { getConnection, connectDb };
