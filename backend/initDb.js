import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const cleanSql = (sql) => {
  return sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');
};

const initializeDatabase = async () => {
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

    console.log(`Connecting to database '${process.env.DB_NAME}' on ${process.env.DB_HOST}...`);

    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    const rawSchema = fs.readFileSync(schemaPath, 'utf8');
    const cleanedSchema = cleanSql(rawSchema);

    // Split SQL by semicolon
    const statements = cleanedSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (err) {
          console.log('Notice executing statement:', err.message);
        }
      }
    }

    // Ensure columns exist on items table
    try {
      await pool.query('ALTER TABLE items ADD COLUMN min_stock INT DEFAULT 0 AFTER gst_rate');
      console.log('✅ Added min_stock column to items');
    } catch {
      // Column already exists
    }

    try {
      await pool.query("ALTER TABLE items ADD COLUMN image_url VARCHAR(500) DEFAULT '' AFTER unit_price");
      console.log('✅ Added image_url column to items');
    } catch {
      // Column already exists
    }

    // Ensure all 4 roles exist in users table
    const hash = '$2a$10$l6vAWfZb5Yj/yGFX9SwO4.0kTDHM3.2akumKm.0A5fFtsVGlFhRYC';
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role) VALUES
      ('admin', 'admin@example.com', ?, 'admin'),
      ('store_manager', 'store@example.com', ?, 'store_manager'),
      ('purchase_manager', 'purchase@example.com', ?, 'purchase_manager'),
      ('employee', 'employee@example.com', ?, 'employee'),
      ('user1', 'user1@example.com', ?, 'employee')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)
    `, [hash, hash, hash, hash, hash]);
    console.log('✅ Verified all 4 roles in users table');

    // Verify tables
    const [tables] = await pool.query("SHOW TABLES");
    console.log('📊 Active database tables on Railway:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    const [users] = await pool.query('SELECT id, username, email, role FROM users');
    console.log('👥 Available users for testing:', users);

    await pool.end();
    console.log('✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    if (pool) await pool.end();
    process.exit(1);
  }
};

initializeDatabase();
