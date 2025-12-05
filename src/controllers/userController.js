const { connection } = require('../db');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

const getAllUsers = (req, res) => {
    logger.log("Get all users endpoint called");
    const query = 'SELECT * FROM users';
    connection.query(query, (err, results) => {
        if (err) {
            logger.error('Error fetching users:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.json(results);
    });
};

const getUserById = (req, res) => {
    const id = req.params.id;
    logger.log(`Get user by ID endpoint called for ID: ${id}`);
    
    const query = 'SELECT * FROM users WHERE UserID = ?';

    connection.query(query, [id], (err, results) => {
        if (err) {
            logger.error('Error fetching user:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(results[0]);
    });
};

const createUser = (req, res) => {
    logger.log("Create user endpoint called");
    // Security: Don't allow setting 'role' from the body during public registration
    const { username, password, email, address } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password, and email are required' });
    }

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            logger.error('Error hashing password:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Default role is always 'user' for new registrations
        const userRole = 'user';
        const query = 'INSERT INTO users (username, password, email, address, role) VALUES (?, ?, ?, ?, ?)';
        connection.query(query, [username, hash, email, address, userRole], (err, results) => {
            if (err) {
                logger.error('Error creating user:', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            res.status(201).json({ message: 'User created', userId: results.insertId });
        });
    });
};

const deleteUser = (req, res) => {
    const id = req.params.id;
    logger.log(`Delete user endpoint called for ID: ${id}`);

    const query = 'DELETE FROM users WHERE UserID = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            logger.error('Error deleting user:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    });
};

const updateUser = (req, res) => {
    const id = req.params.id;
    logger.log(`Update user endpoint called for ID: ${id}`);
    
    const { username, password, email, address, role } = req.body;
    
    // Security check: Only admins can update roles
    if (role !== undefined) {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: Only admins can change roles' });
        }
        // Prevent admins from changing their own role
        if (req.user.userId == id) {
            return res.status(403).json({ error: 'Access denied: You cannot change your own role' });
        }
    }
    
    let fields = [];
    let values = [];

    if (username !== undefined) {
        fields.push('username = ?');
        values.push(username);
    }
    if (password !== undefined) {
        // Note: In a real app, you should hash the password here too if it's being updated
        fields.push('password = ?');
        values.push(password);
    }
    if (email !== undefined) {
        fields.push('email = ?');
        values.push(email);
    }
    if (address !== undefined) {
        fields.push('address = ?');
        values.push(address);
    }
    if (role !== undefined) {
        fields.push('role = ?');
        values.push(role);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE UserID = ?`;

    connection.query(query, values, (err, results) => {
        if (err) {
            logger.error('Error updating user:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ message: 'User updated successfully' });
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    deleteUser,
    updateUser
};