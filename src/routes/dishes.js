const express = require('express');
const router = express.Router();
const dishesController = require('../controllers/dishesController');
const upload = require('../middleware/upload');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Dish:
 *       type: object
 *       required:
 *         - Name
 *         - Price
 *         - Ingredients
 *       properties:
 *         DishID:
 *           type: integer
 *           description: The auto-generated id of the dish
 *         Name:
 *           type: string
 *           description: The name of the dish
 *         Price:
 *           type: number
 *           format: float
 *           description: The price of the dish
 *         Ingredients:
 *           type: string
 *           description: The ingredients of the dish
 *         Image:
 *           type: string
 *           description: The URL path to the dish image
 *       example:
 *         DishID: 1
 *         Name: Tonkotsu Ramen
 *         Price: 12.50
 *         Ingredients: Pork, Noodles, Egg, Green Onion
 *         Image: uploads/image-123456789.jpg
 */

/**
 * @swagger
 * tags:
 *   name: Dishes
 *   description: The dishes managing API
 */

/**
 * @swagger
 * /dishes:
 *   get:
 *     summary: Returns the list of all dishes
 *     tags: [Dishes]
 *     responses:
 *       200:
 *         description: The list of the dishes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dish'
 *       500:
 *         description: Internal Server Error
 */
router.get('/', dishesController.getAllDishes);

/**
 * @swagger
 * /dishes/{id}:
 *   get:
 *     summary: Get the dish by id
 *     tags: [Dishes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The dish id
 *     responses:
 *       200:
 *         description: The dish description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dish'
 *       404:
 *         description: The dish was not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', dishesController.getDishById);

/**
 * @swagger
 * /dishes:
 *   post:
 *     summary: Create a new dish
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     description: Requires Admin privileges
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - Name
 *               - Price
 *               - Ingredients
 *             properties:
 *               Name:
 *                 type: string
 *               Price:
 *                 type: number
 *                 format: float
 *               Ingredients:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: The dish was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dish'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal Server Error
 */
router.post('/', authenticateToken, authorizeRoles('admin'), upload.single('image'), dishesController.createDish);

/**
 * @swagger
 * /dishes/{id}:
 *   put:
 *     summary: Update the dish by the id
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     description: Requires Admin privileges
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The dish id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *               Price:
 *                 type: number
 *                 format: float
 *               Ingredients:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The dish was updated
 *       404:
 *         description: The dish was not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', authenticateToken, authorizeRoles('admin'), upload.single('image'), dishesController.updateDish);

/**
 * @swagger
 * /dishes/{id}:
 *   delete:
 *     summary: Remove the dish by id
 *     tags: [Dishes]
 *     security:
 *       - bearerAuth: []
 *     description: Requires Admin privileges
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The dish id
 *     responses:
 *       200:
 *         description: The dish was deleted
 *       404:
 *         description: The dish was not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), dishesController.deleteDish);

module.exports = router;
