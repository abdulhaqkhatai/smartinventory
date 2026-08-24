import db from '../config/db.js';

const fallbackItems = [];
const fallbackMovements = [];

const mapMovementRow = (row) => {
  if (!row) return row;
  let mappedType = row.movement_type;
  if (mappedType === 'IN') mappedType = 'Stock In';
  else if (mappedType === 'OUT') mappedType = 'Issue';
  else if (mappedType === 'TRANSFER') mappedType = 'Transfer';
  else if (mappedType === 'ADJUSTMENT') mappedType = 'Adjustment';

  return {
    ...row,
    type: mappedType,
    reference: row.reference_code,
    warehouse: row.to_location || row.from_location || 'Main Store',
    remarks: row.notes,
    date: row.date ? new Date(row.date).toISOString().split('T')[0] : null
  };
};

const applyMovementFilters = (rows, filters = {}) => {
  let result = [...rows];
  if (filters.type) result = result.filter((row) => row.type === filters.type);
  if (filters.itemId) result = result.filter((row) => Number(row.item_id) === Number(filters.itemId));
  result.sort((a, b) => new Date(b.date) - new Date(a.date));
  return result;
};

// Get all stock movements with filters
export const getAllStockMovements = async (filters = {}, limit = 20, offset = 0) => {
  try {
    let query = 'SELECT * FROM inventory_movements WHERE 1=1';
    const values = [];

    if (filters.type) {
      query += ' AND movement_type = ?';
      let mappedType = filters.type;
      if (mappedType === 'Stock In') mappedType = 'IN';
      else if (mappedType === 'Issue') mappedType = 'OUT';
      else if (mappedType === 'Transfer') mappedType = 'TRANSFER';
      else if (mappedType === 'Adjustment') mappedType = 'ADJUSTMENT';
      values.push(mappedType);
    }

    if (filters.itemId) {
      query += ' AND item_id = ?';
      values.push(filters.itemId);
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    values.push(parseInt(limit) || 20, parseInt(offset) || 0);

    const [movements] = await db.query(query, values);
    return movements.map(mapMovementRow);
  } catch (error) {
    console.warn('Database error fetching stock movements:', error.message);
    const rows = applyMovementFilters(fallbackMovements, filters);
    const start = Number.parseInt(offset, 10) || 0;
    const pageSize = Number.parseInt(limit, 10) || 20;
    return rows.slice(start, start + pageSize);
  }
};

// Get count of stock movements
export const getStockMovementCount = async (filters = {}) => {
  try {
    let query = 'SELECT COUNT(*) as count FROM inventory_movements WHERE 1=1';
    const values = [];

    if (filters.type) {
      query += ' AND movement_type = ?';
      let mappedType = filters.type;
      if (mappedType === 'Stock In') mappedType = 'IN';
      else if (mappedType === 'Issue') mappedType = 'OUT';
      else if (mappedType === 'Transfer') mappedType = 'TRANSFER';
      else if (mappedType === 'Adjustment') mappedType = 'ADJUSTMENT';
      values.push(mappedType);
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
      'SELECT * FROM inventory_movements WHERE id = ?',
      [id]
    );
    return mapMovementRow(movements[0]) || null;
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

const getItemDetails = async (itemId) => {
  const [items] = await db.query('SELECT * FROM items WHERE id = ?', [itemId]);
  return items[0] || { code: 'N/A', name: 'Unknown Item' };
};

// Record stock in (from GRN)
export const recordStockIn = async (movementData) => {
  try {
    const { itemId, quantity, reference, warehouse, performedBy, remarks } = movementData;
    
    await db.query(
      'UPDATE items SET quantity_in_stock = quantity_in_stock + ? WHERE id = ?',
      [quantity, itemId]
    );

    const item = await getItemDetails(itemId);

    const [result] = await db.query(
      `INSERT INTO inventory_movements (reference_code, movement_type, item_id, item_code, item_name, quantity, to_location, performed_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reference || 'GRN-LOCAL', 'IN', itemId, item.code, item.name, quantity, warehouse || 'Main Store', performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Record stock out (issue)
export const recordStockOut = async (movementData) => {
  try {
    const { itemId, quantity, reference, warehouse, performedBy, remarks } = movementData;

    await db.query(
      'UPDATE items SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?',
      [quantity, itemId]
    );

    const item = await getItemDetails(itemId);

    const [result] = await db.query(
      `INSERT INTO inventory_movements (reference_code, movement_type, item_id, item_code, item_name, quantity, from_location, performed_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reference || 'ISS-LOCAL', 'OUT', itemId, item.code, item.name, quantity, warehouse || 'Main Store', performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Record stock transfer
export const recordStockTransfer = async (movementData) => {
  try {
    const { itemId, quantity, fromWarehouse, toWarehouse, reference, performedBy, remarks } = movementData;

    const item = await getItemDetails(itemId);

    const [result] = await db.query(
      `INSERT INTO inventory_movements (reference_code, movement_type, item_id, item_code, item_name, quantity, from_location, to_location, performed_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reference || 'TR-LOCAL', 'TRANSFER', itemId, item.code, item.name, quantity, fromWarehouse, toWarehouse, performedBy, remarks || null]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Record stock adjustment
export const recordStockAdjustment = async (movementData) => {
  try {
    const { itemId, quantity, reason, reference, warehouse, performedBy, remarks } = movementData;

    const item = await getItemDetails(itemId);
    const prevStock = item.quantity_in_stock || 0;
    const newStock = prevStock + Number(quantity);

    await db.query(
      'UPDATE items SET quantity_in_stock = ? WHERE id = ?',
      [newStock, itemId]
    );

    const adjustmentType = quantity > 0 ? 'INCREASE' : 'DECREASE';

    await db.query(
      `INSERT INTO stock_adjustments (item_id, adjustment_type, quantity, previous_stock, new_stock, reason, warehouse)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [itemId, adjustmentType, Math.abs(quantity), prevStock, newStock, reason || 'Manual Adjustment', warehouse || 'Main Store']
    );

    const [result] = await db.query(
      `INSERT INTO inventory_movements (reference_code, movement_type, item_id, item_code, item_name, quantity, from_location, to_location, performed_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reference || 'ADJ-LOCAL', 'ADJUSTMENT', itemId, item.code, item.name, Math.abs(quantity), warehouse || 'Main Store', warehouse || 'Main Store', performedBy, remarks || reason]
    );

    return getStockMovementById(result.insertId);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Get stock movements for specific item
export const getItemMovements = async (itemId, limit = 20, offset = 0) => {
  return getAllStockMovements({ itemId }, limit, offset);
};
