const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fallbackStore = require('../utils/fallbackStore');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fittrack_secret_key_123456789',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user/admin
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (name, username, email, password).'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists.'
      });
    }

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role: role || 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password.'
      });
    }

    // Resilient fallback when MongoDB service is not started locally
    if (mongoose.connection.readyState !== 1) {
      const u = username.toLowerCase();
      if (
        (u === 'admin' || u === 'admin@fittrack.com') &&
        (password === 'adminpassword123' || password === 'admin123')
      ) {
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            _id: '673d00000000000000000001',
            name: 'System Admin',
            username: 'admin',
            email: 'admin@fittrack.com',
            role: 'admin',
            token: generateToken('673d00000000000000000001')
          }
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Pre-configured demo login is admin / adminpassword123'
      });
    }

    // Search by username or email
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Third-party authentication (Google SSO simulation / external auth)
// @route   POST /api/auth/oauth-login
// @access  Public
const oauthLogin = async (req, res) => {
  try {
    const { email, name, avatar, providerId } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Third-party user profile details (email, name) are required.'
      });
    }

    // Resilient fallback when MongoDB service is not started locally
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Google SSO Login successful',
        data: {
          _id: '673d00000000000000000002',
          name: name || 'Google Admin',
          username: (email.split('@')[0] || 'google_user').toLowerCase(),
          email: email.toLowerCase(),
          role: 'admin',
          avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          token: generateToken('673d00000000000000000002')
        }
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-generate username from email
      const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedUsername = `${baseUsername}_${uniqueSuffix}`;

      // Create random secure password for OAuth user
      const randomPassword = Math.random().toString(36).slice(-10) + 'OAuth123!';

      user = await User.create({
        name,
        username: generatedUsername,
        email: email.toLowerCase(),
        password: randomPassword,
        role: 'admin',
        authProvider: 'google',
        avatar: avatar || ''
      });
    }

    res.status(200).json({
      success: true,
      message: 'Third-party authentication successful',
      data: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Third-party login failed',
      error: error.message
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  oauthLogin,
  getProfile
};
