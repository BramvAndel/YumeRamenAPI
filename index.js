require('dotenv').config();
const app = require('./src/app');
const { connectDb } = require('./src/db');
const logger = require('./src/utils/logger');


const PORT = process.env.PORT || 3000;

// Connect to Database
connectDb();

// Start Server
app.listen(PORT, () => {
  logger.log(`Server is running on port ${PORT}`);
});


// TODO: implement websockets for real-time features

// improvements:
// - connection pooling for database
// - service layer between controllers and db
// - promise-based db queries
// - centrelized config
// - use security headers with helmet