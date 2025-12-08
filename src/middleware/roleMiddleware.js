/**
 * Middleware factory to authorize users based on their roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function that checks user role
 * @example
 * // Usage in routes:
 * router.delete('/users/:id', authorizeRoles('admin'), deleteUser);
 * router.get('/admin-panel', authorizeRoles('admin', 'owner'), getAdminPanel);
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};

module.exports = authorizeRoles;
