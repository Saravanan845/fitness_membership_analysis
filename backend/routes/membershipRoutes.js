const express = require('express');
const router = express.Router();
const {
  getMemberships,
  renewMembership,
  getMembershipStats
} = require('../controllers/membershipController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMemberships);
router.post('/renew', protect, renewMembership);
router.get('/stats', protect, getMembershipStats);

module.exports = router;
