import fs from "fs";
import path from "path";
import { pool } from "../config/db.js";

const logFile = path.resolve("./debug.log");

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  console.log(msg);
  fs.appendFileSync(logFile, line);
}

// ==========================================
// GET ALL ASSETS
// ==========================================

const getAllAssets = async () => {
  log("getAllAssets called");
  try {
    log("About to execute query");
    log(
      `Pool config - host: ${process.env.DB_HOST}, port: ${process.env.DB_PORT}, user: ${process.env.DB_USER}`,
    );

    const [rows] = await pool.execute(`
      SELECT
        id,
        asset_code,
        asset_name,
        category,
        serial_number,
        purchase_date,
        purchase_price,
        location,
        status,
        description,
        created_at,
        updated_at
      FROM assets
      ORDER BY id DESC
    `);
    log(`Query successful, returned ${rows.length} rows`);
    return rows;
  } catch (err) {
    log(`getAllAssets ERROR: ${err.message}`);
    log(`Stack: ${err.stack}`);
    throw err;
  }
};

export { getAllAssets };
