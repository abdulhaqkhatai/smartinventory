import { pool } from './config/db.js';

const run = async () => {
  try {
    await pool.query('DROP TABLE IF EXISTS grns');
    console.log('Dropped grns');
    await pool.query('DROP TABLE IF EXISTS stock_movements');
    console.log('Dropped stock_movements');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
