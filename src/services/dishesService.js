const { getConnection } = require("../db");
const fs = require("fs");
const logger = require("../utils/logger");
const { isValidPrice } = require("../utils/validation");

/**
 * Dishes Service - Business logic for dish operations
 */

/**
 * Retrieves all dishes from the database
 * @async
 * @returns {Promise<Array>} Array of dish objects
 */
const getAllDishes = async () => {
  const connection = await getConnection();
  try {
    const query = "SELECT * FROM dishes";
    const [results] = await connection.query(query);
    return results;
  } finally {
    await connection.release();
  }
};

/**
 * Retrieves a single dish by ID
 * @async
 * @param {number} dishId - Dish ID
 * @returns {Promise<Object|null>} Dish object or null if not found
 */
const getDishById = async (dishId) => {
  const connection = await getConnection();
  try {
    const query = "SELECT * FROM dishes WHERE DishID = ?";
    const [results] = await connection.query(query, [dishId]);
    return results.length > 0 ? results[0] : null;
  } finally {
    await connection.release();
  }
};

/**
 * Creates a new dish
 * @async
 * @param {Object} dishData - Dish data
 * @param {string} dishData.Name - Dish name
 * @param {number} dishData.Price - Dish price
 * @param {string} dishData.Ingredients - Dish ingredients
 * @param {string} [dishData.imagePath] - Path to dish image
 * @returns {Promise<Object>} Object with dishId and imagePath
 * @throws {Error} Validation errors
 */
const createDish = async (dishData) => {
  const { Name, Price, Ingredients, imagePath } = dishData;

  if (!Name || !Price || !Ingredients) {
    throw new Error("Name, Price and Ingredients are required");
  }

  if (!isValidPrice(Price)) {
    throw new Error("Invalid price format");
  }

  const connection = await getConnection();
  try {
    const query =
      "INSERT INTO dishes (Name, Price, Ingredients, Image) VALUES (?, ?, ?, ?)";
    const [results] = await connection.query(query, [
      Name,
      Price,
      Ingredients,
      imagePath || null,
    ]);

    return {
      dishId: results.insertId,
      imagePath: imagePath || null,
    };
  } finally {
    await connection.release();
  }
};

/**
 * Updates an existing dish
 * @async
 * @param {number} dishId - Dish ID
 * @param {Object} updateData - Fields to update
 * @param {string} [updateData.Name] - New dish name
 * @param {number} [updateData.Price] - New price
 * @param {string} [updateData.Ingredients] - New ingredients
 * @param {string} [updateData.imagePath] - New image path
 * @returns {Promise<boolean>} True if updated successfully
 * @throws {Error} Validation or not found errors
 */
const updateDish = async (dishId, updateData) => {
  const { Name, Price, Ingredients, imagePath } = updateData;

  let fields = [];
  let values = [];

  if (Name !== undefined) {
    fields.push("Name = ?");
    values.push(Name);
  }
  if (Price !== undefined) {
    if (!isValidPrice(Price)) {
      throw new Error("Invalid price format");
    }
    fields.push("Price = ?");
    values.push(Price);
  }
  if (Ingredients !== undefined) {
    fields.push("Ingredients = ?");
    values.push(Ingredients);
  }
  if (imagePath !== undefined) {
    const connection = await getConnection();
    try {
      // Get the old image path before updating
      const getImageQuery = "SELECT Image FROM dishes WHERE DishID = ?";
      const [dishResults] = await connection.query(getImageQuery, [dishId]);

      if (dishResults.length > 0 && dishResults[0].Image) {
        const oldImagePath = dishResults[0].Image;
        // Delete the old image file
        try {
          await fs.promises.unlink(oldImagePath);
          logger.log(`Successfully deleted old image file: ${oldImagePath}`);
        } catch (err) {
          if (err.code !== "ENOENT") {
            logger.error(`Failed to delete old image file ${oldImagePath}`, {
              message: err.message,
              stack: err.stack,
            });
            // Continue with update even if file deletion fails
          }
        }
      }
    } finally {
      await connection.release();
    }

    fields.push("Image = ?");
    values.push(imagePath);
  }

  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  values.push(dishId);
  const connection = await getConnection();
  try {
    const query = `UPDATE dishes SET ${fields.join(", ")} WHERE DishID = ?`;
    const [results] = await connection.query(query, values);

    if (results.affectedRows === 0) {
      throw new Error("Dish not found");
    }

    return true;
  } finally {
    await connection.release();
  }
};

/**
 * Deletes a dish by ID
 * @async
 * @param {number} dishId - Dish ID to delete
 * @returns {Promise<boolean>} True if deleted successfully
 * @throws {Error} If dish is in existing orders or not found
 */
const deleteDish = async (dishId) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    // Check for related order items
    const checkOrderItemsQuery =
      "SELECT COUNT(*) as count FROM order_items WHERE dishID = ?";
    const [orderItemsCheck] = await connection.query(checkOrderItemsQuery, [
      dishId,
    ]);

    // if (orderItemsCheck[0].count > 0) {
    //   await connection.rollback();
    //   throw new Error("Cannot delete dish that is part of existing orders.");
    // }

    // First, get the image path
    const selectQuery = "SELECT Image FROM dishes WHERE DishID = ? FOR UPDATE";
    const [results] = await connection.query(selectQuery, [dishId]);

    if (results.length === 0) {
      await connection.rollback();
      throw new Error("Dish not found");
    }

    const imagePath = results[0].Image;

    // Then delete from database
    const deleteQuery = "DELETE FROM dishes WHERE DishID = ?";
    await connection.query(deleteQuery, [dishId]);

    // If DB delete successful, try to delete the file
    if (imagePath) {
      try {
        await fs.promises.unlink(imagePath);
        logger.log("Successfully deleted local image file:", imagePath);
      } catch (err) {
        if (err.code !== "ENOENT") {
          // If file exists but can't be deleted, rollback DB change
          logger.error(
            `Failed to delete image file ${imagePath}, rolling back DB deletion. Error: ${err.message}`
          );
          await connection.rollback();
          throw new Error("Failed to delete associated image file");
        }
        // If file doesn't exist, that's fine, proceed to commit
        logger.log(
          `Image file ${imagePath} not found, proceeding with DB deletion.`
        );
      }
    }

    await connection.commit();
    return true;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    await connection.release();
  }
};

module.exports = {
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
};
