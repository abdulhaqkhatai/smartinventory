import { pool } from '../config/db.js';

export const formatVendor = (vendor) => {
  if (!vendor) return null;
  return {
    ...vendor,
    id: vendor.id,
    name: vendor.name,
    contact_person: vendor.contact_person || '',
    email: vendor.email || '',
    phone: vendor.phone || '',
    address: vendor.address || '',
    city: vendor.city || '',
    state: vendor.state || '',
    pincode: vendor.pincode || '',
    gst_number: vendor.gst_number || '',
    pan_number: vendor.pan_number || '',
    bank_name: vendor.bank_name || '',
    bank_account: vendor.bank_account || '',
    bank_ifsc: vendor.bank_ifsc || '',
    status: vendor.status || 'active',
    rating: Number(vendor.rating || 0),
    totalOrders: Number(vendor.total_orders || vendor.totalOrders || 0),
    created_at: vendor.created_at,
    updated_at: vendor.updated_at,
  };
};

export const vendorService = {
  async getAllVendors(filters = {}) {
    let query = 'SELECT * FROM vendors WHERE 1=1';
    const params = [];

    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR contact_person LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.status && filters.status !== 'All') {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY id DESC';

    const [rows] = await pool.query(query, params);
    return rows.map(formatVendor);
  },

  async getVendorById(id) {
    const [rows] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
    return rows[0] ? formatVendor(rows[0]) : null;
  },

  async createVendor(vendorData) {
    const {
      name, contact_person = '', email = '', phone = '', address = '', city = '', state = '', pincode = '',
      gst_number = '', pan_number = '', bank_name = '', bank_account = '', bank_ifsc = '', status = 'active', rating = 0,
    } = vendorData;

    const [result] = await pool.query(
      'INSERT INTO vendors (name, contact_person, email, phone, address, city, state, pincode, gst_number, pan_number, bank_name, bank_account, bank_ifsc, status, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, contact_person, email, phone, address, city, state, pincode, gst_number, pan_number, bank_name, bank_account, bank_ifsc, status || 'active', rating || 0]
    );

    return formatVendor({
      id: result.insertId,
      ...vendorData,
      status: status || 'active',
      rating: rating || 0,
    });
  },

  async updateVendor(id, vendorData) {
    const {
      name, contact_person = '', email = '', phone = '', address = '', city = '', state = '', pincode = '',
      gst_number = '', pan_number = '', bank_name = '', bank_account = '', bank_ifsc = '', status = 'active', rating = 0,
    } = vendorData;

    const [result] = await pool.query(
      'UPDATE vendors SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, gst_number = ?, pan_number = ?, bank_name = ?, bank_account = ?, bank_ifsc = ?, status = ?, rating = ? WHERE id = ?',
      [name, contact_person, email, phone, address, city, state, pincode, gst_number, pan_number, bank_name, bank_account, bank_ifsc, status, rating, id]
    );

    if (result.affectedRows === 0) return null;
    return this.getVendorById(id);
  },

  async deleteVendor(id) {
    const [result] = await pool.query('DELETE FROM vendors WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
