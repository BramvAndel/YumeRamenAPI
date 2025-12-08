const { getConnection } = require("../db");
const logger = require("../utils/logger");
const bcrypt = require("bcrypt");
const { isValidEmail, isValidPhoneNumber } = require("../utils/validation");

const getAllUsers = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    logger.log("Get all users endpoint called");
    const query = "SELECT * FROM users";
    const [results] = await connection.query(query);
    res.json(results);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const getUserById = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const id = req.params.id;
    logger.log(`Get user by ID endpoint called for ID: ${id}`);

    const query = "SELECT * FROM users WHERE UserID = ?";
    const [results] = await connection.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const createUser = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    logger.log("Create user endpoint called");
    // Security: Don't allow setting 'role' from the body during public registration
    const { username, last_name, password, email, address, phone_number } =
      req.body;

    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ error: "Username, password, and email are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (phone_number && !isValidPhoneNumber(phone_number)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

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
    res.status(201).json({ message: "User created", userId: results.insertId });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const deleteUser = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const id = req.params.id;
    logger.log(`Delete user endpoint called for ID: ${id}`);

    const query = "DELETE FROM users WHERE UserID = ?";
    const [results] = await connection.query(query, [id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const updateUser = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const id = req.params.id;
    logger.log(`Update user endpoint called for ID: ${id}`);

    const {
      username,
      last_name,
      password,
      email,
      address,
      phone_number,
      role,
    } = req.body;

    // Security check: Only admins can update roles
    if (role !== undefined) {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Access denied: Only admins can change roles" });
      }
      // Prevent admins from changing their own role
      if (req.user.userId == id) {
        return res
          .status(403)
          .json({ error: "Access denied: You cannot change your own role" });
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
        return res.status(400).json({ error: "Invalid email format" });
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
        return res.status(400).json({ error: "Invalid phone number format" });
      }
      fields.push("phone_number = ?");
      values.push(phone_number);
    }
    if (role !== undefined) {
      fields.push("role = ?");
      values.push(role);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(", ")} WHERE UserID = ?`;

    const [results] = await connection.query(query, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User updated successfully" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
};
