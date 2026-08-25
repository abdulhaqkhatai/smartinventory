import db from '../config/db.js';
import { generateCode } from '../utils/codeGenerator.js';

const fallbackPurchaseOrders = [
  {
    id: 1,
    code: 'PO-2024-001',
    vendor_id: 1,
    vendor_name: 'TechWorld Solutions Pvt. Ltd.',
    indent_ref: 'IND-2024-001',
    date: '2024-12-17',
    delivery_date: '2024-12-25',
    status: 'pending',
    items: [{ itemId: 2, itemName: 'HP LaserJet Toner 12A', quantity: 5, rate: 2450, gstRate: 18 }],
    subtotal: 12250,
    gst_amount: 2205,
    total_amount: 14455,
    terms: 'Standard terms apply',
    payment_terms: 'Net 30',
    created_at: '2024-12-17T09:30:00.000Z',
    updated_at: '2024-12-17T09:30:00.000Z',
  },
];

const parsePurchaseOrderItems = (po) => {
  if (!po) return po;
  
  return {
    ...po,
    items: typeof po.items === 'string' ? JSON.parse(po.items || '[]') : (po.items || [])
  };
};

const applyPurchaseOrderFilters = (rows, filters = {}) => {
  let result = [...rows];

  if (filters.status) {
    result = result.filter((row) => row.status === filters.status);
  }

  if (filters.vendorId) {
    result = result.filter((row) => String(row.vendor_id) === String(filters.vendorId));
  }

  if (filters.indentRef) {
    result = result.filter((row) => row.indent_ref === filters.indentRef);
  }

  result.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  return result;
};

// Get all purchase orders with filters
export const getAllPurchaseOrders = async (filters = {}, limit = 20, offset = 0) => {
  try {
    let query = 'SELECT * FROM purchase_orders WHERE 1=1';
    const values = [];

    if (filters.status) {
      query += ' AND status = ?';
      values.push(filters.status);
    }

    if (filters.vendorId) {
      query += ' AND vendor_id = ?';
      values.push(filters.vendorId);
    }

    if (filters.indentRef) {
      query += ' AND indent_ref = ?';
      values.push(filters.indentRef);
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    values.push(parseInt(limit) || 20, parseInt(offset) || 0);

    const [pos] = await db.query(query, values);
    return pos.map(parsePurchaseOrderItems);
  } catch (error) {
    console.warn('Database error fetching purchase orders, using fallback data:', error.message);
    const rows = applyPurchaseOrderFilters(fallbackPurchaseOrders, filters);
    const start = Number.parseInt(offset, 10) || 0;
    const pageSize = Number.parseInt(limit, 10) || 20;
    return rows.slice(start, start + pageSize);
  }
};

// Get count of purchase orders
export const getPurchaseOrderCount = async (filters = {}) => {
  try {
    let query = 'SELECT COUNT(*) as count FROM purchase_orders WHERE 1=1';
    const values = [];

    if (filters.status) {
      query += ' AND status = ?';
      values.push(filters.status);
    }

    if (filters.vendorId) {
      query += ' AND vendor_id = ?';
      values.push(filters.vendorId);
    }

    const [result] = await db.query(query, values);
    return result[0].count;
  } catch (error) {
    return applyPurchaseOrderFilters(fallbackPurchaseOrders, filters).length;
  }
};

// Get single purchase order by ID
export const getPurchaseOrderById = async (id) => {
  try {
    const [pos] = await db.query(
      'SELECT * FROM purchase_orders WHERE id = ?',
      [id]
    );
    return pos[0] ? parsePurchaseOrderItems(pos[0]) : null;
  } catch (error) {
    return fallbackPurchaseOrders.find((row) => row.id === Number(id)) || null;
  }
};

// Create new purchase order
export const createPurchaseOrder = async (poData) => {
  try {
    const { vendorId, vendorName, indentRef, items, deliveryDate, terms, paymentTerms } = poData;
    const code = await generateCode('PO');
    const date = new Date().toISOString().split('T')[0];

    let subtotal = 0;
    let gstAmount = 0;

    items.forEach((item) => {
      const amount = item.quantity * item.rate;
      const gst = (amount * item.gstRate) / 100;
      subtotal += amount;
      gstAmount += gst;
    });

    const totalAmount = subtotal + gstAmount;

    const [result] = await db.query(
      `INSERT INTO purchase_orders 
       (code, vendor_id, vendor_name, indent_ref, date, delivery_date, status, items, subtotal, gst_amount, total_amount, terms, payment_terms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, vendorId, vendorName, indentRef || null, date, deliveryDate || null, 'pending', JSON.stringify(items), subtotal, gstAmount, totalAmount, terms || null, paymentTerms || null]
    );

    return getPurchaseOrderById(result.insertId);
  } catch (error) {
    const code = await generateCode('PO');
    const date = new Date().toISOString().split('T')[0];
    const subtotal = (poData.items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
    const gstAmount = (poData.items || []).reduce((sum, item) => sum + ((Number(item.quantity || 0) * Number(item.rate || 0)) * Number(item.gstRate || 0)) / 100, 0);
    const totalAmount = subtotal + gstAmount;
    const newRow = {
      id: Date.now(),
      code,
      vendor_id: poData.vendorId,
      vendor_name: poData.vendorName,
      indent_ref: poData.indentRef || null,
      date,
      delivery_date: poData.deliveryDate || null,
      status: 'pending',
      items: poData.items || [],
      subtotal,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      terms: poData.terms || null,
      payment_terms: poData.paymentTerms || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    fallbackPurchaseOrders.push(newRow);
    return newRow;
  }
};

// Update purchase order
export const updatePurchaseOrder = async (id, updateData) => {
  try {
    const allowed = ['vendor_id', 'vendor_name', 'delivery_date', 'items', 'terms', 'payment_terms'];
    const updates = [];
    const values = [];

    Object.keys(updateData).forEach((key) => {
      if (allowed.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(key === 'items' ? JSON.stringify(updateData[key]) : updateData[key]);
      }
    });

    if (updates.length === 0) return getPurchaseOrderById(id);

    values.push(id);
    await db.query(
      `UPDATE purchase_orders SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return getPurchaseOrderById(id);
  } catch (error) {
    const row = fallbackPurchaseOrders.find((item) => item.id === Number(id));
    if (!row) return null;

    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'vendor_id') row.vendor_id = value;
      if (key === 'vendor_name') row.vendor_name = value;
      if (key === 'delivery_date') row.delivery_date = value;
      if (key === 'items') row.items = value;
      if (key === 'terms') row.terms = value;
      if (key === 'payment_terms') row.payment_terms = value;
    });
    row.updated_at = new Date().toISOString();
    return row;
  }
};

// Delete purchase order
export const deletePurchaseOrder = async (id) => {
  try {
    const [result] = await db.query(
      'DELETE FROM purchase_orders WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    const before = fallbackPurchaseOrders.length;
    const filtered = fallbackPurchaseOrders.filter((row) => row.id !== Number(id));
    fallbackPurchaseOrders.length = 0;
    fallbackPurchaseOrders.push(...filtered);
    return before !== fallbackPurchaseOrders.length;
  }
};

// Update purchase order status
export const updatePurchaseOrderStatus = async (id, status) => {
  try {
    await db.query(
      'UPDATE purchase_orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    return getPurchaseOrderById(id);
  } catch (error) {
    const row = fallbackPurchaseOrders.find((item) => item.id === Number(id));
    if (!row) return null;
    row.status = status;
    row.updated_at = new Date().toISOString();
    return row;
  }
};
