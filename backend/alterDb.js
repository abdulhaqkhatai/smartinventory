import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
  let pool;
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
    });

    console.log('Altering tables...');
    try {
      await pool.query('ALTER TABLE users ADD COLUMN location VARCHAR(100) DEFAULT "General"');
      console.log('Added location to users');
    } catch (e) { console.log('Notice (users):', e.message); }

    try {
      await pool.query("ALTER TABLE issue_transactions ADD COLUMN status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Approved'");
      console.log('Added status to issue_transactions');
    } catch (e) { console.log('Notice (issue):', e.message); }

    try {
      await pool.query("ALTER TABLE return_transactions ADD COLUMN status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Approved'");
      console.log('Added status to return_transactions');
    } catch (e) { console.log('Notice (return):', e.message); }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
