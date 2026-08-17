import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { testDatabaseConnection } from './config/db.js';
import { verifyToken } from './middleware/auth.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import indentRoutes from './routes/indentRoutes.js';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js';
import grnRoutes from './routes/grnRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import returnRoutes from './routes/returnRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test database connection on startup
testDatabaseConnection();

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Core API Routes (Auth, Items, Vendors, Dashboard/Reports)
app.use('/api/auth', authRoutes);
app.use('/api/items', verifyToken, itemRoutes);
app.use('/api/vendors', verifyToken, vendorRoutes);
app.use('/api/reports', verifyToken, reportRoutes);

// Additional Module Routes
app.use('/api/indents', indentRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/grn', grnRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/returns', returnRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
