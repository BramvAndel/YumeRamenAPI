const appV1 = require("./src/v1/app");
const { connectDb } = require("./src/db");
const logger = require("./src/utils/logger");
const config = require("./config/config");
const { initWebSocket } = require("./src/websocket");
const http = require("http");

const PORT = config.port;

// Connect to Database and Start Server
connectDb()
  .then(() => {
    // Start Server only after database connection is established
    const server = http.createServer(appV1);

    // Initialize WebSocket server
    initWebSocket(server);
    server.listen(PORT, () => {
      logger.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.log("Failed to connect to database:", error);
    process.exit(1);
  });

// WebSocket features:
// - real-time order status updates
// - real-time order received notifications (when a client places an order, show the order on the dashboard in real-time)

// improvements:
// - service layer between controllers and db
