import db from '../config/db.js';

// Get all stock movements with filters
export const getAllStockMovements = async (filters = {}, limit = 20, offset = 0) => {
  try {
    let query = 'SELECT * FROM stock_movements WHERE 1=1';
    const values = [];

    if (filters.type) {
      query += ' AND type = ?';
      values.push(filters.type);
    }

    if (filters.itemId) {
      query += ' AND item_id = ?';
      values.push(filters.itemId);
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    values.push(parseInt(limit) || 20, parseInt(offset) || 0);

    const [movements] = await db.query(query, values);
    return movements;
  } catch (error) {
    console.error('Database error in getAllStockMovements:', error);
    throw error;
  }
};

// Get count of stock movements
export const getStockMovementCount = async (filters = {}) => {
  try {
    let query = 'SELECT COUNT(*) as count FROM stock_movements WHERE 1=1';
    const values = [];

    if (filters.type) {
      query += ' AND type = ?';
      values.push(filters.type);
    }

    if (filters.itemId) {
      query += ' AND item_id = ?';
      values.push(filters.itemId);
    }

    const [result] = await db.query(query, values);
    return result[0].count;
  } catch (error) {
    console.error('Database error in getStockMovementCount:', error);
    throw error;
  }
};

// Get single stock movement by ID
export const getStockMovementById = async (id) => {
  try {
    const [movements] = await db.query(
      'SELECT * FROM stock_movements WHERE id = ?',
      [id]
    );
    return movements[0] || null;
  } catch (error) {
    console.error('Database error in getStockMovementById:', error);
    throw error;
  }
};

// Get current stock levels for all items
export const getStockLevels = async () => {
  try {
    const [levels] = await db.query(
      `SELECT id, code, name, current_stock, min_stock, max_stock, reorder_level
       FROM items
       ORDER BY name`
    );
    return levels;
  } catch (error) {
    console.error('Database error in getStockLevels:', error);
    throw error;
  }
};

// Get stock level for specific item
export const getItemStock = async (itemId) => {
  try {
    const [items] = await db.query(
      `SELECT id, code, name, current_stock, min_stock, max_stock, reorder_level
       FROM items WHERE id = ?`,
      [itemId]
    );
    return items[0] || null;
  } catch (error) {
    console.error('Database error in getItemStock:', error);
    throw error;
  }
};

// Record stock in (from GRN)
export const recordStockIn = async (movementData) => {
  try {
    const { itemId, quantity, reference, warehouse, performedBy, remarks } = movementData;
    const date = new Date().toISOString().split('T')[0];

    // Update item stock
    await db.query(
      'UPDATE items SET current_stock = current_stock + ? WHERE id = ?',
      [quantity, itemId]
    );

    // Record movement
    const [result] = await db.query(
      `INSERT INTO stock_movements (item_id, date, type, quantity, reference, warehouse, performed_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, date, 'Stock In', quantity, reference, warehouse || 'Main Store', performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    console.error('Database error in recordStockIn:', error);
    throw error;
  }
};

// Record stock out (issue)
export const recordStockOut = async (movementData) => {
  try {
    const { itemId, quantity, reference, warehouse, performedBy, remarks } = movementData;
    const date = new Date().toISOString().split('T')[0];

    // Update item stock
    await db.query(
      'UPDATE items SET current_stock = current_stock - ? WHERE id = ?',
      [quantity, itemId]
    );

    // Record movement
    const [result] = await db.query(
      `INSERT INTO stock_movements (item_id, date, type, quantity, reference, warehouse, performed_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, date, 'Issue', quantity, reference, warehouse || 'Main Store', performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    console.error('Database error in recordStockOut:', error);
    throw error;
  }
};

// Record stock transfer
export const recordStockTransfer = async (movementData) => {
  try {
    const { itemId, quantity, fromWarehouse, toWarehouse, reference, performedBy, remarks } = movementData;
    const date = new Date().toISOString().split('T')[0];

    // Record transfer
    const [result] = await db.query(
      `INSERT INTO stock_movements (item_id, date, type, quantity, reference, warehouse, performed_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, date, 'Transfer', quantity, reference, `${fromWarehouse} → ${toWarehouse}`, performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    console.error('Database error in recordStockTransfer:', error);
    throw error;
  }
};

// Record stock adjustment
export const recordStockAdjustment = async (movementData) => {
  try {
    const { itemId, quantity, reason, reference, warehouse, performedBy, remarks } = movementData;
    const date = new Date().toISOString().split('T')[0];

    // Update item stock
    await db.query(
      'UPDATE items SET current_stock = current_stock + ? WHERE id = ?',
      [quantity, itemId]
    );

    // Record movement
    const [result] = await db.query(
      `INSERT INTO stock_movements (item_id, date, type, quantity, reference, warehouse, performed_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, date, `Adjustment (${reason})`, quantity, reference, warehouse || 'Main Store', performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    console.error('Database error in recordStockAdjustment:', error);
    throw error;
  }
};

// Get stock movements for specific item
export const getItemMovements = async (itemId, limit = 20, offset = 0) => {
  try {
    const [movements] = await db.query(
      `SELECT * FROM stock_movements WHERE item_id = ? ORDER BY date DESC LIMIT ? OFFSET ?`,
      [itemId, parseInt(limit) || 20, parseInt(offset) || 0]
    );
    return movements;
  } catch (error) {
    console.error('Database error in getItemMovements:', error);
    throw error;
  }
};

// Get low stock items
export const getLowStockItems = async () => {
  try {
    const [items] = await db.query(
      `SELECT id, code, name, current_stock, min_stock, reorder_level
       FROM items
       WHERE current_stock <= reorder_level
       ORDER BY current_stock ASC`
    );
    return items;
  } catch (error) {
    console.error('Database error in getLowStockItems:', error);
    throw error;
  }
};

// Get stock history for item
export const getStockHistory = async (itemId) => {
  try {
    const [movements] = await db.query(
      `SELECT date, type, quantity, reference, warehouse, performed_by, remarks
       FROM stock_movements
       WHERE item_id = ?
       ORDER BY date DESC`,
      [itemId]
    );
    return movements;
  } catch (error) {
    console.error('Database error in getStockHistory:', error);
    throw error;
  }
};
