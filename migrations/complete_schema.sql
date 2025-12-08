-- Complete Database Schema for Ramen Noodles App
-- This file contains the final structure after all migrations

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    userID INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(255),
    phone_number VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Dishes Table (formerly Ramens)
CREATE TABLE IF NOT EXISTS dishes (
    DishID INT(11) AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Dish',
    Price FLOAT NOT NULL,
    Ingredients TEXT,
    Image VARCHAR(120)
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    OrderID INT(11) AUTO_INCREMENT PRIMARY KEY,
    UserID INT(11) NOT NULL,
    delivery_address VARCHAR(255),
    Ordered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processing_at DATETIME NULL,
    Delivering_at DATETIME NULL,
    Completed_at DATETIME NULL,
    Paid BOOLEAN DEFAULT FALSE,
    Status ENUM('ordered', 'processing', 'delivering', 'completed') DEFAULT 'ordered',
    FOREIGN KEY (UserID) REFERENCES users(userID) ON DELETE CASCADE
);

-- 4. Order Items Table (formerly Order-regels)
CREATE TABLE IF NOT EXISTS order_items (
    orderID INT(11) NOT NULL,
    dishID INT(11) NOT NULL,
    aantal INT(11) NOT NULL DEFAULT 1,
    PRIMARY KEY (orderID, dishID),
    FOREIGN KEY (orderID) REFERENCES orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (dishID) REFERENCES dishes(DishID) ON DELETE CASCADE
);

-- 5. Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token VARCHAR(255) PRIMARY KEY,
    userID INT(11) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);


-- Recommended Indexes for Performance
-- Add indexes for foreign keys and frequently queried fields

-- Users table: index on email for fast lookup
CREATE INDEX idx_users_email ON users(email);

-- Orders table: index on UserID for user order queries
CREATE INDEX idx_orders_userid ON orders(UserID);

-- Orders table: index on Status for status-based queries
CREATE INDEX idx_orders_status ON orders(Status);

-- Dishes table: index on Name for search
CREATE INDEX idx_dishes_name ON dishes(Name);

-- Order Items table: index on dishID for dish order queries
CREATE INDEX idx_order_items_dishid ON order_items(dishID);

-- Order Items table: index on orderID for order item queries
CREATE INDEX idx_order_items_orderid ON order_items(orderID);
