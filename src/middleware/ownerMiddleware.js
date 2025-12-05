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
