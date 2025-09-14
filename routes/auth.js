const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST /api/auth/signup
// @desc    Register new admin
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Login admin
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current admin profile
// @access  Private
router.get('/me', auth, getMe);

module.exports = router;
