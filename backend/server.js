import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDatabaseConnection, pool } from './config/db.js';
import { verifyToken } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
testDatabaseConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', verifyToken, itemRoutes);
app.use('/api/vendors', verifyToken, vendorRoutes);
app.use('/api/reports', verifyToken, reportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
