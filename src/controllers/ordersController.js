const { connection } = require('../db');
const logger = require('../utils/logger');

const getAllOrders = (req, res) => {
    logger.log("Get all orders endpoint called");
    
    const query = 'SELECT * FROM orders';
    
    connection.query(query, (err, results) => {
        if (err) {
            logger.error('Error fetching orders:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
};

const getOrderById = (req, res) => {
    const id = req.params.id;
    logger.log(`Get order by ID endpoint called for ID: ${id}`);
    
    const query = 'SELECT * FROM orders WHERE OrderID = ?';

    connection.query(query, [id], (err, results) => {
        if (err) {
            logger.error('Error fetching order:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        res.json(results[0]);
    });
};

const createOrder = (req, res) => {
    logger.log("Create order endpoint called");
    
    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ error: 'userID is required' });
    }

    const query = 'INSERT INTO orders (UserID) VALUES (?)';

    connection.query(query, [userID], (err, results) => {
        if (err) {
            logger.error('Error creating order:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        logger.log("Order created successfully. Result:", results);
        res.status(201).json({ message: 'Order created', orderId: results.insertId });
    });
};

const updateOrder = (req, res) => {
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
            logger.error('Error updating order:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        res.json({ message: 'Order updated successfully' });
    });
};

const deleteOrder = (req, res) => {
    const id = req.params.id;
    logger.log(`Delete order endpoint called for ID: ${id}`);

    const query = 'DELETE FROM orders WHERE OrderID = ?';

    connection.query(query, [id], (err, results) => {
        if (err) {
            logger.error('Error deleting order:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        res.json({ message: 'Order deleted successfully' });
    });
};

const updateOrderStatus = (req, res) => {
    const id = req.params.id;
    const { Status } = req.body;
    logger.log(`Update order status endpoint called for ID: ${id}`);

    const query = 'UPDATE orders SET Status = ? WHERE OrderID = ?';
    connection.query(query, [Status, id], (err, results) => {
        if (err) {
            logger.error('Error updating order status:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        res.json({ message: 'Order status updated successfully' });
    });
};

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus
};
