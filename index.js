const app = require("./src/app");
const { connectDb } = require("./src/db");
const logger = require("./src/utils/logger");
const config = require("./config/config");

const PORT = config.port;

// Connect to Database and Start Server
connectDb()
  .then(() => {
    // Start Server only after database connection is established
    app.listen(PORT, () => {
      logger.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.log("Failed to connect to database:", error);
    process.exit(1);
  });

// TODO: implement websockets for real-time features

// possible websocket features:
// - real-time order status updates

// improvements:
// - service layer between controllers and db
