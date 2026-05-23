const User = require('../models/User');

// GET /api/users
// Superadmin only: list users with pagination, search, and role filtering.
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 12, 1);
    const search = req.query.search?.trim() || '';
    const role = req.query.role?.trim();
    const status = req.query.status?.trim();

    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: users.length,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
// Superadmin only: update user role, status, or profile metadata.
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const allowedUpdates = ['name', 'email', 'role', 'status', 'avatar', 'bio'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    if (updates.role && !['superadmin', 'editor', 'author', 'viewer'].includes(updates.role)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided.' });
    }

    if (updates.status && !['active', 'inactive', 'suspended'].includes(updates.status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
// Superadmin only: remove a user account.
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
