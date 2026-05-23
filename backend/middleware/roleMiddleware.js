 
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to perform this action.`,
        requiredRoles: roles,
      });
    }

    next(); // ← was missing
  };
};

/**
 * blockViewers
 * Blocks viewer role entirely from admin panel routes.
 */
const blockViewers = (req, res, next) => {
  if (req.user && req.user.role === 'viewer') {
    return res.status(403).json({
      success: false,
      message: 'Viewers are not permitted to access the admin panel.',
    });
  }

  next();  
};

 
const ownerOrAdmin = (req, res, next) => {
  const isOwner = req.resourceOwnerId &&
    req.resourceOwnerId.toString() === req.user._id.toString();
  const isPrivileged = ['superadmin', 'editor'].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    return res.status(403).json({
      success: false,
      message: 'You can only modify your own resources.',
    });
  }

  next(); 
};

module.exports = { authorize, blockViewers, ownerOrAdmin };