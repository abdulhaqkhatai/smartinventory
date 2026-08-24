import db from '../config/db.js';
import { generateCode } from '../utils/codeGenerator.js';

const fallbackGRNs = [
  {
    id: 1,
    code: 'GRN-2024-001',
    po_ref: 'PO-2024-001',
    vendor_name: 'TechWorld Solutions Pvt. Ltd.',
    date: '2024-12-24',
    received_by: 'Priya Sharma',
    status: 'completed',
    items: [{ itemId: 2, itemName: 'HP LaserJet Toner 12A', orderedQty: 5, receivedQty: 5, damagedQty: 0, acceptedQty: 5 }],
    remarks: 'All items received in good condition',
    created_at: '2024-12-24T09:15:00.000Z',
    updated_at: '2024-12-24T09:15:00.000Z',
  },
];

const applyGRNFilters = (rows, filters = {}) => {
  let result = [...rows];

  if (filters.status) {
    result = result.filter((row) => row.status === filters.status);
  }

  if (filters.poRef) {
    result = result.filter((row) => row.po_ref === filters.poRef);
  }

  if (filters.vendorName) {
    result = result.filter((row) => row.vendor_name === filters.vendorName);
  }

  result.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  return result;
};

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
    return applyGRNFilters(fallbackGRNs, filters).length;
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

    const [result] = await db.query(
      `INSERT INTO grns (code, po_ref, vendor_name, date, received_by, status, items, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, poRef, vendorName, date, receivedBy, status, JSON.stringify(items), remarks || null]
    );

    return getGRNById(result.insertId);
  } catch (error) {
    const code = await generateCode('GRN');
    const date = new Date().toISOString().split('T')[0];
    const status = (grnData.items || []).some((item) => Number(item.receivedQty || 0) < Number(item.orderedQty || 0)) ? 'partial' : 'completed';
    const newRow = {
      id: Date.now(),
      code,
      po_ref: grnData.poRef,
      vendor_name: grnData.vendorName,
      date,
      received_by: grnData.receivedBy,
      status,
      items: grnData.items || [],
      remarks: grnData.remarks || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    fallbackGRNs.push(newRow);
    return newRow;
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
    const row = fallbackGRNs.find((item) => item.id === Number(id));
    if (!row) return null;

    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'po_ref') row.po_ref = value;
      if (key === 'vendor_name') row.vendor_name = value;
      if (key === 'received_by') row.received_by = value;
      if (key === 'items') row.items = value;
      if (key === 'status') row.status = value;
      if (key === 'remarks') row.remarks = value;
    });
    row.updated_at = new Date().toISOString();
    return row;
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
    const before = fallbackGRNs.length;
    const filtered = fallbackGRNs.filter((row) => row.id !== Number(id));
    fallbackGRNs.length = 0;
    fallbackGRNs.push(...filtered);
    return before !== fallbackGRNs.length;
  }
};
