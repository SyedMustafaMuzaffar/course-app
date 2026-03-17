const express = require('express');
const router = express.Router();
const { getAllSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllSubjects);
router.get('/:id', getSubjectById);

// Admin only routes
router.post('/', authenticate, authorizeAdmin, createSubject);
router.put('/:id', authenticate, authorizeAdmin, updateSubject);
router.delete('/:id', authenticate, authorizeAdmin, deleteSubject);

module.exports = router;
