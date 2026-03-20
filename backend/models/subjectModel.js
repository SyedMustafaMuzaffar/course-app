const pool = require('../config/db');

class SubjectModel {
  static async getAll() {
    const [rows] = await pool.execute('SELECT id, title, description, thumbnail as thumbnail_url, created_at FROM subjects ORDER BY created_at DESC');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT id, title, description, thumbnail as thumbnail_url, created_at FROM subjects WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(title, description, thumbnail) {
    const [result] = await pool.execute(
      'INSERT INTO subjects (title, description, thumbnail) VALUES (?, ?, ?)',
      [title, description, thumbnail]
    );
    return result.insertId;
  }

  static async update(id, title, description, thumbnail) {
    await pool.execute(
      'UPDATE subjects SET title = ?, description = ?, thumbnail = ? WHERE id = ?',
      [title, description, thumbnail, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM subjects WHERE id = ?', [id]);
  }
}

module.exports = SubjectModel;
