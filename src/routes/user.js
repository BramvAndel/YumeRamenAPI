const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const ensureOwnerOrAdmin = require("../middleware/ownerMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const userController = require("../controllers/userController");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *       properties:
 *         userID:
 *           type: integer
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username
 *         last_name:
 *           type: string
 *           description: The user's last name
 *         password:
 *           type: string
 *           description: The user password
 *         email:
 *           type: string
 *           description: The user email
 *         address:
 *           type: string
 *           description: The user address
 *         phone_number:
 *           type: string
 *           description: The user phone number
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: The user role
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the user was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the user was last updated
 *       example:
 *         userID: 1
 *         username: johndoe
 *         email: john@example.com
 *         address: 123 Ramen St
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns the list of all users
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     description: Requires Admin privileges
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/",
  express.json(),
  authenticateToken,
  authorizeRoles("admin"),
  userController.getAllUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get the user by id
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/:id", express.json(), authenticateToken, userController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     security: []
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal Server Error
 */
router.post("/", express.json(), userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remove the user by id
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     description: Requires Owner or Admin privileges
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user was deleted
 *       404:
 *         description: The user was not found
 *       500:
 *         description: Internal Server Error
 */
router.delete(
  "/:id",
  express.json(),
  authenticateToken,
  ensureOwnerOrAdmin,
  userController.deleteUser
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update the user by the id
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     description: Requires Owner or Admin privileges
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: The user was updated
 *       404:
 *         description: The user was not found
 *       500:
 *         description: Internal Server Error
 */
router.put(
  "/:id",
  express.json(),
  authenticateToken,
  ensureOwnerOrAdmin,
  userController.updateUser
);

module.exports = router;

