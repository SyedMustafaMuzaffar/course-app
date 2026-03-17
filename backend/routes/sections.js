const express = require('express');
const router = express.Router();
const { getSectionsBySubject, createSection, updateSection, deleteSection } = require('../controllers/sectionController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/subject/:subjectId', getSectionsBySubject);

// Admin only routes
router.post('/', authenticate, authorizeAdmin, createSection);
router.put('/:id', authenticate, authorizeAdmin, updateSection);
router.delete('/:id', authenticate, authorizeAdmin, deleteSection);

module.exports = router;
