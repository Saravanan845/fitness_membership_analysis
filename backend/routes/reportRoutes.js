const express = require('express');
const router = express.Router();
const { getRetentionReport, exportMembersCSV } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/retention', protect, getRetentionReport);
router.get('/members/csv', protect, exportMembersCSV);

module.exports = router;
