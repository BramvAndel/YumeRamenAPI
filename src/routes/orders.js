const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

const ordersController = require('../controllers/ordersController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - UserID
 *       properties:
 *         OrderID:
 *           type: integer
 *           description: The auto-generated id of the order
 *         UserID:
 *           type: integer
 *           description: The id of the user who placed the order
 *         Ordered_at:
 *           type: string
 *           format: date-time
 *           description: The date the order was placed
 *         processing_at:
 *           type: string
 *           format: date-time
 *         Delivering_at:
 *           type: string
 *           format: date-time
 *         Completed_at:
 *           type: string
 *           format: date-time
 *         Paid:
 *           type: boolean
 *           description: Whether the order has been paid
 *         Status:
 *           type: string
 *           enum: [ordered, processing, delivering, completed]
 *           description: The status of the order
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               dishID:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *       example:
 *         OrderID: 1
 *         UserID: 1
 *         Ordered_at: 2023-10-27T10:00:00Z
 *         Paid: false
 *         Status: ordered
 *         items:
 *           - dishID: 2
 *             quantity: 1
 *             name: Miso Ramen
 *             price: 13.50
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: The orders managing API
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Returns the list of all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: The list of the orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal Server Error
 */
router.get('/', authenticateToken, ordersController.getAllOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get the order by id
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order id
 *     responses:
 *       200:
 *         description: The order description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: The order was not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', authenticateToken, ordersController.getOrderById);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - dishID
 *                   properties:
 *                     dishID:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                       default: 1
 *     responses:
 *       201:
 *         description: The order was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: integer
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal Server Error
 */
router.post('/', authenticateToken, ordersController.createOrder);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update the order by the id
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Status:
 *                 type: string
 *                 enum: [ordered, processing, delivering, completed]
 *               Paid:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The order was updated
 *       404:
 *         description: The order was not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', authenticateToken, ordersController.updateOrder);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Remove the order by id
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order id
 *     responses:
 *       200:
 *         description: The order was deleted
 *       404:
 *         description: The order was not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', authenticateToken, ordersController.deleteOrder);

module.exports = router;
