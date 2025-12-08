const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhoneNumber = (phone) => {
    if (!phone) return true; // Optional field
    // Allows +, -, space, and digits. Min length 7, max length 20
    const phoneRegex = /^[+]?[\d\s-]{7,20}$/;
    return phoneRegex.test(phone);
};

const isValidPrice = (price) => {
    const p = parseFloat(price);
    return !isNaN(p) && p >= 0;
};

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
