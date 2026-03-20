const pool = require('../config/db');

class SubjectModel {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM subjects ORDER BY created_at DESC');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM subjects WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const subject = rows[0];

    // Fetch Sections
    const [sections] = await pool.execute('SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC', [id]);
    
    // Fetch Videos for each section
    for (let i = 0; i < sections.length; i++) {
      const [videos] = await pool.execute('SELECT * FROM videos WHERE section_id = ? ORDER BY order_index ASC', [sections[i].id]);
      sections[i].videos = videos;
    }

    subject.sections = sections;
    return subject;
  }

  static async create(title, description, thumbnail_url) {
    const [result] = await pool.execute(
      'INSERT INTO subjects (title, description, thumbnail_url) VALUES (?, ?, ?)',
      [title, description, thumbnail_url]
    );
    return result.insertId;
  }

  static async update(id, title, description, thumbnail_url) {
    await pool.execute(
      'UPDATE subjects SET title = ?, description = ?, thumbnail_url = ? WHERE id = ?',
      [title, description, thumbnail_url, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM subjects WHERE id = ?', [id]);
  }
}

module.exports = SubjectModel;
