import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("./.env", import.meta.url));
dotenv.config({ path: envPath });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000,
});

const queries = [
  `CREATE TABLE IF NOT EXISTS assets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    asset_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_asset_code (asset_code),
    INDEX idx_status (status)
  )`,
  `CREATE TABLE IF NOT EXISTS issue_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT NOT NULL,
    user_id VARCHAR(150) NOT NULL,
    issue_date DATETIME,
    expected_return_date DATETIME,
    issue_condition VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
  )`,
  `CREATE TABLE IF NOT EXISTS return_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT NOT NULL,
    user_id VARCHAR(150) NOT NULL,
    return_date DATETIME,
    return_condition VARCHAR(100),
    damage_description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
  )`,
  `CREATE TABLE IF NOT EXISTS asset_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT NOT NULL,
    user_id VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    assigned_date DATETIME,
    returned_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
  )`
];

async function run() {
  try {
    for (const q of queries) {
      console.log("Executing query...");
      await pool.query(q);
    }
    console.log("Tables created successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
