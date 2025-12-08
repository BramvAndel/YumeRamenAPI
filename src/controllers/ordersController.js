const { getConnection } = require("../db");
const logger = require("../utils/logger");

const getAllOrders = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    logger.log("Get all orders endpoint called");

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

    res.json(Array.from(ordersMap.values()));
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const getOrderById = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const id = req.params.id;
    logger.log(`Get order by ID endpoint called for ID: ${id}`);

    const query = "SELECT * FROM orders WHERE OrderID = ?";
    const [results] = await connection.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = results[0];

    // Fetch items for this order
    const itemsQuery = `
            SELECT oi.dishID, oi.aantal, d.Name, d.Price 
            FROM order_items oi
            JOIN dishes d ON oi.dishID = d.DishID
            WHERE oi.orderID = ?
        `;

    const [items] = await connection.query(itemsQuery, [id]);
    order.items = items;
    res.json(order);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const createOrder = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    logger.log("Create order endpoint called");
    logger.log("User from token:", req.user); // Debug log

    // Use the authenticated user's ID
    const userID = req.user.userId;
    const { items, delivery_address, paid } = req.body; // Expect items: [{ dishID, quantity }]

    logger.log(
      "Received order payload:",
      JSON.stringify({ items, delivery_address, paid })
    );

    if (!userID) {
      return res.status(400).json({ error: "User ID missing from token" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Order must contain at least one item" });
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
        userID,
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
      res.status(201).json({ message: "Order created", orderId });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const updateOrder = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const id = req.params.id;
    const { Status, Paid } = req.body;

    logger.log(`Update order endpoint called for ID: ${id}`);

    // Build dynamic query to allow partial updates
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
      return res.status(400).json({ error: "No fields provided for update" });
    }

    values.push(id);

    const query = `UPDATE orders SET ${fields.join(", ")} WHERE OrderID = ?`;

    const [results] = await connection.query(query, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const deleteOrder = async (req, res, next) => {
  let connection;
  try {
    const connection = await getConnection();
    const id = req.params.id;
    logger.log(`Delete order endpoint called for ID: ${id}`);

    const query = "DELETE FROM orders WHERE OrderID = ?";

    const [results] = await connection.query(query, [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
