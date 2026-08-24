import db from '../config/db.js';

const fallbackItems = [
  {
    id: 1,
    code: 'ITM-1001',
    name: 'HP LaserJet Toner 12A',
    category: 'Office Supplies',
    current_stock: 18,
    min_stock: 5,
    max_stock: 60,
    reorder_level: 8,
    unit_price: 2450,
  },
  {
    id: 2,
    code: 'ITM-1002',
    name: 'Laptop Stand',
    category: 'Accessories',
    current_stock: 4,
    min_stock: 3,
    max_stock: 30,
    reorder_level: 5,
    unit_price: 1200,
  },
];

const fallbackMovements = [
  {
    id: 1,
    item_id: 1,
    date: '2024-12-24',
    type: 'Stock In',
    quantity: 5,
    reference: 'GRN-2024-001',
    warehouse: 'Main Store',
    performed_by: 'Priya Sharma',
    remarks: 'Stock received from GRN-2024-001',
  },
];

const applyMovementFilters = (rows, filters = {}) => {
  let result = [...rows];

  if (filters.type) {
    result = result.filter((row) => row.type === filters.type);
  }

  if (filters.itemId) {
    result = result.filter((row) => Number(row.item_id) === Number(filters.itemId));
  }

  result.sort((a, b) => new Date(b.date) - new Date(a.date));
  return result;
};

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
    console.warn('Database error fetching stock movements, using fallback data:', error.message);
    const rows = applyMovementFilters(fallbackMovements, filters);
    const start = Number.parseInt(offset, 10) || 0;
    const pageSize = Number.parseInt(limit, 10) || 20;
    return rows.slice(start, start + pageSize);
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
    return applyMovementFilters(fallbackMovements, filters).length;
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
    return fallbackMovements.find((row) => row.id === Number(id)) || null;
  }
};

// Get current stock levels for all items
export const getStockLevels = async () => {
  try {
    const [levels] = await db.query(
      `SELECT id, code, name, quantity_in_stock AS current_stock, min_stock, max_stock, reorder_level
       FROM items
       ORDER BY name`
    );
    return levels;
  } catch (error) {
    return fallbackItems.map((item) => ({ ...item }));
  }
};

// Get stock level for specific item
export const getItemStock = async (itemId) => {
  try {
    const [items] = await db.query(
      `SELECT id, code, name, quantity_in_stock AS current_stock, min_stock, max_stock, reorder_level
       FROM items WHERE id = ?`,
      [itemId]
    );
    return items[0] || null;
  } catch (error) {
    return fallbackItems.find((item) => Number(item.id) === Number(itemId)) || null;
  }
};

// Record stock in (from GRN)
export const recordStockIn = async (movementData) => {
  try {
    const { itemId, quantity, reference, warehouse, performedBy, remarks } = movementData;
    const date = new Date().toISOString().split('T')[0];

    await db.query(
      'UPDATE items SET quantity_in_stock = quantity_in_stock + ? WHERE id = ?',
      [quantity, itemId]
    );

    const [result] = await db.query(
      `INSERT INTO stock_movements (item_id, date, type, quantity, reference, warehouse, performed_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, date, 'Stock In', quantity, reference, warehouse || 'Main Store', performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    const item = fallbackItems.find((entry) => Number(entry.id) === Number(movementData.itemId));
    if (item) {
      item.current_stock += Number(movementData.quantity || 0);
    }
    const newRow = {
      id: Date.now(),
      item_id: movementData.itemId,
      date: new Date().toISOString().split('T')[0],
      type: 'Stock In',
      quantity: Number(movementData.quantity || 0),
      reference: movementData.reference || 'GRN-LOCAL',
      warehouse: movementData.warehouse || 'Main Store',
      performed_by: movementData.performedBy || 'System',
      remarks: movementData.remarks || null,
    };
    fallbackMovements.push(newRow);
    return newRow;
  }
};

// Record stock out (issue)
export const recordStockOut = async (movementData) => {
  try {
    const { itemId, quantity, reference, warehouse, performedBy, remarks } = movementData;
    const date = new Date().toISOString().split('T')[0];

    await db.query(
      'UPDATE items SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?',
      [quantity, itemId]
    );

    const [result] = await db.query(
      `INSERT INTO stock_movements (item_id, date, type, quantity, reference, warehouse, performed_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, date, 'Issue', quantity, reference, warehouse || 'Main Store', performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    const item = fallbackItems.find((entry) => Number(entry.id) === Number(movementData.itemId));
    if (item) {
      item.current_stock -= Number(movementData.quantity || 0);
    }
    const newRow = {
      id: Date.now(),
      item_id: movementData.itemId,
      date: new Date().toISOString().split('T')[0],
      type: 'Issue',
      quantity: Number(movementData.quantity || 0),
      reference: movementData.reference || 'ISS-LOCAL',
      warehouse: movementData.warehouse || 'Main Store',
      performed_by: movementData.performedBy || 'System',
      remarks: movementData.remarks || null,
    };
    fallbackMovements.push(newRow);
    return newRow;
  }
};

// Record stock transfer
export const recordStockTransfer = async (movementData) => {
  try {
    const { itemId, quantity, fromWarehouse, toWarehouse, reference, performedBy, remarks } = movementData;
    const date = new Date().toISOString().split('T')[0];

    const [result] = await db.query(
      `INSERT INTO stock_movements (item_id, date, type, quantity, reference, warehouse, performed_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, date, 'Transfer', quantity, reference, `${fromWarehouse} → ${toWarehouse}`, performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    const newRow = {
      id: Date.now(),
      item_id: movementData.itemId,
      date: new Date().toISOString().split('T')[0],
      type: 'Transfer',
      quantity: Number(movementData.quantity || 0),
      reference: movementData.reference || 'TR-LOCAL',
      warehouse: `${movementData.fromWarehouse || 'Main'} → ${movementData.toWarehouse || 'Secondary'}`,
      performed_by: movementData.performedBy || 'System',
      remarks: movementData.remarks || null,
    };
    fallbackMovements.push(newRow);
    return newRow;
  }
};

// Record stock adjustment
export const recordStockAdjustment = async (movementData) => {
  try {
    const { itemId, quantity, reason, reference, warehouse, performedBy, remarks } = movementData;
    const date = new Date().toISOString().split('T')[0];

    await db.query(
      'UPDATE items SET quantity_in_stock = quantity_in_stock + ? WHERE id = ?',
      [quantity, itemId]
    );

    const [result] = await db.query(
      `INSERT INTO stock_movements (item_id, date, type, quantity, reference, warehouse, performed_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, date, `Adjustment (${reason})`, quantity, reference, warehouse || 'Main Store', performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    const item = fallbackItems.find((entry) => Number(entry.id) === Number(movementData.itemId));
    if (item) {
      item.current_stock += Number(movementData.quantity || 0);
    }
    const newRow = {
      id: Date.now(),
      item_id: movementData.itemId,
      date: new Date().toISOString().split('T')[0],
      type: `Adjustment (${movementData.reason || 'General'})`,
      quantity: Number(movementData.quantity || 0),
      reference: movementData.reference || 'ADJ-LOCAL',
      warehouse: movementData.warehouse || 'Main Store',
      performed_by: movementData.performedBy || 'System',
      remarks: movementData.remarks || null,
    };
    fallbackMovements.push(newRow);
    return newRow;
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
    const rows = fallbackMovements.filter((row) => Number(row.item_id) === Number(itemId));
    const start = Number.parseInt(offset, 10) || 0;
    const pageSize = Number.parseInt(limit, 10) || 20;
    return rows.slice(start, start + pageSize);
  }
};

// Get low stock items
export const getLowStockItems = async () => {
  try {
    const [items] = await db.query(
      `SELECT id, code, name, quantity_in_stock AS current_stock, min_stock, reorder_level
       FROM items
       WHERE quantity_in_stock <= reorder_level
       ORDER BY quantity_in_stock ASC`
    );
    return items;
  } catch (error) {
    return fallbackItems.filter((item) => Number(item.current_stock) <= Number(item.reorder_level));
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
    return fallbackMovements.filter((row) => Number(row.item_id) === Number(itemId));
  }
};
