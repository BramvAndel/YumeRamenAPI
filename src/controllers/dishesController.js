const logger = require("../utils/logger");
const dishesService = require("../services/dishesService");

/**
 * Retrieves all dishes from the database
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns JSON array of all dishes
 * @example
 * // Response:
 * [{ "DishID": 1, "Name": "Ramen", "Price": 12.99, "Ingredients": "noodles, broth", ... }]
 */
const getAllDishes = async (req, res, next) => {
  try {
    logger.log("Get all dishes endpoint called");
    const dishes = await dishesService.getAllDishes();
    res.json(dishes);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a single dish by its ID
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Dish ID to retrieve
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns JSON object with dish data or 404 if not found
 * @example
 * // Response:
 * { "DishID": 1, "Name": "Ramen", "Price": 12.99, "Ingredients": "noodles, broth" }
 */
const getDishById = async (req, res, next) => {
  try {
    const id = req.params.id;
    logger.log(`Get dish by ID endpoint called for ID: ${id}`);

    const dish = await dishesService.getDishById(id);

    if (!dish) {
      return res.status(404).json({ error: "Dish not found" });
    }

    res.json(dish);
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new dish with optional image upload
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.Name - Dish name
 * @param {number} req.body.Price - Dish price (must be positive)
 * @param {string} req.body.Ingredients - Dish ingredients
 * @param {Object} [req.file] - Uploaded image file from multer
 * @param {string} [req.file.path] - Path to uploaded image
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message with new dish ID and image path
 * @example
 * // Request body:
 * { "Name": "Tonkotsu Ramen", "Price": 14.99, "Ingredients": "pork broth, noodles" }
 * // Response:
 * { "message": "Dish created", "dishId": 1, "image": "uploads/image-123.jpg" }
 */
const createDish = async (req, res, next) => {
  try {
    logger.log("Create dish endpoint called");
    const { Name, Price, Ingredients } = req.body;
    // Normalize path to use forward slashes
    // const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    const result = await dishesService.createDish({
      Name,
      Price,
      Ingredients,
      // imagePath,
    });

    res.status(201).json({
      message: "Dish created",
      dishId: result.dishId,
      // image: result.imagePath,
    });
  } catch (error) {
    if (
      error.message.includes("required") ||
      error.message.includes("Invalid price")
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Updates an existing dish with optional image replacement
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Dish ID to update
 * @param {Object} req.body - Request body with fields to update
 * @param {string} [req.body.Name] - New dish name
 * @param {number} [req.body.Price] - New price (must be positive)
 * @param {string} [req.body.Ingredients] - New ingredients
 * @param {Object} [req.file] - New uploaded image file from multer
 * @param {string} [req.file.path] - Path to new uploaded image
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message
 * @example
 * // Request body:
 * { "Name": "Updated Ramen", "Price": 15.99 }
 * // Response:
 * { "message": "Dish updated successfully" }
 */
const updateDish = async (req, res, next) => {
  try {
    const id = req.params.id;
    logger.log(`Update dish endpoint called for ID: ${id}`);
    const { Name, Price, Ingredients } = req.body;
    // Normalize path to use forward slashes
    // const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : undefined;

    // await dishesService.updateDish(id, { Name, Price, Ingredients, imagePath });
    await dishesService.updateDish(id, { Name, Price, Ingredients });

    res.json({ message: "Dish updated successfully" });
  } catch (error) {
    if (
      error.message.includes("No fields") ||
      error.message.includes("Invalid price")
    ) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Dish not found") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Deletes a dish and its associated image file. Uses transaction to ensure consistency.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Dish ID to delete
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Returns success message or error if dish is in orders
 * @example
 * // Response:
 * { "message": "Dish deleted successfully" }
 */
const deleteDish = async (req, res, next) => {
  try {
    const id = req.params.id;
    logger.log(`Delete dish endpoint called for ID: ${id}`);

    await dishesService.deleteDish(id);

    res.json({ message: "Dish deleted successfully" });
  } catch (error) {
    if (error.message.includes("Cannot delete dish")) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Dish not found") {
      return res.status(404).json({ error: error.message });
    }
    // if (error.message.includes("Failed to delete associated image")) {
    //   return res.status(500).json({ error: error.message });
    // }
    next(error);
  }
};

module.exports = {
  getAllDishes,
  getDishById,
  createDish,
  deleteDish,
  updateDish,
};
