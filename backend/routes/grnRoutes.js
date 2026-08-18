import express from 'express';
import * as grnController from '../controllers/grnController.js';

const router = express.Router();

// Get all GRNs with optional filtering
router.get('/', grnController.getAllGRNs);

// Get GRN by ID
router.get('/:id', grnController.getGRNById);

// Create new GRN
router.post('/', grnController.createGRN);

// Update GRN
router.put('/:id', grnController.updateGRN);

// Delete GRN
router.delete('/:id', grnController.deleteGRN);

// Get GRNs by PO reference
router.get('/po/:poRef', grnController.getGRNsByPO);

// Get GRNs by status
router.get('/status/:status', grnController.getGRNsByStatus);

// Get GRNs by vendor
router.get('/vendor/:vendorName', grnController.getGRNsByVendor);

export default router;
