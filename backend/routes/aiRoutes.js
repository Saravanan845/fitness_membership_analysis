const express = require('express');
const router = express.Router();
const {
  getMemberAiInsights,
  getClubRetentionStrategy
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/member-insights', protect, getMemberAiInsights);
router.get('/club-strategy', protect, getClubRetentionStrategy);

module.exports = router;
