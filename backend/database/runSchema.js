import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = path.resolve(__dirname, "..");

dotenv.config({
  path: path.resolve(backendDir, ".env"),
});

console.log("=================================");
console.log("RAILWAY MYSQL SCHEMA SETUP");
console.log("=================================");

console.log("\nDB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

try {
  // --------------------------------------------------------
  // 1. CONNECT TO RAILWAY
  // --------------------------------------------------------

  console.log("\nConnecting to Railway MySQL...");

  const [db] = await pool.query("SELECT DATABASE() AS current_database");

  console.log("\nDATABASE ACTUALLY CONNECTED:");
  console.table(db);

  // --------------------------------------------------------
  // 2. CHECK MYSQL SERVER
  // --------------------------------------------------------

  const [server] = await pool.query(
    "SELECT @@hostname AS hostname, @@port AS port",
  );

  console.log("\nMYSQL SERVER:");
  console.table(server);

  // --------------------------------------------------------
  // 3. READ schema.sql
  // --------------------------------------------------------

  const schemaPath = path.join(__dirname, "schema.sql");

  console.log("\nSchema file:");
  console.log(schemaPath);

  if (!fs.existsSync(schemaPath)) {
    throw new Error("schema.sql file not found!");
  }

  const schema = fs.readFileSync(schemaPath, "utf8");

  console.log("\nSchema file loaded.");

  if (!schema.trim()) {
    throw new Error("schema.sql is empty!");
  }

  // --------------------------------------------------------
  // 4. EXECUTE SCHEMA
  // --------------------------------------------------------

  console.log("\nExecuting schema on Railway...");

  await pool.query(schema);

  console.log("\n✅ Schema executed successfully!");

  // --------------------------------------------------------
  // 5. CHECK TABLES
  // --------------------------------------------------------

  const [tables] = await pool.query(`
        SELECT
            TABLE_NAME,
            TABLE_TYPE
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_NAME
    `);

  console.log("\nTABLES/VIEWS IN THIS DATABASE:");
  console.table(tables);

  console.log("\nTotal objects:", tables.length);
} catch (error) {
  console.error("\n❌ ERROR:");
  console.error(error);
} finally {
  await pool.end();

  console.log("\nConnection closed.");
}
