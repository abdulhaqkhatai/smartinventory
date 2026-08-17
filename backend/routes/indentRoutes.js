import express from 'express';
import * as indentController from '../controller/indentController.js';

const router = express.Router();

// Get all indents with optional filtering
router.get('/', indentController.getAllIndents);

// Get indent by ID
router.get('/:id', indentController.getIndentById);

// Create new indent
router.post('/', indentController.createIndent);

// Update indent
router.put('/:id', indentController.updateIndent);

// Delete indent
router.delete('/:id', indentController.deleteIndent);

// Update indent status (approve/reject)
router.patch('/:id/status', indentController.updateIndentStatus);

// Get indents by status
router.get('/status/:status', indentController.getIndentsByStatus);

// Get indents by department
router.get('/department/:department', indentController.getIndentsByDepartment);

export default router;
