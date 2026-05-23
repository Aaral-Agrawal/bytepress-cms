const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

 
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required.',
      });
    }

    // Block viewer role from admin panel entirely
    if (role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'Viewers cannot access the admin panel. Please use the public website.',
      });
    }

    // Only valid admin roles allowed
    const adminRoles = ['superadmin', 'editor', 'author'];
    if (!adminRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected.',
      });
    }

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Your account has been suspended. Contact your administrator.',
      });
    }

    // CRITICAL: Validate that the selected role matches the user's actual role
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Invalid role selected. Your account is registered as '${user.role}'.`,
      });
    }

    // Viewer check at user level
    if (user.role === 'viewer') {
      return res.status(403).json({
        success: false,
        message: 'Viewer accounts cannot access the admin panel.',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    await user.save({ validateBeforeSave: false });

    // Generate JWT
    const token = generateToken({ id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred. Please try again.',
    });
  }
};

 
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// ─── GET /api/auth/me ────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { login, logout, getMe };