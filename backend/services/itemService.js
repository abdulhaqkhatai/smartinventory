import { pool } from '../config/db.js';

export const formatItem = (item) => {
  if (!item) return null;
  const id = item.id;
  const code = item.code || `ITM-${String(id).padStart(4, '0')}`;
  const gst = Number(item.gst_rate ?? item.gstRate ?? 18);
  const minStock = Number(item.min_stock ?? item.minStock ?? 0);
  const reorder = Number(item.reorder_level ?? item.reorderLevel ?? 0);
  const max = Number(item.max_stock ?? item.maxStock ?? 0);
  const stock = Number(item.quantity_in_stock ?? item.currentStock ?? 0);
  const price = Number(item.unit_price ?? item.unitPrice ?? 0);
  const imageUrl = item.image_url || item.imageUrl || '';

  return {
    ...item,
    id,
    code,
    name: item.name,
    category: item.category || 'General',
    brand: item.brand || '',
    unit: item.unit || 'Piece',
    hsn: item.hsn_code || item.hsn || '',
    hsn_code: item.hsn_code || item.hsn || '',
    gstRate: gst,
    gst_rate: gst,
    minStock,
    min_stock: minStock,
    reorderLevel: reorder,
    reorder_level: reorder,
    maxStock: max,
    max_stock: max,
    currentStock: stock,
    quantity_in_stock: stock,
    unitPrice: price,
    unit_price: price,
    imageUrl,
    image_url: imageUrl,
    description: item.description || '',
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

export const itemService = {
  async getAllItems(filters = {}) {
    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (filters.search) {
      query += ' AND (name LIKE ? OR category LIKE ? OR brand LIKE ? OR code LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.category && filters.category !== 'All') {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    query += ' ORDER BY id DESC';

    const [rows] = await pool.query(query, params);
    return rows.map(formatItem);
  },

  async getItemById(id) {
    const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    return rows[0] ? formatItem(rows[0]) : null;
  },

  async createItem(itemData) {
    const name = itemData.name;
    const category = itemData.category;
    const brand = itemData.brand || '';
    const unit = itemData.unit || 'Piece';
    const hsn_code = itemData.hsn_code || itemData.hsn || '';
    const gst_rate = itemData.gst_rate ?? itemData.gstRate ?? 18;
    const min_stock = itemData.min_stock ?? itemData.minStock ?? 0;
    const reorder_level = itemData.reorder_level ?? itemData.reorderLevel ?? 10;
    const max_stock = itemData.max_stock ?? itemData.maxStock ?? 100;
    const quantity_in_stock = itemData.quantity_in_stock ?? itemData.currentStock ?? 0;
    const unit_price = itemData.unit_price ?? itemData.unitPrice ?? 0;
    const image_url = itemData.image_url || itemData.imageUrl || '';
    const description = itemData.description || '';

    const [result] = await pool.query(
      'INSERT INTO items (name, category, brand, unit, hsn_code, gst_rate, min_stock, reorder_level, max_stock, quantity_in_stock, unit_price, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, brand, unit, hsn_code, gst_rate, min_stock, reorder_level, max_stock, quantity_in_stock, unit_price, image_url, description]
    );

    const insertedId = result.insertId;
    const code = itemData.code || `ITM-${String(insertedId).padStart(4, '0')}`;
    await pool.query('UPDATE items SET code = ? WHERE id = ?', [code, insertedId]);

    return formatItem({
      id: insertedId,
      code,
      name,
      category,
      brand,
      unit,
      hsn_code,
      gst_rate,
      min_stock,
      reorder_level,
      max_stock,
      quantity_in_stock,
      unit_price,
      image_url,
      description,
    });
  },

  async updateItem(id, itemData) {
    const name = itemData.name;
    const category = itemData.category;
    const brand = itemData.brand || '';
    const unit = itemData.unit || 'Piece';
    const hsn_code = itemData.hsn_code || itemData.hsn || '';
    const gst_rate = itemData.gst_rate ?? itemData.gstRate ?? 18;
    const min_stock = itemData.min_stock ?? itemData.minStock ?? 0;
    const reorder_level = itemData.reorder_level ?? itemData.reorderLevel ?? 10;
    const max_stock = itemData.max_stock ?? itemData.maxStock ?? 100;
    const quantity_in_stock = itemData.quantity_in_stock ?? itemData.currentStock ?? 0;
    const unit_price = itemData.unit_price ?? itemData.unitPrice ?? 0;
    const image_url = itemData.image_url || itemData.imageUrl || '';
    const description = itemData.description || '';
    const code = itemData.code || `ITM-${String(id).padStart(4, '0')}`;

    const [result] = await pool.query(
      'UPDATE items SET code = ?, name = ?, category = ?, brand = ?, unit = ?, hsn_code = ?, gst_rate = ?, min_stock = ?, reorder_level = ?, max_stock = ?, quantity_in_stock = ?, unit_price = ?, image_url = ?, description = ? WHERE id = ?',
      [code, name, category, brand, unit, hsn_code, gst_rate, min_stock, reorder_level, max_stock, quantity_in_stock, unit_price, image_url, description, id]
    );

    if (result.affectedRows === 0) return null;
    return this.getItemById(id);
  },

  async deleteItem(id) {
    const [result] = await pool.query('DELETE FROM items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};
