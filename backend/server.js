import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { testDatabaseConnection } from './config/db.js';
import { verifyToken, optionalAuth } from './middleware/auth.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import indentRoutes from './routes/indentRoutes.js';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js';
import grnRoutes from './routes/grnRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

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
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Test database connection on startup
testDatabaseConnection();

// Health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Inventory Backend is running',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Inventory API is working',
    timestamp: new Date(),
  });
});

// Core API Routes (Intern 1: Auth, Items, Vendors, Dashboard Reports)
app.use('/api/auth', authRoutes);
app.use('/api/items', optionalAuth, itemRoutes);
app.use('/api/vendors', optionalAuth, vendorRoutes);
app.use('/api/reports', optionalAuth, reportRoutes);

// Additional Modules (Intern 2 & Intern 3)
app.use('/api/assets', optionalAuth, assetRoutes);
app.use('/api/issues', optionalAuth, issueRoutes);
app.use('/api/returns', optionalAuth, returnRoutes);
app.use('/api/indents', optionalAuth, indentRoutes);
app.use('/api/purchase-orders', optionalAuth, purchaseOrderRoutes);
app.use('/api/grn', optionalAuth, grnRoutes);
app.use('/api/inventory', optionalAuth, inventoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('=================================');
  console.log('Smart Inventory Backend');
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log('=================================');
});

export default app;