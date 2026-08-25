import { authService } from '../services/authService.js';

export const authController = {
  async register(req, res) {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }

      const existingUser = await authService.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      const existingEmail = await authService.getUserByUsername(email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      // Default role to 'Employee' for new signups
      const validRoles = ['Admin', 'Employee', 'Store Manager', 'Purchase Manager'];
      const userRole = validRoles.includes(role) ? role : 'Employee';
      const newUser = await authService.createUser(username, email, password, userRole);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const user = await authService.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const isValidPassword = await authService.validatePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = await authService.generateToken(user);
      
      const roleMap = {
        'admin': 'Admin',
        'store_manager': 'Store Manager',
        'purchase_manager': 'Purchase Manager',
        'employee': 'Employee'
      };
      const formattedRole = roleMap[user.role?.toLowerCase()] || user.role;

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.username,
          email: user.email,
          role: formattedRole,

          location: user.location || 'General',
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  },

  async validateToken(req, res) {
    try {
      const userId = req.userId;
      const userRole = req.userRole;
      res.json({ valid: true, userId, userRole });
    } catch (error) {
      console.error('Validate token error:', error);
      res.status(500).json({ message: error.message });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters' });
      }

      await authService.changePassword(userId, currentPassword, newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({ message: error.message || 'Failed to change password' });
    }
  },
};
