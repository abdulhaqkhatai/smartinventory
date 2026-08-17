import { pool } from '../config/db.js';

export const vendorService = {
  async getAllVendors(filters = {}) {
    let query = 'SELECT * FROM vendors WHERE 1=1';
    const params = [];

    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getVendorById(id) {
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async createVendor(vendorData) {
    const {
      name, contact_person, email, phone, address, city, state, pincode,
      gst_number, pan_number, bank_name, bank_account, bank_ifsc, status, rating,
    } = vendorData;

    const [result] = await pool.query(
      'INSERT INTO vendors (name, contact_person, email, phone, address, city, state, pincode, gst_number, pan_number, bank_name, bank_account, bank_ifsc, status, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, contact_person, email, phone, address, city, state, pincode, gst_number, pan_number, bank_name, bank_account, bank_ifsc, status || 'active', rating || 0]
    );
    return { id: result.insertId, ...vendorData };
  },

  async updateVendor(id, vendorData) {
    const {
      name, contact_person, email, phone, address, city, state, pincode,
      gst_number, pan_number, bank_name, bank_account, bank_ifsc, status, rating,
    } = vendorData;

    const [result] = await pool.query(
      'UPDATE vendors SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, gst_number = ?, pan_number = ?, bank_name = ?, bank_account = ?, bank_ifsc = ?, status = ?, rating = ? WHERE id = ?',
      [name, contact_person, email, phone, address, city, state, pincode, gst_number, pan_number, bank_name, bank_account, bank_ifsc, status, rating, id]
    );
    return result.affectedRows > 0;
  },

  async deleteVendor(id) {
    const [result] = await pool.query('DELETE FROM vendors WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
