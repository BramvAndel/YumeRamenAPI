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


// TODO: betalingen confirm backend implementeren
// TODO: input validation toevoegen (bijv. met Joi of express-validator)