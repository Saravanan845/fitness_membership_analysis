const express = require('express');
const router = express.Router();
const {
  getAnalyticsOverview,
  getAtRiskMembers,
  getChartAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview', protect, getAnalyticsOverview);
router.get('/at-risk', protect, getAtRiskMembers);
router.get('/charts', protect, getChartAnalytics);

module.exports = router;
