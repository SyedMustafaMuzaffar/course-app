const EnrollmentModel = require('../models/enrollmentModel');

const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await EnrollmentModel.getByUser(req.user.id);
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
  try {
    const { subject_id } = req.body;
    
    // Check if already enrolled
    const exists = await EnrollmentModel.checkEnrollment(req.user.id, subject_id);
    if (exists) {
      return res.status(400).json({ message: 'Already enrolled in this subject' });
    }

    const id = await EnrollmentModel.enroll(req.user.id, subject_id);
    res.status(201).json({ message: 'Enrolled successfully', id });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Already enrolled' });
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
