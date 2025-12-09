const multer = require("multer");
const path = require("path");
const fs = require("fs");
const config = require("../../config/config");

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

/**
 * Multer storage configuration for file uploads
 * @type {Object}
 * @property {Function} destination - Sets upload destination to 'uploads/' folder
 * @property {Function} filename - Generates unique filename with timestamp
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Save files to "uploads" folder
    },
    filename: function (req, file, cb) {
        // Create unique filename: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

/**
 * File filter to only accept image files
 * @param {Object} req - Express request object
 * @param {Object} file - File object from multer
 * @param {string} file.mimetype - MIME type of the uploaded file
 * @param {Function} cb - Callback function
 * @returns {void} Calls callback with error or acceptance
 */
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Not an image! Please upload an image."), false);
    }
};

/**
 * Configured multer instance for handling file uploads
 * @type {Object}
 * @property {Object} storage - Disk storage configuration
 * @property {Function} fileFilter - File type validation
 * @property {Object} limits - File size limits based on config
 * @example
 * // Usage in routes:
 * router.post('/dishes', upload.single('image'), createDish);
 */
const upload = multer({ 
    storage: storage,
    // fileFilter: fileFilter,
    // limits: {
    //     fileSize: 1024 * 1024 * config.maxFileSizeMB // Limit file size based on config
    // }
});

module.exports = upload;
