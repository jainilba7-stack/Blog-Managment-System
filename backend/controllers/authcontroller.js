// ============================================
// MODULE 2/5 - AUTH CONTROLLER
// Register, Login, Profile (JWT based)
// ============================================

const jwt = require('jsonwebtoken');
const User = require('../models/usermodel.js');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const user = await User.create({ name, email, password });

        res.status(201).json({
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, bio: user.bio },
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, bio: user.bio },
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        res.json({ user: req.user });
    } catch (err) {
        next(err);
    }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { name, bio } = req.body;

        if (name) req.user.name = name;
        if (bio !== undefined) req.user.bio = bio;

        await req.user.save();

        res.json({
            user: { id: req.user._id, name: req.user.name, email: req.user.email, bio: req.user.bio },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };