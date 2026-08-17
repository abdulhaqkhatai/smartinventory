import { pool } from '../config/db.js';

export const itemService = {
  async getAllItems(filters = {}) {
    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (filters.search) {
      query += ' AND (name LIKE ? OR category LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getItemById(id) {
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async createItem(itemData) {
    const { name, category, brand, unit, hsn_code, gst_rate, reorder_level, max_stock, unit_price } = itemData;
    const [result] = await pool.query(
      'INSERT INTO items (name, category, brand, unit, hsn_code, gst_rate, reorder_level, max_stock, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, brand, unit, hsn_code, gst_rate, reorder_level, max_stock, unit_price]
    );
    return { id: result.insertId, ...itemData };
  },

  async updateItem(id, itemData) {
    const { name, category, brand, unit, hsn_code, gst_rate, reorder_level, max_stock, unit_price } = itemData;
    const [result] = await pool.query(
      'UPDATE items SET name = ?, category = ?, brand = ?, unit = ?, hsn_code = ?, gst_rate = ?, reorder_level = ?, max_stock = ?, unit_price = ? WHERE id = ?',
      [name, category, brand, unit, hsn_code, gst_rate, reorder_level, max_stock, unit_price, id]
    );
    return result.affectedRows > 0;
  },

  async deleteItem(id) {
    const [result] = await pool.query('DELETE FROM items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
