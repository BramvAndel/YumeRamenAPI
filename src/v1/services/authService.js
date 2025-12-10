const { getConnection } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const { isValidEmail } = require("../utils/validation");

/**
 * Auth Service - Business logic for authentication operations
 */

/**
 * Authenticates a user with email and password
 * @async
 * @param {string} email - User's email
 * @param {string} password - User's password (plain text)
 * @returns {Promise<Object>} Object containing user data and tokens
 * @throws {Error} Validation or authentication errors
 */
const login = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  const connection = await getConnection();
  try {
    const query = "SELECT * FROM users WHERE email = ?";
    const [results] = await connection.query(query, [email]);

    if (results.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const accessToken = jwt.sign(
      { userId: user.userID, email: user.email, role: user.role },
      config.jwt.jwtSecret,
      { expiresIn: config.jwt.jwtAccessTokenExpoTime }
    );

    const refreshToken = jwt.sign(
      { userId: user.userID, email: user.email, role: user.role },
      config.jwt.refreshTokenSecret,
      { expiresIn: config.jwt.jwtRefreshTokenExpoTime }
    );

    // Calculate expiration date for DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const insertQuery =
      "INSERT INTO refresh_tokens (token, userID, expires_at) VALUES (?, ?, ?)";
    await connection.query(insertQuery, [refreshToken, user.userID, expiresAt]);

    return {
      userId: user.userID,
      role: user.role,
      accessToken,
      refreshToken,
    };
  } finally {
    await connection.release();
  }
};

/**
 * Refreshes the access token using a valid refresh token
 * @async
 * @param {string} token - Refresh token
 * @returns {Promise<string>} New access token
 * @throws {Error} If token is invalid or revoked
 */
const refreshAccessToken = async (token) => {
  if (!token) {
    throw new Error("Refresh Token Required");
  }

  const connection = await getConnection();
  try {
    // 1. Verify the token signature
    let user;
    try {
      user = jwt.verify(token, config.jwt.refreshTokenSecret);
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw new Error("Invalid Refresh Token");
      }
      throw error;
    }

    // 2. Check if token exists in DB
    const query = "SELECT * FROM refresh_tokens WHERE token = ?";
    const [results] = await connection.query(query, [token]);

    if (results.length === 0) {
      throw new Error("Refresh Token Not Found (Revoked)");
    }

    // 3. Generate new Access Token
    const accessToken = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      config.jwt.jwtSecret,
      { expiresIn: config.jwt.jwtAccessTokenExpoTime }
    );

    return accessToken;
  } finally {
    await connection.release();
  }
};

/**
 * Logs out a user by revoking their refresh token
 * @async
 * @param {string} token - Refresh token to revoke
 * @returns {Promise<boolean>} True if logout successful
 * @throws {Error} If token is required
 */
const logout = async (token) => {
  if (!token) {
    throw new Error("Token required");
  }

  const connection = await getConnection();
  try {
    const query = "DELETE FROM refresh_tokens WHERE token = ?";
    await connection.query(query, [token]);
    return true;
  } finally {
    await connection.release();
  }
};

module.exports = {
  login,
  refreshAccessToken,
  logout,
};
