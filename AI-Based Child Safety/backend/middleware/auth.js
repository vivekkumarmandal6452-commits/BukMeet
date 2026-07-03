const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const demoUser = {
  id: 'demo-admin',
  name: 'System Admin',
  email: 'admin@childsafety.gov',
  role: 'admin',
  department: 'Child Safety Operations',
  isActive: true
};

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(401).json({
        success: false,
        message: 'JWT_SECRET missing on server'
      });
    }

    const decoded = jwt.verify(token, secret);

    // Always allow demo admin, even if MongoDB is offline/initializing
    if (decoded.id === demoUser.id) {
      req.user = demoUser;
      return next();
    }

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }


    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error?.name === 'TokenExpiredError'
        ? 'Session expired'
        : 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
