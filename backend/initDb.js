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
  // Remove single line comments
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
          console.error('Notice executing statement:', err.message);
        }
      }
    }

    console.log('✅ Tables created and initialized successfully');

    // Verify tables
    const [tables] = await pool.query("SHOW TABLES");
    console.log('📊 Active database tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

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
