import db from '../config/db.js';
import { generateCode } from '../utils/codeGenerator.js';

// Get all GRNs with filters
export const getAllGRNs = async (filters = {}, limit = 20, offset = 0) => {
  try {
    let query = 'SELECT * FROM grns WHERE 1=1';
    const values = [];

    if (filters.status) {
      query += ' AND status = ?';
      values.push(filters.status);
    }

    if (filters.poRef) {
      query += ' AND po_ref = ?';
      values.push(filters.poRef);
    }

    if (filters.vendorName) {
      query += ' AND vendor_name = ?';
      values.push(filters.vendorName);
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    values.push(parseInt(limit) || 20, parseInt(offset) || 0);

    const [grns] = await db.query(query, values);
    return grns;
  } catch (error) {
    console.error('Database error in getAllGRNs:', error);
    throw error;
  }
};

// Get count of GRNs
export const getGRNCount = async (filters = {}) => {
  try {
    let query = 'SELECT COUNT(*) as count FROM grns WHERE 1=1';
    const values = [];

    if (filters.status) {
      query += ' AND status = ?';
      values.push(filters.status);
    }

    if (filters.poRef) {
      query += ' AND po_ref = ?';
      values.push(filters.poRef);
    }

    const [result] = await db.query(query, values);
    return result[0].count;
  } catch (error) {
    console.error('Database error in getGRNCount:', error);
    throw error;
  }
};

// Get single GRN by ID
export const getGRNById = async (id) => {
  try {
    const [grns] = await db.query(
      'SELECT * FROM grns WHERE id = ?',
      [id]
    );
    return grns[0] || null;
  } catch (error) {
    console.error('Database error in getGRNById:', error);
    throw error;
  }
};

// Create new GRN
export const createGRN = async (grnData) => {
  try {
    const { poRef, vendorName, receivedBy, items, remarks } = grnData;
    const code = await generateCode('GRN');
    const date = new Date().toISOString().split('T')[0];

    // Determine status based on items received
    let status = 'completed'; // default to completed if all items received fully
    items.forEach((item) => {
      if (item.receivedQty < item.orderedQty) {
        status = 'partial';
      }
    });

    const [result] = await db.query(
      `INSERT INTO grns (code, po_ref, vendor_name, date, received_by, status, items, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, poRef, vendorName, date, receivedBy, status, JSON.stringify(items), remarks || null]
    );

    return getGRNById(result.insertId);
  } catch (error) {
    console.error('Database error in createGRN:', error);
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
        values.push(key === 'items' ? JSON.stringify(updateData[key]) : updateData[key]);
      }
    });

    if (updates.length === 0) return getGRNById(id);

    values.push(id);
    await db.query(
      `UPDATE grns SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return getGRNById(id);
  } catch (error) {
    console.error('Database error in updateGRN:', error);
    throw error;
  }
};

// Delete GRN
export const deleteGRN = async (id) => {
  try {
    const [result] = await db.query(
      'DELETE FROM grns WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Database error in deleteGRN:', error);
    throw error;
  }
};
