const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  oauthLogin,
  getProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/oauth-login', oauthLogin);
router.get('/profile', protect, getProfile);

module.exports = router;
