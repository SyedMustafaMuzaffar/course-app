const express = require('express');
const router = express.Router();
const { getVideoProgress, getSubjectProgress, updateProgress } = require('../controllers/progressController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/video/:videoId', authenticate, getVideoProgress);
router.get('/subject/:subjectId', authenticate, getSubjectProgress);
router.post('/update', authenticate, updateProgress);

module.exports = router;
