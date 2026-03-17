const pool = require('../config/db');

class EnrollmentModel {
  static async getByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT e.id, e.user_id, e.subject_id, e.enrolled_at, s.title as subject_title, s.thumbnail_url 
       FROM enrollments e 
       JOIN subjects s ON e.subject_id = s.id 
       WHERE e.user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async checkEnrollment(userId, subjectId) {
    const [rows] = await pool.execute(
      'SELECT * FROM enrollments WHERE user_id = ? AND subject_id = ?',
      [userId, subjectId]
    );
    return rows.length > 0;
  }

  static async enroll(userId, subjectId) {
    const [result] = await pool.execute(
      'INSERT INTO enrollments (user_id, subject_id) VALUES (?, ?)',
      [userId, subjectId]
    );
    return result.insertId;
  }

  static async getSubjectDashboardStats(subjectId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM enrollments WHERE subject_id = ?',
      [subjectId]
    );
    return { enrolled: rows[0].count };
  }
}

module.exports = EnrollmentModel;
