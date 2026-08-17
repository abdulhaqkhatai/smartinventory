import { pool } from "../config/db.js";

// ==========================================
// CREATE ASSET
// ==========================================

const createAsset = async ({
  asset_code,
  asset_name,
  category,
  serial_number,
  purchase_date,
  purchase_price,
  location,
  status,
  description,
}) => {
  const [existing] = await pool.execute(
    `SELECT id
     FROM assets
     WHERE asset_code = ?`,
    [asset_code],
  );

  if (existing.length > 0) {
    throw new Error("Asset code already exists");
  }

  const [result] = await pool.execute(
    `INSERT INTO assets
    (
      asset_code,
      asset_name,
      category,
      serial_number,
      purchase_date,
      purchase_price,
      location,
      status,
      description
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      asset_code,
      asset_name,
      category || null,
      serial_number || null,
      purchase_date || null,
      purchase_price || null,
      location || null,
      status || "AVAILABLE",
      description || null,
    ],
  );

  return {
    id: result.insertId,
    asset_code,
    asset_name,
    category: category || null,
    serial_number: serial_number || null,
    purchase_date: purchase_date || null,
    purchase_price: purchase_price || null,
    location: location || null,
    status: status || "AVAILABLE",
    description: description || null,
  };
};

// ==========================================
// GET ALL ASSETS
// ==========================================

const getAllAssets = async () => {
  console.log("getAllAssets called - pool config check");
  try {
    console.log("About to execute query on pool");
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
    console.log(`Query successful, returned ${rows.length} rows`);
    return rows;
  } catch (err) {
    console.error("getAllAssets error:", err.message);
    console.error("Full error:", err);
    throw err;
  }
};

// ==========================================
// GET ASSET BY ID
// ==========================================

const getAssetById = async (id) => {
  const [rows] = await pool.execute(
    `
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
    WHERE id = ?
    `,
    [id],
  );

  if (rows.length === 0) {
    throw new Error("Asset not found");
  }

  return rows[0];
};

// ==========================================
// UPDATE ASSET
// ==========================================

const updateAsset = async (id, data) => {
  const existing = await getAssetById(id);

  const {
    asset_code,
    asset_name,
    category,
    serial_number,
    purchase_date,
    purchase_price,
    location,
    status,
    description,
  } = data;

  const [result] = await pool.execute(
    `UPDATE assets
     SET
       asset_code = ?,
       asset_name = ?,
       category = ?,
       serial_number = ?,
       purchase_date = ?,
       purchase_price = ?,
       location = ?,
       status = ?,
       description = ?
     WHERE id = ?`,
    [
      asset_code ?? existing.asset_code,
      asset_name ?? existing.asset_name,
      category ?? existing.category,
      serial_number ?? existing.serial_number,
      purchase_date ?? existing.purchase_date,
      purchase_price ?? existing.purchase_price,
      location ?? existing.location,
      status ?? existing.status,
      description ?? existing.description,
      id,
    ],
  );

  return await getAssetById(id);
};

// ==========================================
// DELETE ASSET
// ==========================================

const deleteAsset = async (id) => {
  const asset = await getAssetById(id);

  if (asset.status === "ISSUED") {
    throw new Error("Issued asset cannot be deleted");
  }

  await pool.execute(
    `DELETE FROM assets
     WHERE id = ?`,
    [id],
  );

  return true;
};

// ==========================================
// ASSET HISTORY
// ==========================================

const getAssetHistory = async (id) => {
  await getAssetById(id);

  const [issues] = await pool.execute(
    `
    SELECT
      'ISSUE' AS transaction_type,
      id,
      user_id,
      issue_date AS transaction_date,
      issue_condition AS condition_value,
      notes
    FROM issue_transactions
    WHERE asset_id = ?
    `,
    [id],
  );

  const [returns] = await pool.execute(
    `
    SELECT
      'RETURN' AS transaction_type,
      id,
      user_id,
      return_date AS transaction_date,
      return_condition AS condition_value,
      notes
    FROM return_transactions
    WHERE asset_id = ?
    `,
    [id],
  );

  return [...issues, ...returns].sort(
    (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date),
  );
};

export {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetHistory,
};
