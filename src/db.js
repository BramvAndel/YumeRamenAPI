const mysql = require('mysql2');
require('dotenv').config();
const logger = require('./utils/logger');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test'
});

const connectDb = () => {
    connection.connect((err) => {
        if (err) {
            logger.log('Error connecting to the database: ' + err.stack);
            return;
        }
        logger.log('Successfully connected to the database as ID ' + connection.threadId);
    });
};

module.exports = { connection, connectDb };
