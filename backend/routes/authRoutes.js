import express from 'express';
import { authController } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.get('/validate', verifyToken, authController.validateToken);
router.post('/change-password', verifyToken, authController.changePassword);

export default router;
