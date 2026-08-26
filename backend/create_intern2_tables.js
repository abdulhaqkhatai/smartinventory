import { pool } from './config/db.js';

const run = async () => {
  try {
    console.log('Creating grns table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        po_ref VARCHAR(50) NOT NULL,
        vendor_name VARCHAR(150) NOT NULL,
        date DATE NOT NULL,
        received_by VARCHAR(150) NOT NULL,
        status ENUM('completed', 'partial') DEFAULT 'completed',
        items JSON NOT NULL,
        remarks VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_po_ref (po_ref)
      )
    `);
    console.log('grns table created or already exists.');

    console.log('Creating stock_movements table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        date DATE NOT NULL,
        type ENUM('Receipt', 'Issue', 'Adjustment', 'Transfer') NOT NULL,
        quantity INT NOT NULL,
        reference VARCHAR(50),
        warehouse VARCHAR(100),
        performed_by VARCHAR(150) NOT NULL,
        remarks VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_item_id (item_id),
        INDEX idx_type (type)
      )
    `);
    console.log('stock_movements table created or already exists.');

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
