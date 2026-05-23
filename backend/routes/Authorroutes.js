const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const { blockViewers } = require('../middleware/roleMiddleware');

const rateLimit = require('express-rate-limit');

 
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────────────
// Auth Routes
// ─────────────────────────────────────────────

// Register user
router.post('/register', registerUser);

// Login user
router.post('/login', loginLimiter, loginUser);

// Logout user (protected)
router.post('/logout', protect, logoutUser);

// Get current logged in user
router.get('/me', protect, blockViewers, getMe);

module.exports = router;