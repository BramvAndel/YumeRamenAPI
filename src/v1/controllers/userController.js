const logger = require("../../common/logger");
const userService = require("../services/userService");

/**
 * Retrieves all users from the database
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns JSON array of all users
 * @example
 * // Response:
 * [{ "userID": 1, "username": "john", "email": "john@example.com", ... }]
 */
const getAllUsers = async (req, res, next) => {
  try {
    logger.log("Get all users endpoint called");
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single user by their ID
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - User ID to retrieve
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns JSON object with user data or 404 if not found
 * @example
 * // Response:
 * { "userID": 1, "username": "john", "email": "john@example.com", ... }
 */
const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    logger.log(`Get user by ID endpoint called for ID: ${id}`);

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new user account with default 'user' role
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - User's username
 * @param {string} req.body.last_name - User's last name
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {string} req.body.email - User's email address
 * @param {string} [req.body.address] - User's address (optional)
 * @param {string} [req.body.phone_number] - User's phone number (optional)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message with new user ID
 * @example
 * // Request body:
 * { "username": "john", "password": "secret", "email": "john@example.com" }
 * // Response:
 * { "message": "User created", "userId": 1 }
 */
const createUser = async (req, res, next) => {
  try {
    logger.log("Create user endpoint called");
    const { username, last_name, password, email, address, phone_number } = req.body;

    const userId = await userService.createUser({
      username,
      last_name,
      password,
      email,
      address,
      phone_number,
    });

    res.status(201).json({ message: "User created", userId });
  } catch (error) {
    if (error.message.includes("required") || error.message.includes("Invalid") || error.message.includes("exists")) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Deletes a user by ID, but only if they have no existing orders
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - User ID to delete
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message or error if user has orders
 * @example
 * // Response:
 * { "message": "User deleted successfully" }
 */
const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    logger.log(`Delete user endpoint called for ID: ${id}`);

    await userService.deleteUser(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    if (error.message.includes("Cannot delete") || error.message === "User not found") {
      const statusCode = error.message === "User not found" ? 404 : 400;
      return res.status(statusCode).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Updates user information. Only admins can change roles, and users cannot change their own role
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - User ID to update
 * @param {Object} req.body - Request body with fields to update
 * @param {string} [req.body.username] - New username
 * @param {string} [req.body.last_name] - New last name
 * @param {string} [req.body.password] - New password (will be hashed)
 * @param {string} [req.body.email] - New email address
 * @param {string} [req.body.address] - New address
 * @param {string} [req.body.phone_number] - New phone number
 * @param {string} [req.body.role] - New role (admin only)
 * @param {Object} req.user - Authenticated user from JWT
 * @param {string} req.user.role - Current user's role
 * @param {number} req.user.userId - Current user's ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message
 * @example
 * // Request body:
 * { "username": "johnupdated", "email": "newemail@example.com" }
 * // Response:
 * { "message": "User updated successfully" }
 */
const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    logger.log(`Update user endpoint called for ID: ${id}`);

    const { username, last_name, password, email, address, phone_number, role } = req.body;

    await userService.updateUser(
      id,
      { username, last_name, password, email, address, phone_number, role },
      req.user
    );

    res.json({ message: "User updated successfully" });
  } catch (error) {
    if (
      error.message.includes("Access denied") ||
      error.message.includes("Invalid") ||
      error.message.includes("No fields")
    ) {
      const statusCode = error.message.includes("Access denied") ? 403 : 400;
      return res.status(statusCode).json({ error: error.message });
    }
    if (error.message === "User not found") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
};
