const pool = require('../config/db');

class SectionModel {
  static async getBySubjectId(subjectId) {
    const [rows] = await pool.execute(
      'SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC',
      [subjectId]
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM sections WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(subjectId, title, orderIndex) {
    const [result] = await pool.execute(
      'INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)',
      [subjectId, title, orderIndex]
    );
    return result.insertId;
  }

  static async update(id, title, orderIndex) {
    await pool.execute(
      'UPDATE sections SET title = ?, order_index = ? WHERE id = ?',
      [title, orderIndex, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM sections WHERE id = ?', [id]);
  }
}

module.exports = SectionModel;
