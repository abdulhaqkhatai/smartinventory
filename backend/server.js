import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';

// Route imports
import indentRoutes from './routes/indentRoutes.js';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js';
import grnRoutes from './routes/grnRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// API Routes
app.use('/api/indents', indentRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/grn', grnRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/reports', reportRoutes);

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
