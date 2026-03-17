const pool = require('../config/db');

class VideoModel {
  static async getBySectionId(sectionId) {
    const [rows] = await pool.execute(
      'SELECT * FROM videos WHERE section_id = ? ORDER BY order_index ASC',
      [sectionId]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM videos WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(sectionId, title, youtubeUrl, duration, orderIndex) {
    const [result] = await pool.execute(
      'INSERT INTO videos (section_id, title, youtube_url, duration, order_index) VALUES (?, ?, ?, ?, ?)',
      [sectionId, title, youtubeUrl, duration, orderIndex]
    );
    return result.insertId;
  }

  static async update(id, title, youtubeUrl, duration, orderIndex) {
    await pool.execute(
      'UPDATE videos SET title = ?, youtube_url = ?, duration = ?, order_index = ? WHERE id = ?',
      [title, youtubeUrl, duration, orderIndex, id]
    );
  }

  static async reorder(updates) {
    // updates = [{ id: 1, order_index: 0 }, { id: 2, order_index: 1 }]
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const item of updates) {
        await connection.execute(
          'UPDATE videos SET order_index = ? WHERE id = ?',
          [item.order_index, item.id]
        );
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    await pool.execute('DELETE FROM videos WHERE id = ?', [id]);
  }
}

module.exports = VideoModel;
