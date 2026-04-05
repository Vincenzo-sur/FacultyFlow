const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register new user (student or teacher)
router.post('/register', async (req, res) => {
    const { fullName, universityId, email, password, role, department } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { universityId }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or ID already exists' });
        }

        const user = await User.create({
            fullName,
            universityId,
            email,
            password,
            role,
            department
        });

        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            universityId: user.universityId,
            token: generateToken(user._id)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                universityId: user.universityId,
                department: user.department,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

module.exports = router;