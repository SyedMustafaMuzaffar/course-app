const express = require('express');
const router = express.Router();
const { getMyEnrollments, checkUserEnrollment, enrollStudent, getSubjectStats } = require('../controllers/enrollmentController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

router.get('/my', authenticate, getMyEnrollments);
router.get('/check/:subjectId', authenticate, checkUserEnrollment);
router.post('/enroll', authenticate, enrollStudent);

// Admin route
router.get('/stats/:subjectId', authenticate, authorizeAdmin, getSubjectStats);

module.exports = router;
