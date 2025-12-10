const logger = require("../../common/logger");
const config = require("../../config/config");
const authService = require("../services/authService");

/**
 * Authenticates a user with email and password, generates access and refresh tokens
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (plain text)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns JSON with userId and role, sets HTTP-only cookies
 * @example
 * // Request body:
 * { "email": "user@example.com", "password": "securePassword123" }
 * // Response:
 * { "message": "Login successful", "userId": 1, "role": "user" }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { userId, role, accessToken, refreshToken } = await authService.login(email, password);

    // Set secure HTTP-only cookies
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: config.jwt.jwtAccessTokenExpoTime,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: config.jwt.jwtRefreshTokenExpoTime,
    });

    res.json({
      message: "Login successful",
      userId,
      role,
    });
  } catch (error) {
    if (
      error.message.includes("required") ||
      error.message.includes("Invalid")
    ) {
      const statusCode = error.message.includes("Invalid email or password") ? 401 : 400;
      return res.status(statusCode).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Refreshes the access token using a valid refresh token from cookies
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.cookies - HTTP cookies
 * @param {string} req.cookies.refreshToken - Refresh token from HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message and sets new access token cookie
 * @example
 * // Response:
 * { "message": "Token refreshed successfully" }
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    const accessToken = await authService.refreshAccessToken(token);

    // Set new access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: config.jwt.jwtAccessTokenExpoTime,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    if (
      error.message.includes("Required") ||
      error.message.includes("Invalid") ||
      error.message.includes("Revoked")
    ) {
      const statusCode = error.message.includes("Required") ? 401 : 403;
      return res.status(statusCode).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Logs out a user by revoking their refresh token and clearing cookies
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.cookies - HTTP cookies
 * @param {string} req.cookies.refreshToken - Refresh token to revoke
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message and clears authentication cookies
 * @example
 * // Response:
 * { "message": "Logged out successfully" }
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    await authService.logout(token);

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
    if (error.message === "Token required") {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
};
