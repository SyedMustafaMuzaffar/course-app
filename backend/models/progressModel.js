const pool = require('../config/db');

class ProgressModel {
  static async getProgress(userId, videoId) {
    const [rows] = await pool.execute(
      'SELECT * FROM video_progress WHERE user_id = ? AND video_id = ?',
      [userId, videoId]
    );
    return rows[0];
  }

  static async getSubjectProgress(userId, subjectId) {
    // Returns completed video ids for a user in a specific subject
    const [rows] = await pool.execute(
      `SELECT vp.video_id, vp.completed 
       FROM video_progress vp 
       JOIN videos v ON vp.video_id = v.id 
       JOIN sections s ON v.section_id = s.id 
       WHERE vp.user_id = ? AND s.subject_id = ?`,
      [userId, subjectId]
    );
    return rows;
  }

  static async updateProgress(userId, videoId, watchedSeconds, completed) {
    const [existing] = await pool.execute(
      'SELECT id, completed FROM video_progress WHERE user_id = ? AND video_id = ?',
      [userId, videoId]
    );

    let isCompleted = completed;
    if (existing && existing.length > 0) {
      if (existing[0].completed) {
        isCompleted = true; // Never un-complete a video
      }
      await pool.execute(
        'UPDATE video_progress SET watched_seconds = ?, completed = ? WHERE user_id = ? AND video_id = ?',
        [watchedSeconds, isCompleted, userId, videoId]
      );
    } else {
      await pool.execute(
        'INSERT INTO video_progress (user_id, video_id, watched_seconds, completed) VALUES (?, ?, ?, ?)',
        [userId, videoId, watchedSeconds, isCompleted]
      );
    }
  }
}

module.exports = ProgressModel;
