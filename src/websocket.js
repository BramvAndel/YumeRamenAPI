const { Server } = require("socket.io");

let io;

function initWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("WebSocket client connected", socket.id);

    // Example: join a room for order updates
    socket.on("joinOrderRoom", (orderId) => {
      socket.join(`order_${orderId}`);
    });

    // Example: leave a room
    socket.on("leaveOrderRoom", (orderId) => {
      socket.leave(`order_${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket client disconnected", socket.id);
    });
  });
}

function emitOrderStatusUpdate(orderId, status) {
  if (io) {
    io.to(`order_${orderId}`).emit("order:statusUpdate", { orderId, status });
  }
}

function emitNewOrder(order) {
  if (io) {
    io.emit("order:new", order);
  }
}

module.exports = {
  initWebSocket,
  emitOrderStatusUpdate,
  emitNewOrder,
};
