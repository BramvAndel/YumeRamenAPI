const { getConnection } = require("../db");
const bcrypt = require("bcrypt");
const { isValidEmail, isValidPhoneNumber } = require("../utils/validation");

/**
 * User Service - Business logic for user operations
 */

/**
 * Retrieves all users from the database
 * @async
 * @returns {Promise<Array>} Array of user objects
 */
const getAllUsers = async () => {
  const connection = await getConnection();
  try {
    const query = "SELECT * FROM users";
    const [results] = await connection.query(query);
    return results;
  } finally {
    await connection.release();
  }
};

/**
 * Retrieves a single user by ID
 * @async
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
const getUserById = async (userId) => {
  const connection = await getConnection();
  try {
    const query = "SELECT * FROM users WHERE UserID = ?";
    const [results] = await connection.query(query, [userId]);
    return results.length > 0 ? results[0] : null;
  } finally {
    await connection.release();
  }
};

/**
 * Creates a new user with validation
 * @async
 * @param {Object} userData - User data
 * @param {string} userData.username - Username
 * @param {string} userData.last_name - Last name
 * @param {string} userData.password - Plain text password (will be hashed)
 * @param {string} userData.email - Email address
 * @param {string} [userData.address] - Address
 * @param {string} [userData.phone_number] - Phone number
 * @returns {Promise<number>} New user ID
 * @throws {Error} Validation or database errors
 */
const createUser = async (userData) => {
  const { username, last_name, password, email, address, phone_number } = userData;

  // Validate required fields
  if (!username || !password || !email) {
    throw new Error("Username, password, and email are required");
  }

  // Validate email format
  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  // Validate phone number if provided
  if (phone_number && !isValidPhoneNumber(phone_number)) {
    throw new Error("Invalid phone number format");
  }

  const connection = await getConnection();
  try {
    // Check if email already exists
    const emailCheckQuery = "SELECT UserID FROM users WHERE email = ?";
    const [existingUsers] = await connection.query(emailCheckQuery, [email]);

    if (existingUsers.length > 0) {
      throw new Error("Email already exists");
    }

    // Hash password
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    // Default role is always 'user' for new registrations
    const userRole = "user";
    const query =
      "INSERT INTO users (username, last_name, password, email, address, phone_number, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const [results] = await connection.query(query, [
      username,
      last_name,
      hash,
      email,
      address,
      phone_number,
      userRole,
    ]);

    return results.insertId;
  } finally {
    await connection.release();
  }
};

/**
 * Deletes a user by ID
 * @async
 * @param {number} userId - User ID to delete
 * @returns {Promise<boolean>} True if deleted successfully
 * @throws {Error} If user has existing orders or not found
 */
const deleteUser = async (userId) => {
  const connection = await getConnection();
  try {
    // Check for active (non-completed) orders
    const checkActiveOrdersQuery =
      "SELECT COUNT(*) as count FROM orders WHERE UserID = ? AND Status != 'completed'";
    const [orderCheck] = await connection.query(checkActiveOrdersQuery, [userId]);

    if (orderCheck[0].count > 0) {
      throw new Error(
        "Cannot delete user with active orders. Please complete or delete active orders first."
      );
    }

    const query = "DELETE FROM users WHERE UserID = ?";
    const [results] = await connection.query(query, [userId]);

    if (results.affectedRows === 0) {
      throw new Error("User not found");
    }

    return true;
  } finally {
    await connection.release();
  }
};

/**
 * Updates user information
 * @async
 * @param {number} userId - User ID to update
 * @param {Object} updateData - Fields to update
 * @param {string} [updateData.username] - New username
 * @param {string} [updateData.last_name] - New last name
 * @param {string} [updateData.password] - New password (plain text, will be hashed)
 * @param {string} [updateData.email] - New email
 * @param {string} [updateData.address] - New address
 * @param {string} [updateData.phone_number] - New phone number
 * @param {string} [updateData.role] - New role
 * @param {Object} [currentUser] - Current authenticated user
 * @param {string} [currentUser.role] - Current user's role
 * @param {number} [currentUser.userId] - Current user's ID
 * @returns {Promise<boolean>} True if updated successfully
 * @throws {Error} Validation or permission errors
 */
const updateUser = async (userId, updateData, currentUser = null) => {
  const { username, last_name, password, email, address, phone_number, role } = updateData;

  // Security check: Only admins can update roles
  if (role !== undefined && currentUser) {
    if (currentUser.role !== "admin") {
      throw new Error("Access denied: Only admins can change roles");
    }
    // Prevent admins from changing their own role
    if (currentUser.userId == userId) {
      throw new Error("Access denied: You cannot change your own role");
    }
  }

  let fields = [];
  let values = [];

  if (username !== undefined) {
    fields.push("username = ?");
    values.push(username);
  }
  if (last_name !== undefined) {
    fields.push("last_name = ?");
    values.push(last_name);
  }
  if (password !== undefined) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    fields.push("password = ?");
    values.push(hash);
  }
  if (email !== undefined) {
    if (!isValidEmail(email)) {
      throw new Error("Invalid email format");
    }
    fields.push("email = ?");
    values.push(email);
  }
  if (address !== undefined) {
    fields.push("address = ?");
    values.push(address);
  }
  if (phone_number !== undefined) {
    if (!isValidPhoneNumber(phone_number)) {
      throw new Error("Invalid phone number format");
    }
    fields.push("phone_number = ?");
    values.push(phone_number);
  }
  if (role !== undefined) {
    fields.push("role = ?");
    values.push(role);
  }

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  values.push(userId);
  const connection = await getConnection();
  try {
    const query = `UPDATE users SET ${fields.join(", ")} WHERE UserID = ?`;
    const [results] = await connection.query(query, values);

    if (results.affectedRows === 0) {
      throw new Error("User not found");
    }

    return true;
  } finally {
    await connection.release();
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
};
