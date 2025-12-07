const { getConnection } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const config = require("../../config/config");

const login = async (req, res, next) => {
  try {
    const connection = getConnection();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    const [results] = await connection.query(query, [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { userId: user.userID, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Short lived access token
    );

    const refreshToken = jwt.sign(
      { userId: user.userID, email: user.email, role: user.role },
      config.refreshTokenSecret,
      { expiresIn: "7d" } // Long lived refresh token
    );

    // Calculate expiration date for DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const insertQuery =
      "INSERT INTO refresh_tokens (token, userID, expires_at) VALUES (?, ?, ?)";
    await connection.query(insertQuery, [refreshToken, user.userID, expiresAt]);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      userId: user.userID,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const connection = getConnection();
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: "Refresh Token Required" });
    }

    // 1. Verify the token signature
    const user = jwt.verify(token, config.refreshTokenSecret);

    // 2. Check if token exists in DB
    const query = "SELECT * FROM refresh_tokens WHERE token = ?";
    const [results] = await connection.query(query, [token]);

    if (results.length === 0) {
      return res
        .status(403)
        .json({ error: "Refresh Token Not Found (Revoked)" });
    }

    // 3. Generate new Access Token
    const accessToken = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(403).json({ error: "Invalid Refresh Token" });
    }
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const connection = getConnection();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    const query = "DELETE FROM refresh_tokens WHERE token = ?";
    await connection.query(query, [token]);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
};
