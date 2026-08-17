import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.resolve(backendDir, ".env") });

console.log("Starting schema setup...");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

try {
  console.log("Connecting to Railway MySQL...");

  const schemaPath = path.resolve(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log("Schema file loaded.");

  await pool.query(sql);

  console.log("Schema executed successfully.");

  const [tables] = await pool.query("SHOW TABLES");

  console.log("Tables in Railway:");

  console.table(tables);
} catch (error) {
  console.error("ERROR:");
  console.error(error);
} finally {
  await pool.end();

  console.log("Connection closed.");
}
