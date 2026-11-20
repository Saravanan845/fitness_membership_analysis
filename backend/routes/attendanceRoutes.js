const express = require('express');
const router = express.Router();
const {
  recordAttendance,
  getAttendanceLogs,
  getAttendanceStats
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, recordAttendance);
router.get('/', protect, getAttendanceLogs);
router.get('/stats', protect, getAttendanceStats);

module.exports = router;
