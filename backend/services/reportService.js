import { pool } from "../config/db.js";


// ==========================================
// DASHBOARD SUMMARY
// ==========================================

const getDashboardReport = async () => {

  const [assets] = await pool.execute(`
    SELECT
      COUNT(*) AS total_assets,

      SUM(
        CASE
          WHEN status = 'AVAILABLE' THEN 1
          ELSE 0
        END
      ) AS available_assets,

      SUM(
        CASE
          WHEN status = 'ISSUED' THEN 1
          ELSE 0
        END
      ) AS issued_assets,

      SUM(
        CASE
          WHEN status = 'DAMAGED' THEN 1
          ELSE 0
        END
      ) AS damaged_assets

    FROM assets
  `);


  const [issues] = await pool.execute(`
    SELECT COUNT(*) AS total_issues
    FROM issue_transactions
  `);


  const [returns] = await pool.execute(`
    SELECT COUNT(*) AS total_returns
    FROM return_transactions
  `);


  return {
    assets: assets[0],
    total_issues: issues[0].total_issues,
    total_returns: returns[0].total_returns,
  };
};


// ==========================================
// ASSET STATUS REPORT
// ==========================================

const getAssetStatusReport = async () => {

  const [rows] = await pool.execute(`
    SELECT
      status,
      COUNT(*) AS total
    FROM assets
    GROUP BY status
    ORDER BY total DESC
  `);

  return rows;
};


// ==========================================
// ISSUE REPORT
// ==========================================

const getIssueReport = async () => {

  const [rows] = await pool.execute(`
    SELECT
      it.id,
      it.asset_id,
      a.asset_code,
      a.asset_name,
      it.user_id,
      it.issue_date,
      it.expected_return_date,
      it.issue_condition,
      it.notes
    FROM issue_transactions it
    INNER JOIN assets a
      ON it.asset_id = a.id
    ORDER BY it.issue_date DESC
  `);

  return rows;
};


// ==========================================
// RETURN REPORT
// ==========================================

const getReturnReport = async () => {

  const [rows] = await pool.execute(`
    SELECT
      rt.id,
      rt.asset_id,
      a.asset_code,
      a.asset_name,
      rt.user_id,
      rt.return_date,
      rt.return_condition,
      rt.damage_description,
      rt.notes
    FROM return_transactions rt
    INNER JOIN assets a
      ON rt.asset_id = a.id
    ORDER BY rt.return_date DESC
  `);

  return rows;
};


// ==========================================
// DAMAGED ASSET REPORT
// ==========================================

const getDamagedAssetReport = async () => {

  const [rows] = await pool.execute(`
    SELECT
      id,
      asset_code,
      asset_name,
      category,
      serial_number,
      location,
      status
    FROM assets
    WHERE status = 'DAMAGED'
    ORDER BY id DESC
  `);

  return rows;
};


export {
  getDashboardReport,
  getAssetStatusReport,
  getIssueReport,
  getReturnReport,
  getDamagedAssetReport,
};