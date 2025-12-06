const { connection } = require('../db');
const logger = require('../utils/logger');

const getAllOrders = (req, res, next) => {
    logger.log("Get all orders endpoint called");
    
    const query = `
        SELECT o.*, oi.dishID, oi.aantal, d.Name as DishName, d.Price as DishPrice
        FROM orders o
        LEFT JOIN order_items oi ON o.OrderID = oi.orderID
        LEFT JOIN dishes d ON oi.dishID = d.DishID
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            return next(err);
        }
        
        const ordersMap = new Map();
        
        results.forEach(row => {
            if (!ordersMap.has(row.OrderID)) {
                ordersMap.set(row.OrderID, {
                    OrderID: row.OrderID,
                    UserID: row.UserID,
                    OrderDate: row.OrderDate,
                    items: []
                });
            }
            
            if (row.dishID) {
                ordersMap.get(row.OrderID).items.push({
                    dishID: row.dishID,
                    quantity: row.aantal,
                    name: row.DishName,
                    price: row.DishPrice
                });
            }
        });
        
        res.json(Array.from(ordersMap.values()));
    });
};

const getOrderById = (req, res, next) => {
    const id = req.params.id;
    logger.log(`Get order by ID endpoint called for ID: ${id}`);
    
    const query = 'SELECT * FROM orders WHERE OrderID = ?';

    connection.query(query, [id], (err, results) => {
        if (err) {
            return next(err);
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = results[0];

        // Fetch items for this order
        const itemsQuery = `
            SELECT oi.dishID, oi.aantal, d.Name, d.Price 
            FROM order_items oi
            JOIN dishes d ON oi.dishID = d.DishID
            WHERE oi.orderID = ?
        `;

        connection.query(itemsQuery, [id], (err, items) => {
            if (err) {
                return next(err);
            }
            
            order.items = items;
            res.json(order);
        });
    });
};

const createOrder = (req, res, next) => {
    logger.log("Create order endpoint called");
    logger.log("User from token:", req.user); // Debug log
    
    // Use the authenticated user's ID
    const userID = req.user.userId;
    const { items } = req.body; // Expect items: [{ dishID, quantity }]

    logger.log("Received order items payload:", JSON.stringify(items));

    if (!userID) {
        return res.status(400).json({ error: 'User ID missing from token' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    connection.beginTransaction(err => {
        if (err) {
            return next(err);
        }

        const orderQuery = 'INSERT INTO orders (UserID) VALUES (?)';
        connection.query(orderQuery, [userID], (err, results) => {
            if (err) {
                return connection.rollback(() => {
                    next(err);
                });
            }

            const orderId = results.insertId;
            const orderItems = items.map(item => [
                orderId, 
                parseInt(item.dishID), 
                parseInt(item.quantity) || 1
            ]);
            
            logger.log("Mapped order items for DB insertion:", JSON.stringify(orderItems));

            const itemsQuery = 'INSERT INTO order_items (orderID, dishID, aantal) VALUES ?';

            connection.query(itemsQuery, [orderItems], (err) => {
                if (err) {
                    return connection.rollback(() => {
                        next(err);
                    });
                }

                connection.commit(err => {
                    if (err) {
                        return connection.rollback(() => {
                            next(err);
                        });
                    }
                    logger.log("Order created successfully with items. OrderID:", orderId);
                    res.status(201).json({ message: 'Order created', orderId });
                });
            });
        });
    });
};

const updateOrder = (req, res, next) => {
    const id = req.params.id;
    const { Status, Paid } = req.body;
    
    logger.log(`Update order endpoint called for ID: ${id}`);

    // Build dynamic query to allow partial updates
    let fields = [];
    let values = [];

    if (Status !== undefined) {
        fields.push('Status = ?');
        values.push(Status);
    }

    if (Paid !== undefined) {
        fields.push('Paid = ?');
        values.push(Paid);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    values.push(id);

    const query = `UPDATE orders SET ${fields.join(', ')} WHERE OrderID = ?`;

    connection.query(query, values, (err, results) => {
        if (err) {
            return next(err);
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order updated successfully' });
    });
};

const deleteOrder = (req, res, next) => {
    const id = req.params.id;
    logger.log(`Delete order endpoint called for ID: ${id}`);

    const query = 'DELETE FROM orders WHERE OrderID = ?';

    connection.query(query, [id], (err, results) => {
        if (err) {
            return next(err);
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    });
};

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};
