import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "..", ".env")
});

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

try {
    await connection.query(`
        DROP TABLE IF EXISTS asset_assignments
    `);

    console.log("✅ asset_assignments table deleted successfully.");

    const [tables] = await connection.query(`
        SHOW TABLES
    `);

    console.log("\nCurrent tables:");
    console.table(tables);

} catch (error) {
    console.error("❌ Error:", error);
} finally {
    await connection.end();
}