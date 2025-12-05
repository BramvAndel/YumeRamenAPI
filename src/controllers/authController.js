const { connection } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            logger.error('Error fetching user during login:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                logger.error('Error comparing passwords:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const accessToken = jwt.sign(
                { userId: user.userID, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '15m' } // Short lived access token
            );

            const refreshToken = jwt.sign(
                { userId: user.userID, email: user.email, role: user.role },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' } // Long lived refresh token
            );

            // Calculate expiration date for DB
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const insertQuery = 'INSERT INTO refresh_tokens (token, userID, expires_at) VALUES (?, ?, ?)';
            connection.query(insertQuery, [refreshToken, user.userID, expiresAt], (err) => {
                if (err) {
                    logger.error('Error saving refresh token:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                res.json({ message: 'Login successful', accessToken, refreshToken });
            });
        });
    });
};

const refreshToken = (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ error: 'Refresh Token Required' });
    }

    // 1. Verify the token signature
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid Refresh Token' });
        }

        // 2. Check if token exists in DB
        const query = 'SELECT * FROM refresh_tokens WHERE token = ?';
        connection.query(query, [token], (err, results) => {
            if (err) {
                logger.error('Error checking refresh token:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(403).json({ error: 'Refresh Token Not Found (Revoked)' });
            }

            // 3. Generate new Access Token
            const accessToken = jwt.sign(
                { userId: user.userId, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            res.json({ accessToken });
        });
    });
};

const logout = (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ error: 'Token required' });
    }

    const query = 'DELETE FROM refresh_tokens WHERE token = ?';
    connection.query(query, [token], (err) => {
        if (err) {
            logger.error('Error deleting refresh token:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Logged out successfully' });
    });
};

module.exports = {
    login,
    refreshToken,
    logout
};
