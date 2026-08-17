import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const authService = {
  async getUserByUsername(identifier) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    );
    return rows[0] || null;
  },

  async generateToken(user) {
    const secret = process.env.JWT_SECRET || 'smart_inventory_jwt_secret_key_2026_secure';
    return jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      secret,
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
