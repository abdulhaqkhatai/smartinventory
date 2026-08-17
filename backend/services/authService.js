import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const authService = {
  async getUserByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async generateToken(user) {
    return jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  },

  async createUser(username, email, password, role = 'user') {
    const hashedPassword = await this.hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    return { id: result.insertId, username, email, role };
  },
};
