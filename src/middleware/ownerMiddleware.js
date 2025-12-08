/**
 * Middleware to ensure the user is either an admin or the owner of the resource
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user from JWT
 * @param {number} req.user.userId - Current user's ID
 * @param {string} req.user.role - Current user's role
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Target user ID from URL
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() if authorized, otherwise returns 403 error
 * @example
 * // Usage in routes:
 * router.put('/users/:id', ensureOwnerOrAdmin, updateUser);
 */
const ensureOwnerOrAdmin = (req, res, next) => {
    const currentUserId = req.user.userId;
    const currentUserRole = req.user.role;
    const targetUserId = parseInt(req.params.id);

    if (currentUserRole === 'admin') {
        return next();
    }

    if (currentUserId === targetUserId) {
        return next();
    }

    return res.status(403).json({ error: 'Access denied. You can only modify your own account.' });
};

module.exports = ensureOwnerOrAdmin;
