const express = require('express');
const router = express.Router();
const { getVideosBySection, createVideo, updateVideo, reorderVideos, deleteVideo } = require('../controllers/videoController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/section/:sectionId', authenticate, getVideosBySection); // Usually protected for students

// Admin only routes
router.post('/', authenticate, authorizeAdmin, createVideo);
router.post('/reorder', authenticate, authorizeAdmin, reorderVideos);
router.put('/:id', authenticate, authorizeAdmin, updateVideo);
router.delete('/:id', authenticate, authorizeAdmin, deleteVideo);

module.exports = router;
