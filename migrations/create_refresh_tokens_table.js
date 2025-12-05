const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to database.');

  const query = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
        token VARCHAR(255) PRIMARY KEY,
        userID INT(11) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
    );
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error creating refresh_tokens table:', err);
    } else {
      console.log('Table "refresh_tokens" created successfully.');
    }
    connection.end();
  });
});
