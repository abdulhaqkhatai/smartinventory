import express from 'express';
import { authController } from '../controller/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.get('/validate', verifyToken, authController.validateToken);

export default router;
