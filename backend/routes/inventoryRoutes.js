import express from 'express';
import * as inventoryController from '../controllers/inventoryController.js';

const router = express.Router();

// Get current stock levels for all items
router.get('/stock/levels', inventoryController.getStockLevels);

// Get stock level for specific item
router.get('/item/:itemId/stock', inventoryController.getItemStock);

// Record stock in (from GRN)
router.post('/stock-in', inventoryController.recordStockIn);

// Record stock out (issue)
router.post('/stock-out', inventoryController.recordStockOut);

// Record stock transfer
router.post('/transfer', inventoryController.recordStockTransfer);

// Record stock adjustment
router.post('/adjustment', inventoryController.recordStockAdjustment);

// Get stock movements for specific item
router.get('/item/:itemId/movements', inventoryController.getItemMovements);

// Get low stock items (below reorder level)
router.get('/low-stock', inventoryController.getLowStockItems);

// Get stock movement history
router.get('/history/:itemId', inventoryController.getStockHistory);

// Get all stock movements/transactions
router.get('/', inventoryController.getAllStockMovements);

// Get stock movement by ID
router.get('/:id', inventoryController.getStockMovementById);

export default router;
