import express from 'express';
import * as purchaseOrderController from '../controllers/purchaseOrderController.js';

const router = express.Router();

// Get purchase orders by indent reference
router.get('/indent/:indentRef', purchaseOrderController.getPurchaseOrdersByIndent);

// Get purchase orders by vendor
router.get('/vendor/:vendorId', purchaseOrderController.getPurchaseOrdersByVendor);

// Get purchase orders by status
router.get('/status/:status', purchaseOrderController.getPurchaseOrdersByStatus);

// Get all purchase orders with optional filtering
router.get('/', purchaseOrderController.getAllPurchaseOrders);

// Create new purchase order
router.post('/', purchaseOrderController.createPurchaseOrder);

// Update purchase order status
router.patch('/:id/status', purchaseOrderController.updatePurchaseOrderStatus);

// Get purchase order by ID
router.get('/:id', purchaseOrderController.getPurchaseOrderById);

// Update purchase order
router.put('/:id', purchaseOrderController.updatePurchaseOrder);

// Delete purchase order
router.delete('/:id', purchaseOrderController.deletePurchaseOrder);

export default router;
