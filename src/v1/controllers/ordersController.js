const logger = require("../../common/logger");
const ordersService = require("../services/ordersService");
const { emitOrderStatusUpdate, emitNewOrder } = require("../websocket");

/**
 * Retrieves all orders with their associated items and dish details
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns JSON array of orders with nested items
 * @example
 * // Response:
 * [{ "OrderID": 1, "UserID": 1, "Status": "ordered", "items": [{ "dishID": 1, "quantity": 2, ... }] }]
 */
const getAllOrders = async (req, res, next) => {
  try {
    logger.log("Get all orders endpoint called");
    const orders = await ordersService.getAllOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single order by ID with its items and dish details
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Order ID to retrieve
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns JSON object with order and items or 404 if not found
 * @example
 * // Response:
 * { "OrderID": 1, "UserID": 1, "items": [{ "dishID": 1, "aantal": 2, "Name": "Ramen" }] }
 */
const getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;
    logger.log(`Get order by ID endpoint called for ID: ${id}`);

    const order = await ordersService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new order for the authenticated user with multiple items
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array<Object>} req.body.items - Array of order items
 * @param {number} req.body.items[].dishID - ID of the dish to order
 * @param {number} req.body.items[].quantity - Quantity of the dish
 * @param {string} [req.body.delivery_address] - Delivery address for the order
 * @param {boolean} [req.body.paid] - Whether the order is paid
 * @param {Object} req.user - Authenticated user from JWT
 * @param {number} req.user.userId - User ID from token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message with new order ID
 * @example
 * // Request body:
 * { "items": [{ "dishID": 1, "quantity": 2 }, { "dishID": 3, "quantity": 1 }], "delivery_address": "123 Main St" }
 * // Response:
 * { "message": "Order created", "orderId": 1 }
 */
const createOrder = async (req, res, next) => {
  try {
    logger.log("Create order endpoint called");

    const userID = req.user.userId;
    const { items, delivery_address, paid } = req.body;

    logger.log(
      "Received order payload:",
      JSON.stringify({ items, delivery_address, paid })
    );

    const orderId = await ordersService.createOrder(userID, {
      items,
      delivery_address,
      paid,
    });

    // Emit real-time event for new order
    emitNewOrder({
      orderId,
      userID,
      items,
      delivery_address,
      paid,
    });

    res.status(201).json({ message: "Order created", orderId });
  } catch (error) {
    if (
      error.message.includes("required") ||
      error.message.includes("Invalid") ||
      error.message.includes("must contain") ||
      error.message.includes("not found")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Updates order status and/or payment status. Automatically sets timestamp fields based on status.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Order ID to update
 * @param {Object} req.body - Request body with fields to update
 * @param {string} [req.body.Status] - New order status (ordered/processing/delivering/completed)
 * @param {boolean} [req.body.Paid] - Payment status
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message
 * @example
 * // Request body:
 * { "Status": "processing" }
 * // Response:
 * { "message": "Order updated successfully" }
 */
const updateOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { Status, Paid } = req.body;

    logger.log(`Update order endpoint called for ID: ${id}`);

    await ordersService.updateOrder(id, { Status, Paid });

    // Emit real-time event for order status update
    if (Status) {
      emitOrderStatusUpdate(id, Status);
    }

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    if (error.message.includes("No fields")) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Order not found") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Deletes an order by ID
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Order ID to delete
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message or 404 if order not found
 * @example
 * // Response:
 * { "message": "Order deleted successfully" }
 */
const deleteOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    logger.log(`Delete order endpoint called for ID: ${id}`);

    await ordersService.deleteOrder(id);

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    if (error.message === "Order not found") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
