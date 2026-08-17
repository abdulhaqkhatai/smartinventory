import express from 'express';
import { vendorController } from '../controller/vendorController.js';

const router = express.Router();

router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);
router.post('/', vendorController.createVendor);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

export default router;
