import { authService } from '../services/authService.js';

export const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const user = await authService.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await authService.validatePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = await authService.generateToken(user);
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async validateToken(req, res) {
    try {
      const userId = req.userId;
      const userRole = req.userRole;
      res.json({ valid: true, userId, userRole });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
