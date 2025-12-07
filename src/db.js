const mysql = require("mysql2/promise");
const logger = require("./utils/logger");
const config = require("../config/config");

let connection;

const connectDb = async () => {
  try {
    connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
    });
    logger.log(
      "Successfully connected to the database as ID " + connection.threadId
    );
    return connection;
  } catch (error) {
    logger.log("Error connecting to the database: " + error.stack);
    throw error;
  }
};

const getConnection = () => {
  if (!connection) {
    throw new Error(
      "Database connection not initialized. Call connectDb() first."
    );
  }
  return connection;
};

module.exports = { getConnection, connectDb };
