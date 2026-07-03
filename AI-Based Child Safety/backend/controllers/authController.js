const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const demoUser = {
  id: 'demo-admin',
  name: 'System Admin',
  email: 'admin@childsafety.gov',
  role: 'admin',
  department: 'Child Safety Operations'
};

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRE;

  if (!secret) {
    // Hard fail with clear message; avoids confusing invalid-token errors
    throw new Error('JWT_SECRET is missing in backend .env');
  }

  return jwt.sign({ id }, secret, {
    expiresIn: expiresIn || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is unavailable. Please use the demo admin login.'
      });
    }

    const { name, email, password, role, department } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Registration failed'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    if (mongoose.connection.readyState !== 1) {
      if (email === demoUser.email && password === 'Admin@123') {
        return res.status(200).json({
          success: true,
          token: generateToken(demoUser.id),
          user: demoUser
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Login failed'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1 && req.user?.id === demoUser.id) {
      return res.status(200).json({
        success: true,
        user: demoUser
      });
    }

    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
