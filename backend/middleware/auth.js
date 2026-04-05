const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Role-based middleware
const teacherOnly = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') return next();
    res.status(403).json({ message: 'Access denied: Teachers only' });
};

const studentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'student') return next();
    res.status(403).json({ message: 'Access denied: Students only' });
};

module.exports = { protect, teacherOnly, studentOnly };