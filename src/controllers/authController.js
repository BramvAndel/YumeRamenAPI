const { getConnection } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const config = require("../../config/config");
const { isValidEmail } = require("../utils/validation");

const login = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
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

    // Set secure HTTP-only cookies
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: config.jwt.jwtAccesTokenExpoTime,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: config.jwt.jwtRefreshTokenExpoTime, // 7 days
    });

    res.json({
      message: "Login successful",
      userId: user.userID,
      role: user.role,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const refreshToken = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const token = req.cookies?.refreshToken;

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

    // Set new access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({ message: "Token refreshed successfully" });
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
    const connection = await getConnection();
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    const query = "DELETE FROM refresh_tokens WHERE token = ?";
    await connection.query(query, [token]);

    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

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
