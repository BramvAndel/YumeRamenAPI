const { getConnection } = require("../db");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const getAllDishes = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    logger.log("Get all dishes endpoint called");
    const query = "SELECT * FROM dishes";
    const [results] = await connection.query(query);
    res.json(results);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const getDishById = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const id = req.params.id;
    logger.log(`Get dish by ID endpoint called for ID: ${id}`);

    const query = "SELECT * FROM dishes WHERE DishID = ?";
    const [results] = await connection.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Dish not found" });
    }

    res.json(results[0]);
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const createDish = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    logger.log("Create dish endpoint called");
    const { Name, Price, Ingredients } = req.body;
    // Normalize path to use forward slashes
    const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    if (!Name || !Price || !Ingredients) {
      return res
        .status(400)
        .json({ error: "Name, Price and Ingredients are required" });
    }

    const query =
      "INSERT INTO dishes (Name, Price, Ingredients, Image) VALUES (?, ?, ?, ?)";
    const [results] = await connection.query(query, [
      Name,
      Price,
      Ingredients,
      imagePath,
    ]);
    res.status(201).json({
      message: "Dish created",
      dishId: results.insertId,
      image: imagePath,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const updateDish = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const id = req.params.id;
    logger.log(`Update dish endpoint called for ID: ${id}`);
    const { Name, Price, Ingredients } = req.body;
    // Normalize path to use forward slashes
    const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : undefined;

    let fields = [];
    let values = [];

    if (Name !== undefined) {
      fields.push("Name = ?");
      values.push(Name);
    }
    if (Price !== undefined) {
      fields.push("Price = ?");
      values.push(Price);
    }
    if (Ingredients !== undefined) {
      fields.push("Ingredients = ?");
      values.push(Ingredients);
    }
    if (imagePath !== undefined) {
      fields.push("Image = ?");
      values.push(imagePath);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    values.push(id);
    const query = `UPDATE dishes SET ${fields.join(", ")} WHERE DishID = ?`;

    const [results] = await connection.query(query, values);
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Dish not found" });
    }
    res.json({ message: "Dish updated successfully" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

const deleteDish = async (req, res, next) => {
  let connection;
  try {
    connection = await getConnection();
    const id = req.params.id;
    logger.log(`Delete dish endpoint called for ID: ${id}`);

    // First, get the image path
    const selectQuery = "SELECT Image FROM dishes WHERE DishID = ?";
    const [results] = await connection.query(selectQuery, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Dish not found" });
    }

    const imagePath = results[0].Image;

    // Then delete from database
    const deleteQuery = "DELETE FROM dishes WHERE DishID = ?";
    await connection.query(deleteQuery, [id]);

    // If DB delete successful, delete the file
    if (imagePath) {
      fs.unlink(imagePath, (unlinkErr) => {
        if (unlinkErr) {
          logger.error("Failed to delete local image file:", unlinkErr);
        } else {
          logger.log("Successfully deleted local image file:", imagePath);
        }
      });
    }

    res.json({ message: "Dish deleted successfully" });
  } catch (error) {
    next(error);
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  getAllDishes,
  getDishById,
  createDish,
  deleteDish,
  updateDish,
};
