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
   JWT_SECRET=your_jwt_secret_key_here
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
   MAX_MB_FILE_SIZE=5
   ```

   **Security Note**: 
   - Generate strong, random secrets for `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
   - Never commit your `.env` file to version control
   - Use different secrets for development and production environments

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

### Authentication
- `POST /api/v1/auth/login`: Login with email and password.
- `POST /api/v1/auth/refresh`: Refresh access token using refresh token.
- `POST /api/v1/auth/logout`: Logout and invalidate refresh token.

**Authentication Flow**:
1. **Login**: Send credentials to `/auth/login`
   - Returns user data and sets HTTP-only cookies:
     - `accessToken`: Short-lived JWT (15 minutes) for API requests
     - `refreshToken`: Long-lived JWT (7 days) for token refresh
2. **Authenticated Requests**: Include cookies automatically in subsequent requests
   - Backend validates `accessToken` from cookie
3. **Token Refresh**: When access token expires, call `/auth/refresh`
   - Uses `refreshToken` cookie to issue new `accessToken`
4. **Logout**: Call `/auth/logout` to invalidate refresh token

**Cookie-Based Authentication**:
- All tokens are stored in HTTP-only cookies (not accessible via JavaScript)
- Provides better security against XSS attacks
- Cookies are automatically sent with requests (no manual header management)
- CORS is configured to allow credentials from allowed origins

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
- `PUT /api/v1/orders/:id`: Update an order (including status).
- `DELETE /api/v1/orders/:id`: Delete an order.

### Users
- `GET /api/v1/users`: Get all users.
- `GET /api/v1/users/:id`: Get a specific user.
- `POST /api/v1/users`: Create a new user.
- `PUT /api/v1/users/:id`: Update a user.
- `DELETE /api/v1/users/:id`: Delete a user.

## API Request/Response Examples

### Authentication Examples

#### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "userID": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "role": "user",
    "address": "123 Main St",
    "phone_number": "+1-234-567-8900"
  }
}
```
*Note: Access and refresh tokens are set as HTTP-only cookies, not in response body*

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

### Order Examples

#### Create Order
```bash
POST /api/v1/orders
Content-Type: application/json
Cookie: accessToken=<jwt_token>

{
  "items": [
    {
      "dishID": 1,
      "quantity": 2
    },
    {
      "dishID": 3,
      "quantity": 1
    }
  ],
  "delivery_address": "123 Main Street, Apt 4B",
  "paid": false
}
```

**Success Response (201 Created):**
```json
{
  "message": "Order created",
  "orderId": 15
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Order must contain at least one item"
}
```

**Error Response (400 Bad Request - Invalid Dish):**
```json
{
  "error": "Dishes not found: 99"
}
```

#### Get All Orders
```bash
GET /api/v1/orders
Cookie: accessToken=<jwt_token>
```

**Success Response (200 OK):**
```json
[
  {
    "OrderID": 1,
    "UserID": 5,
    "Status": "completed",
    "Paid": 1,
    "delivery_address": "456 Oak Avenue",
    "Ordered_at": "2025-12-08T10:30:00.000Z",
    "processing_at": "2025-12-08T10:35:00.000Z",
    "Delivering_at": "2025-12-08T11:00:00.000Z",
    "Completed_at": "2025-12-08T11:30:00.000Z",
    "items": [
      {
        "dishID": 1,
        "quantity": 2,
        "name": "Tonkotsu Ramen",
        "price": 12.99
      },
      {
        "dishID": 3,
        "quantity": 1,
        "name": "Miso Ramen",
        "price": 11.99
      }
    ]
  }
]
```

#### Update Order Status
```bash
PUT /api/v1/orders/1
Content-Type: application/json
Cookie: accessToken=<jwt_token>

{
  "Status": "processing"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Order updated successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Order not found"
}
```

### Dish Examples

#### Create Dish (Multipart/Form-Data)
```bash
POST /api/v1/dishes
Content-Type: multipart/form-data
Cookie: accessToken=<jwt_token>

Name: Tonkotsu Ramen
Price: 12.99
Ingredients: Pork broth, noodles, chashu pork, green onions, bamboo shoots
image: [file upload]
```

**Success Response (201 Created):**
```json
{
  "message": "Dish created",
  "dishId": 8,
  "image": "uploads/image-1733654789123-456789012.jpg"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid price format"
}
```

#### Get All Dishes
```bash
GET /api/v1/dishes
```

**Success Response (200 OK):**
```json
[
  {
    "DishID": 1,
    "Name": "Tonkotsu Ramen",
    "Price": 12.99,
    "Ingredients": "Pork broth, noodles, chashu pork, green onions",
    "Image": "uploads/tonkotsu-1733654789123.jpg"
  },
  {
    "DishID": 2,
    "Name": "Miso Ramen",
    "Price": 11.99,
    "Ingredients": "Miso broth, noodles, corn, butter, bean sprouts",
    "Image": "uploads/miso-1733654790456.jpg"
  }
]
```

### User Examples

#### Create User
```bash
POST /api/v1/users
Content-Type: application/json

{
  "username": "johndoe",
  "last_name": "Doe",
  "password": "securePassword123",
  "email": "john@example.com",
  "address": "123 Main St",
  "phone_number": "+1-234-567-8900",
  "role": "user"
}
```

**Success Response (201 Created):**
```json
{
  "message": "User created",
  "userId": 10
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Email already exists"
}
```

### Common Error Responses

#### Authentication Error (401 Unauthorized)
```json
{
  "error": "Access denied. No token provided."
}
```

#### Forbidden (403 Forbidden)
```json
{
  "error": "Access denied. Insufficient permissions."
}
```

#### Not Found (404 Not Found)
```json
{
  "error": "Dish not found"
}
```

#### Validation Error (400 Bad Request)
```json
{
  "error": "Invalid email format"
}
```

#### Server Error (500 Internal Server Error)
```json
{
  "error": "Internal Server Error"
}
```

