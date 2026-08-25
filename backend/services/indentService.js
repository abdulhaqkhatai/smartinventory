import db from '../config/db.js';
import { generateCode } from '../utils/codeGenerator.js';

const fallbackIndents = [
  {
    id: 1,
    code: 'IND-2024-001',
    requested_by: 'Sneha Reddy',
    department: 'Engineering',
    date: '2024-12-15',
    status: 'approved',
    items: [{ itemId: 2, itemName: 'HP LaserJet Toner 12A', quantity: 5, unit: 'PCS' }],
    remarks: 'Required for new setup',
    approved_by: 'Department Head',
    approval_date: '2024-12-16',
    rejection_reason: null,
    created_at: '2024-12-15T10:00:00.000Z',
    updated_at: '2024-12-16T10:00:00.000Z',
  },
];

const getFallbackIndents = () => fallbackIndents;

const parseIndentItems = (indent) => {
  if (!indent) return indent;
  
  return {
    ...indent,
    items: typeof indent.items === 'string' ? JSON.parse(indent.items || '[]') : (indent.items || [])
  };
};

const applyIndentFilters = (rows, filters = {}) => {
  let result = [...rows];

  if (filters.status) {
    result = result.filter((row) => row.status === filters.status);
  }

  if (filters.department) {
    result = result.filter((row) => row.department === filters.department);
  }

  result.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  return result;
};

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
    return indents.map(parseIndentItems);
  } catch (error) {
    console.warn('Database error fetching indents, using fallback data:', error.message);
    const rows = applyIndentFilters(getFallbackIndents(), filters);
    const start = Number.parseInt(offset, 10) || 0;
    const pageSize = Number.parseInt(limit, 10) || 20;
    return rows.slice(start, start + pageSize);
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
    return applyIndentFilters(getFallbackIndents(), filters).length;
  }
};

// Get single indent by ID
export const getIndentById = async (id) => {
  try {
    const [indents] = await db.query(
      'SELECT * FROM indents WHERE id = ?',
      [id]
    );
    return indents[0] ? parseIndentItems(indents[0]) : null;
  } catch (error) {
    return getFallbackIndents().find((item) => item.id === Number(id)) || null;
  }
};

// Create new indent
export const createIndent = async (indentData) => {
  try {
    const { requestedBy, department, items, remarks, status } = indentData;
    const code = await generateCode('IND');
    const date = new Date().toISOString().split('T')[0];
    const finalStatus = status ? status.toLowerCase() : 'draft';

    const [result] = await db.query(
      `INSERT INTO indents (code, requested_by, department, date, status, items, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, requestedBy, department, date, finalStatus, JSON.stringify(items), remarks || null]
    );

    return getIndentById(result.insertId);
  } catch (error) {
    const code = await generateCode('IND');
    const date = new Date().toISOString().split('T')[0];
    const newIndent = {
      id: Date.now(),
      code,
      requested_by: indentData.requestedBy,
      department: indentData.department,
      date,
      status: indentData.status ? indentData.status.toLowerCase() : 'draft',
      items: indentData.items || [],
      remarks: indentData.remarks || null,
      approved_by: null,
      approval_date: null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    fallbackIndents.push(newIndent);
    return newIndent;
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
    const fallbackIndex = fallbackIndents.findIndex((row) => row.id === Number(id));
    if (fallbackIndex === -1) return null;

    Object.entries(updateData).forEach(([key, value]) => {
      const mappedKey = key === 'requestedBy' ? 'requested_by' : key === 'remarks' ? 'remarks' : key;
      if (mappedKey === 'items') {
        fallbackIndents[fallbackIndex].items = value;
      } else if (mappedKey === 'department') {
        fallbackIndents[fallbackIndex].department = value;
      } else if (mappedKey === 'requested_by') {
        fallbackIndents[fallbackIndex].requested_by = value;
      } else if (mappedKey === 'remarks') {
        fallbackIndents[fallbackIndex].remarks = value;
      }
    });

    fallbackIndents[fallbackIndex].updated_at = new Date().toISOString();
    return fallbackIndents[fallbackIndex];
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
    const before = fallbackIndents.length;
    const filtered = fallbackIndents.filter((row) => row.id !== Number(id));
    fallbackIndents.length = 0;
    fallbackIndents.push(...filtered);
    return before !== fallbackIndents.length;
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
    const row = fallbackIndents.find((item) => item.id === Number(id));
    if (!row) return null;
    row.status = statusData.status;
    row.approved_by = statusData.approvedBy || row.approved_by || null;
    row.rejection_reason = statusData.rejectionReason || null;
    row.approval_date = new Date().toISOString().split('T')[0];
    row.updated_at = new Date().toISOString();
    return row;
  }
};
