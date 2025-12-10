/**
 * Validates email address format using regex
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid, false otherwise
 * @example
 * isValidEmail('user@example.com'); // true
 * isValidEmail('invalid-email'); // false
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates phone number format (allows +, -, space, and digits)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone format is valid or empty, false otherwise
 * @example
 * isValidPhoneNumber('+1-234-567-8900'); // true
 * isValidPhoneNumber('1234567'); // true
 * isValidPhoneNumber('abc'); // false
 */
const isValidPhoneNumber = (phone) => {
    if (!phone) return true; // Optional field
    // Allows +, -, space, and digits. Min length 7, max length 20
    const phoneRegex = /^[+]?[\d\s-]{7,20}$/;
    return phoneRegex.test(phone);
};

/**
 * Validates that a price is a positive number
 * @param {number|string} price - Price value to validate
 * @returns {boolean} True if price is a valid positive number, false otherwise
 * @example
 * isValidPrice(12.99); // true
 * isValidPrice('15.50'); // true
 * isValidPrice(-5); // false
 * isValidPrice('abc'); // false
 */
const isValidPrice = (price) => {
    const p = parseFloat(price);
    return !isNaN(p) && p >= 0;
};

/**
 * Validates that a quantity is a positive integer
 * @param {number|string} quantity - Quantity value to validate
 * @returns {boolean} True if quantity is a valid positive integer, false otherwise
 * @example
 * isValidQuantity(5); // true
 * isValidQuantity('3'); // true
 * isValidQuantity(0); // false
 * isValidQuantity(-1); // false
 */
const isValidQuantity = (quantity) => {
    const q = parseInt(quantity);
    return !isNaN(q) && q > 0;
};

module.exports = {
    isValidEmail,
    isValidPhoneNumber,
    isValidPrice,
    isValidQuantity
};
