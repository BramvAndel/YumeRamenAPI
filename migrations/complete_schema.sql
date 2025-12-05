-- Complete Database Schema for Ramen Noodles App
-- This file contains the final structure after all migrations

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    userID INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(255),
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

-- Optional: Insert a default admin user if you want to start fresh
-- INSERT INTO users (username, password, email, address) VALUES ('admin', 'admin123', 'admin@ramennoodles.com', '123 Noodle St');
