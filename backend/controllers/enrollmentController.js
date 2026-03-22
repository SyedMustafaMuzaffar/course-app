const EnrollmentModel = require('../models/enrollmentModel');

const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await EnrollmentModel.getByUser(req.user.id);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const checkUserEnrollment = async (req, res) => {
  try {
    const isEnrolled = await EnrollmentModel.checkEnrollment(req.user.id, req.params.subjectId);
    res.json({ isEnrolled });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const enrollStudent = async (req, res) => {
  let subject_id;
  try {
    ({ subject_id } = req.body);
    
    // Add a quick DB connectivity check to avoid long hangs
    const pool = require('../config/db');
    try {
      await Promise.race([
        pool.query('SELECT 1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), 5000))
      ]);
    } catch (dbErr) {
      console.error('Enrollment DB Check Failed:', dbErr.message);
      return res.status(503).json({ 
        message: 'The enrollment system is temporarily busy. Please try again in 30 seconds.',
        error: 'DB_UNAVAILABLE' 
      });
    }

    // Check if already enrolled
    const exists = await EnrollmentModel.checkEnrollment(req.user?.id, subject_id);
    if (exists) {
      return res.status(400).json({ message: 'Already enrolled in this subject' });
    }

    const id = await EnrollmentModel.enroll(req.user?.id, subject_id);
    res.status(201).json({ message: 'Enrolled successfully', id });

  } catch (error) {
    console.error('CRITICAL ENROLLMENT ERROR:', {
      userId: req.user?.id,
      subjectId: subject_id,
      error: error.message,
      code: error.code
    });


    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Already enrolled' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(400).json({ 
        message: 'This course entry is outdated. Please refresh your course catalog and try again.',
        error: 'STALE_ID'
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSubjectStats = async (req, res) => {
  try {
    const stats = await EnrollmentModel.getSubjectDashboardStats(req.params.subjectId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMyEnrollments, checkUserEnrollment, enrollStudent, getSubjectStats };
