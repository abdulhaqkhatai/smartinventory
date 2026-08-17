import db from '../config/db.js';
import { generateCode } from '../utils/codeGenerator.js';

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
    return pos;
  } catch (error) {
    console.error('Database error in getAllPurchaseOrders:', error);
    throw error;
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
    console.error('Database error in getPurchaseOrderCount:', error);
    throw error;
  }
};

// Get single purchase order by ID
export const getPurchaseOrderById = async (id) => {
  try {
    const [pos] = await db.query(
      'SELECT * FROM purchase_orders WHERE id = ?',
      [id]
    );
    return pos[0] || null;
  } catch (error) {
    console.error('Database error in getPurchaseOrderById:', error);
    throw error;
  }
};

// Create new purchase order
export const createPurchaseOrder = async (poData) => {
  try {
    const { vendorId, vendorName, indentRef, items, deliveryDate, terms, paymentTerms } = poData;
    const code = await generateCode('PO');
    const date = new Date().toISOString().split('T')[0];

    // Calculate totals
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
    console.error('Database error in createPurchaseOrder:', error);
    throw error;
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
    console.error('Database error in updatePurchaseOrder:', error);
    throw error;
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
    console.error('Database error in deletePurchaseOrder:', error);
    throw error;
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
    console.error('Database error in updatePurchaseOrderStatus:', error);
    throw error;
  }
};
