const pool = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async create(name, email, hashedPassword, role = 'student') {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }
}

class TokenModel {
  static async storeRefreshToken(userId, token, expiresAt) {
    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  }

  static async findRefreshToken(token) {
    const [rows] = await pool.execute('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
    return rows[0];
  }

  static async deleteRefreshToken(token) {
    await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  }
}

module.exports = { UserModel, TokenModel };
