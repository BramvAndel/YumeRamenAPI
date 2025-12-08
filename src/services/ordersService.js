const { getConnection } = require("../db");
const logger = require("../utils/logger");
const { isValidQuantity } = require("../utils/validation");

/**
 * Orders Service - Business logic for order operations
 */

/**
 * Retrieves all orders with their associated items
 * @async
 * @returns {Promise<Array>} Array of order objects with nested items
 */
const getAllOrders = async () => {
  const connection = await getConnection();
  try {
    const query = `
      SELECT o.*, oi.dishID, oi.aantal, d.Name as DishName, d.Price as DishPrice
      FROM orders o
      LEFT JOIN order_items oi ON o.OrderID = oi.orderID
      LEFT JOIN dishes d ON oi.dishID = d.DishID
    `;

    const [results] = await connection.query(query);

    const ordersMap = new Map();

    results.forEach((row) => {
      if (!ordersMap.has(row.OrderID)) {
        const { dishID, aantal, DishName, DishPrice, ...orderData } = row;
        ordersMap.set(row.OrderID, {
          ...orderData,
          items: [],
        });
      }

      if (row.dishID) {
        ordersMap.get(row.OrderID).items.push({
          dishID: row.dishID,
          quantity: row.aantal,
          name: row.DishName,
          price: row.DishPrice,
        });
      }
    });

    return Array.from(ordersMap.values());
  } finally {
    await connection.release();
  }
};

/**
 * Retrieves a single order by ID with its items
 * @async
 * @param {number} orderId - Order ID
 * @returns {Promise<Object|null>} Order object with items or null if not found
 */
const getOrderById = async (orderId) => {
  const connection = await getConnection();
  try {
    const query = "SELECT * FROM orders WHERE OrderID = ?";
    const [results] = await connection.query(query, [orderId]);

    if (results.length === 0) {
      return null;
    }

    const order = results[0];

    // Fetch items for this order
    const itemsQuery = `
      SELECT oi.dishID, oi.aantal, d.Name, d.Price 
      FROM order_items oi
      JOIN dishes d ON oi.dishID = d.DishID
      WHERE oi.orderID = ?
    `;

    const [items] = await connection.query(itemsQuery, [orderId]);
    order.items = items;

    return order;
  } finally {
    await connection.release();
  }
};

/**
 * Creates a new order for a user
 * @async
 * @param {number} userId - User ID
 * @param {Object} orderData - Order data
 * @param {Array<Object>} orderData.items - Array of items {dishID, quantity}
 * @param {string} [orderData.delivery_address] - Delivery address
 * @param {boolean} [orderData.paid] - Payment status
 * @returns {Promise<number>} New order ID
 * @throws {Error} Validation errors
 */
const createOrder = async (userId, orderData) => {
  const { items, delivery_address, paid } = orderData;

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  // Validate quantities
  for (const item of items) {
    if (!isValidQuantity(item.quantity)) {
      throw new Error(`Invalid quantity for dishID ${item.dishID}`);
    }
  }

  const connection = await getConnection();
  try {
    // Validate that all dishes exist
    const uniqueDishIds = [
      ...new Set(items.map((item) => parseInt(item.dishID))),
    ];

    const checkDishesQuery = "SELECT DishID FROM dishes WHERE DishID IN (?)";
    const [existingDishes] = await connection.query(checkDishesQuery, [
      uniqueDishIds,
    ]);

    if (existingDishes.length !== uniqueDishIds.length) {
      const foundIds = existingDishes.map((d) => d.DishID);
      const missingIds = uniqueDishIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Dishes not found: ${missingIds.join(", ")}`);
    }

    // Start transaction
    await connection.beginTransaction();

    try {
      // Create local timestamp for Ordered_at
      const now = new Date();
      const offsetMs = now.getTimezoneOffset() * 60000;
      const localDate = new Date(now.getTime() - offsetMs);
      const orderedAt = localDate.toISOString().slice(0, 19).replace("T", " ");

      const orderQuery =
        "INSERT INTO orders (UserID, delivery_address, Paid, Ordered_at) VALUES (?, ?, ?, ?)";
      const [orderResults] = await connection.query(orderQuery, [
        userId,
        delivery_address,
        paid ? 1 : 0,
        orderedAt,
      ]);

      const orderId = orderResults.insertId;
      const orderItems = items.map((item) => [
        orderId,
        parseInt(item.dishID),
        parseInt(item.quantity) || 1,
      ]);

      logger.log(
        "Mapped order items for DB insertion:",
        JSON.stringify(orderItems)
      );

      const itemsQuery =
        "INSERT INTO order_items (orderID, dishID, aantal) VALUES ?";
      await connection.query(itemsQuery, [orderItems]);

      await connection.commit();
      logger.log("Order created successfully with items. OrderID:", orderId);

      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } finally {
    await connection.release();
  }
};

/**
 * Updates an order's status and/or payment status
 * @async
 * @param {number} orderId - Order ID
 * @param {Object} updateData - Fields to update
 * @param {string} [updateData.Status] - New status (ordered/processing/delivering/completed)
 * @param {boolean} [updateData.Paid] - Payment status
 * @returns {Promise<boolean>} True if updated successfully
 * @throws {Error} If no fields provided or order not found
 */
const updateOrder = async (orderId, updateData) => {
  const { Status, Paid } = updateData;

  let fields = [];
  let values = [];

  if (Status !== undefined) {
    fields.push("Status = ?");
    values.push(Status);

    // Calculate local timestamp
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - offsetMs);
    const localTimestamp = localDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Automatically update timestamps based on status change
    if (Status === "processing") {
      fields.push("processing_at = ?");
      values.push(localTimestamp);
    } else if (Status === "delivering") {
      fields.push("Delivering_at = ?");
      values.push(localTimestamp);
    } else if (Status === "completed") {
      fields.push("Completed_at = ?");
      values.push(localTimestamp);
    }
  }

  if (Paid !== undefined) {
    fields.push("Paid = ?");
    values.push(Paid);
  }

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  values.push(orderId);

  const connection = await getConnection();
  try {
    const query = `UPDATE orders SET ${fields.join(", ")} WHERE OrderID = ?`;
    const [results] = await connection.query(query, values);

    if (results.affectedRows === 0) {
      throw new Error("Order not found");
    }

    return true;
  } finally {
    await connection.release();
  }
};

/**
 * Deletes an order by ID
 * @async
 * @param {number} orderId - Order ID to delete
 * @returns {Promise<boolean>} True if deleted successfully
 * @throws {Error} If order not found
 */
const deleteOrder = async (orderId) => {
  const connection = await getConnection();
  try {
    const query = "DELETE FROM orders WHERE OrderID = ?";
    const [results] = await connection.query(query, [orderId]);

    if (results.affectedRows === 0) {
      throw new Error("Order not found");
    }

    return true;
  } finally {
    await connection.release();
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
