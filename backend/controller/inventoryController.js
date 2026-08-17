import * as inventoryService from '../services/inventoryService.js';

// Get all stock movements
export const getAllStockMovements = async (req, res) => {
  try {
    const { type, itemId, limit, offset } = req.query;
    const filters = {};

    if (type) filters.type = type;
    if (itemId) filters.itemId = itemId;

    const movements = await inventoryService.getAllStockMovements(filters, limit, offset);
    const count = await inventoryService.getStockMovementCount(filters);

    res.json({
      success: true,
      data: movements,
      pagination: {
        total: count,
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stock movement by ID
export const getStockMovementById = async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await inventoryService.getStockMovementById(id);

    if (!movement) {
      return res.status(404).json({ success: false, message: 'Stock movement not found' });
    }

    res.json({ success: true, data: movement });
  } catch (error) {
    console.error('Error fetching stock movement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current stock levels for all items
export const getStockLevels = async (req, res) => {
  try {
    const stockLevels = await inventoryService.getStockLevels();

    res.json({ success: true, data: stockLevels });
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stock level for specific item
export const getItemStock = async (req, res) => {
  try {
    const { itemId } = req.params;
    const stock = await inventoryService.getItemStock(itemId);

    if (!stock) {
      return res.status(404).json({ success: false, message: 'Item stock not found' });
    }

    res.json({ success: true, data: stock });
  } catch (error) {
    console.error('Error fetching item stock:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record stock in (from GRN)
export const recordStockIn = async (req, res) => {
  try {
    const { itemId, quantity, reference, warehouse, performedBy, remarks } = req.body;

    if (!itemId || !quantity || !reference) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: itemId, quantity, reference',
      });
    }

    const movement = await inventoryService.recordStockIn({
      itemId,
      quantity,
      reference,
      warehouse,
      performedBy,
      remarks,
    });

    res.status(201).json({
      success: true,
      data: movement,
      message: 'Stock in recorded successfully',
    });
  } catch (error) {
    console.error('Error recording stock in:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record stock out (issue)
export const recordStockOut = async (req, res) => {
  try {
    const { itemId, quantity, reference, warehouse, performedBy, remarks } = req.body;

    if (!itemId || !quantity || !reference) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: itemId, quantity, reference',
      });
    }

    const movement = await inventoryService.recordStockOut({
      itemId,
      quantity,
      reference,
      warehouse,
      performedBy,
      remarks,
    });

    res.status(201).json({
      success: true,
      data: movement,
      message: 'Stock out recorded successfully',
    });
  } catch (error) {
    console.error('Error recording stock out:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record stock transfer
export const recordStockTransfer = async (req, res) => {
  try {
    const { itemId, quantity, fromWarehouse, toWarehouse, reference, performedBy, remarks } = req.body;

    if (!itemId || !quantity || !fromWarehouse || !toWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: itemId, quantity, fromWarehouse, toWarehouse',
      });
    }

    const movement = await inventoryService.recordStockTransfer({
      itemId,
      quantity,
      fromWarehouse,
      toWarehouse,
      reference,
      performedBy,
      remarks,
    });

    res.status(201).json({
      success: true,
      data: movement,
      message: 'Stock transfer recorded successfully',
    });
  } catch (error) {
    console.error('Error recording stock transfer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record stock adjustment
export const recordStockAdjustment = async (req, res) => {
  try {
    const { itemId, quantity, reason, reference, warehouse, performedBy, remarks } = req.body;

    if (!itemId || quantity === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: itemId, quantity, reason',
      });
    }

    const movement = await inventoryService.recordStockAdjustment({
      itemId,
      quantity,
      reason,
      reference,
      warehouse,
      performedBy,
      remarks,
    });

    res.status(201).json({
      success: true,
      data: movement,
      message: 'Stock adjustment recorded successfully',
    });
  } catch (error) {
    console.error('Error recording stock adjustment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stock movements for specific item
export const getItemMovements = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { limit, offset } = req.query;
    const movements = await inventoryService.getAllStockMovements(
      { itemId },
      limit,
      offset
    );

    res.json({ success: true, data: movements });
  } catch (error) {
    console.error('Error fetching item movements:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await inventoryService.getLowStockItems();

    res.json({
      success: true,
      data: lowStockItems,
      message: `Found ${lowStockItems.length} items below reorder level`,
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stock movement history
export const getStockHistory = async (req, res) => {
  try {
    const { itemId } = req.params;
    const history = await inventoryService.getStockHistory(itemId);

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching stock history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
