# Ramen Noodles API

A RESTful API for managing a Ramen restaurant, built with Node.js, Express, and MySQL.

## Features

- **Dishes Management**: Create, read, update, and delete dishes with image upload support.
- **Orders Management**: Place and track orders with status updates.
- **User Management**: Create and manage user accounts.
- **Image Uploads**: Handles image uploads for dishes using Multer.
- **API Documentation**: Integrated Swagger UI for easy API exploration and testing.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (using `mysql2` driver)
- **File Uploads**: Multer
- **Documentation**: Swagger UI Express & Swagger JSDoc
- **Utilities**: Dotenv, CORS

## Prerequisites

- Node.js installed
- MySQL Server installed and running

## Installation

1. **Clone the repository** (if applicable) or navigate to the project folder.

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory with the following content (adjust values to match your setup):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ramen_db
   VERSION=v1
   ```

4. **Database Setup**:
   - Create a database in MySQL (e.g., `ramen_db`).
   - Run the SQL script located at `migrations/complete_schema.sql` to create the necessary tables (`users`, `dishes`, `orders`, `order_items`).

## Running the Application

Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Documentation

The API is fully documented using Swagger. Once the server is running, you can access the interactive documentation at:

👉 **http://localhost:3000/api-docs**

## Project Structure

- **`index.js`**: Entry point of the application.
- **`src/app.js`**: Express app configuration and middleware setup.
- **`src/db.js`**: Database connection logic.
- **`src/controllers/`**: Contains the business logic for Dishes, Orders, and Users.
- **`src/routes/`**: Defines the API endpoints and maps them to controllers.
- **`src/middleware/`**: Custom middleware (e.g., `upload.js` for handling images).
- **`migrations/`**: SQL scripts for database schema changes.
- **`uploads/`**: Directory where uploaded dish images are stored.

## API Endpoints Overview

### Dishes
- `GET /api/v1/dishes`: Get all dishes.
- `GET /api/v1/dishes/:id`: Get a specific dish.
- `POST /api/v1/dishes`: Create a new dish (requires image upload).
- `PUT /api/v1/dishes/:id`: Update a dish.
- `DELETE /api/v1/dishes/:id`: Delete a dish (also deletes the associated image file).

### Orders
- `GET /api/v1/orders`: Get all orders.
- `GET /api/v1/orders/:id`: Get a specific order.
- `POST /api/v1/orders`: Create a new order.
- `PUT /api/v1/orders/:id`: Update an order.
- `DELETE /api/v1/orders/:id`: Delete an order.
- `PATCH /api/v1/orders/:id/status`: Update order status.

### Users
- `GET /api/v1/users`: Get all users.
- `GET /api/v1/users/:id`: Get a specific user.
- `POST /api/v1/users`: Create a new user.
- `PUT /api/v1/users/:id`: Update a user.
- `DELETE /api/v1/users/:id`: Delete a user.
