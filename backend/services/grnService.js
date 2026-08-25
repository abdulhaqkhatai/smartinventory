import db from '../config/db.js';
import { generateCode } from '../utils/codeGenerator.js';

const fallbackGRNs = [];

const mapGrnRow = (row) => {
  if (!row) return row;
  return {
    ...row,
    date: row.received_date,
    status: row.status === 'verified' ? 'completed' : 'partial',
    items: typeof row.items === 'string' ? JSON.parse(row.items || '[]') : (row.items || [])
  };
};

const applyGRNFilters = (rows, filters = {}) => {
  let result = [...rows];
  if (filters.status) result = result.filter((row) => row.status === filters.status);
  if (filters.poRef) result = result.filter((row) => row.po_ref === filters.poRef);
  if (filters.vendorName) result = result.filter((row) => row.vendor_name === filters.vendorName);
  result.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  return result;
};

// Get all GRNs with filters
export const getAllGRNs = async (filters = {}, limit = 20, offset = 0) => {
  try {
    let query = 'SELECT * FROM grn_receipts WHERE 1=1';
    const values = [];

    if (filters.status) {
      query += ' AND status = ?';
      values.push(filters.status === 'completed' ? 'verified' : 'draft');
    }

    if (filters.poRef) {
      query += ' AND po_ref = ?';
      values.push(filters.poRef);
    }

    if (filters.vendorName) {
      query += ' AND vendor_name = ?';
      values.push(filters.vendorName);
    }

    query += ' ORDER BY received_date DESC LIMIT ? OFFSET ?';
    values.push(parseInt(limit) || 20, parseInt(offset) || 0);

    const [grns] = await db.query(query, values);
    return grns.map(mapGrnRow);
  } catch (error) {
    console.warn('Database error fetching GRNs, using fallback data:', error.message);
    const rows = applyGRNFilters(fallbackGRNs, filters);
    const start = Number.parseInt(offset, 10) || 0;
    const pageSize = Number.parseInt(limit, 10) || 20;
    return rows.slice(start, start + pageSize);
  }
};

// Get count of GRNs
export const getGRNCount = async (filters = {}) => {
  try {
    let query = 'SELECT COUNT(*) as count FROM grn_receipts WHERE 1=1';
    const values = [];

    if (filters.status) {
      query += ' AND status = ?';
      values.push(filters.status === 'completed' ? 'verified' : 'draft');
    }

    if (filters.poRef) {
      query += ' AND po_ref = ?';
      values.push(filters.poRef);
    }

    const [result] = await db.query(query, values);
    return result[0].count;
  } catch (error) {
    return applyGRNFilters(fallbackGRNs, filters).length;
  }
};

// Get single GRN by ID
export const getGRNById = async (id) => {
  try {
    const [grns] = await db.query(
      'SELECT * FROM grn_receipts WHERE id = ?',
      [id]
    );
    return mapGrnRow(grns[0]) || null;
  } catch (error) {
    return fallbackGRNs.find((row) => row.id === Number(id)) || null;
  }
};

// Create new GRN
export const createGRN = async (grnData) => {
  try {
    const { poRef, vendorName, receivedBy, items, remarks } = grnData;
    const code = await generateCode('GRN');
    const date = new Date().toISOString().split('T')[0];

    let status = 'completed';
    items.forEach((item) => {
      if (Number(item.receivedQty || 0) < Number(item.orderedQty || 0)) {
        status = 'partial';
      }
    });

    const dbStatus = status === 'completed' ? 'verified' : 'draft';

    const [result] = await db.query(
      `INSERT INTO grn_receipts (code, po_ref, vendor_name, invoice_number, invoice_date, received_date, received_by, status, items, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, poRef, vendorName, 'N/A', date, date, receivedBy, dbStatus, JSON.stringify(items), remarks || null]
    );

    return getGRNById(result.insertId);
  } catch (error) {
    console.error('Error creating GRN:', error);
    throw error;
  }
};

// Update GRN
export const updateGRN = async (id, updateData) => {
  try {
    const allowed = ['po_ref', 'vendor_name', 'received_by', 'items', 'status', 'remarks'];
    const updates = [];
    const values = [];

    Object.keys(updateData).forEach((key) => {
      if (allowed.includes(key)) {
        updates.push(`${key} = ?`);
        let val = updateData[key];
        if (key === 'items') val = JSON.stringify(val);
        if (key === 'status') val = val === 'completed' ? 'verified' : 'draft';
        values.push(val);
      }
    });

    if (updates.length === 0) return getGRNById(id);

    values.push(id);
    await db.query(
      `UPDATE grn_receipts SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return getGRNById(id);
  } catch (error) {
    console.error('Error updating GRN:', error);
    throw error;
  }
};

// Delete GRN
export const deleteGRN = async (id) => {
  try {
    const [result] = await db.query(
      'DELETE FROM grn_receipts WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting GRN:', error);
    return false;
  }
};
