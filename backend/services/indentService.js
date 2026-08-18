import db from '../config/db.js';
import { generateCode } from '../utils/codeGenerator.js';

// Get all indents with filters
export const getAllIndents = async (filters = {}, limit = 20, offset = 0) => {
  try {
    let query = 'SELECT * FROM indents WHERE 1=1';
    const values = [];

    if (filters.status) {
      query += ' AND status = ?';
      values.push(filters.status);
    }

    if (filters.department) {
      query += ' AND department = ?';
      values.push(filters.department);
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    values.push(parseInt(limit) || 20, parseInt(offset) || 0);

    const [indents] = await db.query(query, values);
    return indents;
  } catch (error) {
    console.error('Database error in getAllIndents:', error);
    throw error;
  }
};

// Get count of indents
export const getIndentCount = async (filters = {}) => {
  try {
    let query = 'SELECT COUNT(*) as count FROM indents WHERE 1=1';
    const values = [];

    if (filters.status) {
      query += ' AND status = ?';
      values.push(filters.status);
    }

    if (filters.department) {
      query += ' AND department = ?';
      values.push(filters.department);
    }

    const [result] = await db.query(query, values);
    return result[0].count;
  } catch (error) {
    console.error('Database error in getIndentCount:', error);
    throw error;
  }
};

// Get single indent by ID
export const getIndentById = async (id) => {
  try {
    const [indents] = await db.query(
      'SELECT * FROM indents WHERE id = ?',
      [id]
    );
    return indents[0] || null;
  } catch (error) {
    console.error('Database error in getIndentById:', error);
    throw error;
  }
};

// Create new indent
export const createIndent = async (indentData) => {
  try {
    const { requestedBy, department, items, remarks } = indentData;
    const code = await generateCode('IND');
    const date = new Date().toISOString().split('T')[0];

    const [result] = await db.query(
      `INSERT INTO indents (code, requested_by, department, date, status, items, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, requestedBy, department, date, 'draft', JSON.stringify(items), remarks || null]
    );

    return getIndentById(result.insertId);
  } catch (error) {
    console.error('Database error in createIndent:', error);
    throw error;
  }
};

// Update indent
export const updateIndent = async (id, updateData) => {
  try {
    const allowed = ['requested_by', 'department', 'items', 'remarks'];
    const updates = [];
    const values = [];

    Object.keys(updateData).forEach((key) => {
      if (allowed.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(key === 'items' ? JSON.stringify(updateData[key]) : updateData[key]);
      }
    });

    if (updates.length === 0) return getIndentById(id);

    values.push(id);
    await db.query(
      `UPDATE indents SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return getIndentById(id);
  } catch (error) {
    console.error('Database error in updateIndent:', error);
    throw error;
  }
};

// Delete indent
export const deleteIndent = async (id) => {
  try {
    const [result] = await db.query(
      'DELETE FROM indents WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Database error in deleteIndent:', error);
    throw error;
  }
};

// Update indent status
export const updateIndentStatus = async (id, statusData) => {
  try {
    const { status, approvedBy, rejectionReason } = statusData;

    await db.query(
      `UPDATE indents 
       SET status = ?, approved_by = ?, rejection_reason = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, approvedBy || null, rejectionReason || null, id]
    );

    return getIndentById(id);
  } catch (error) {
    console.error('Database error in updateIndentStatus:', error);
    throw error;
  }
};
