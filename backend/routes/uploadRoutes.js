const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadCsv } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/csv', protect, upload.single('file'), uploadCsv);

module.exports = router;
