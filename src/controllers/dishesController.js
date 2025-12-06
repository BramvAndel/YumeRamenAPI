const { connection } = require('../db');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const getAllDishes = (req, res, next) => {
    logger.log("Get all dishes endpoint called");
    const query = 'SELECT * FROM dishes';
    connection.query(query, (err, results) => {
        if (err) {
            return next(err);
        }
        res.json(results);
    });
};

const getDishById = (req, res, next) => {
    const id = req.params.id;
    logger.log(`Get dish by ID endpoint called for ID: ${id}`);
    
    const query = 'SELECT * FROM dishes WHERE DishID = ?';

    connection.query(query, [id], (err, results) => {
        if (err) {
            return next(err);
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Dish not found' });
        }

        res.json(results[0]);
    });
};

const createDish = (req, res, next) => {
    logger.log("Create dish endpoint called");
    const { Name, Price, Ingredients } = req.body;
    // Normalize path to use forward slashes
    const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    if (!Name || !Price || !Ingredients) {
        return res.status(400).json({ error: 'Name, Price and Ingredients are required' });
    }

    const query = 'INSERT INTO dishes (Name, Price, Ingredients, Image) VALUES (?, ?, ?, ?)';
    connection.query(query, [Name, Price, Ingredients, imagePath], (err, results) => {
        if (err) {
            return next(err);
        }
        res.status(201).json({ message: 'Dish created', dishId: results.insertId, image: imagePath });
    });
};

const updateDish = (req, res, next) => {
    const id = req.params.id;
    logger.log(`Update dish endpoint called for ID: ${id}`);
    
    const { Name, Price, Ingredients } = req.body;
    // Normalize path to use forward slashes
    const imagePath = req.file ? req.file.path.replace(/\\/g, "/") : undefined;

    let fields = [];
    let values = [];

    if (Name !== undefined) {
        fields.push('Name = ?');
        values.push(Name);
    }
    if (Price !== undefined) {
        fields.push('Price = ?');
        values.push(Price);
    }
    if (Ingredients !== undefined) {
        fields.push('Ingredients = ?');
        values.push(Ingredients);
    }
    if (imagePath !== undefined) {
        fields.push('Image = ?');
        values.push(imagePath);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    values.push(id);
    const query = `UPDATE dishes SET ${fields.join(', ')} WHERE DishID = ?`;

    connection.query(query, values, (err, results) => {
        if (err) {
            return next(err);
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Dish not found' });
            return;
        }
        res.json({ message: 'Dish updated successfully' });
    });
};
const deleteDish = (req, res, next) => {
    const id = req.params.id;
    logger.log(`Delete dish endpoint called for ID: ${id}`);

    // First, get the image path
    const selectQuery = 'SELECT Image FROM dishes WHERE DishID = ?';

    connection.query(selectQuery, [id], (err, results) => {
        if (err) {
            return next(err);
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Dish not found' });
        }

        const imagePath = results[0].Image;

        // Then delete from database
        const deleteQuery = 'DELETE FROM dishes WHERE DishID = ?';
        connection.query(deleteQuery, [id], (deleteErr, deleteResults) => {
            if (deleteErr) {
                return next(deleteErr);
            }

            // If DB delete successful, delete the file
            if (imagePath) {
                fs.unlink(imagePath, (unlinkErr) => {
                    if (unlinkErr) {
                        logger.error('Failed to delete local image file:', unlinkErr);
                    } else {
                        logger.log('Successfully deleted local image file:', imagePath);
                    }
                });
            }

            res.json({ message: 'Dish deleted successfully' });
        });
    });
}; 
module.exports = {
    getAllDishes,
    getDishById,
    createDish,
    deleteDish,
    updateDish
};