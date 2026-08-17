import { pool } from "../config/db.js";

// ==========================================
// DASHBOARD SUMMARY
// ==========================================

const getDashboardReport = async () => {
  try {
    // Items stats
    const [itemsResult] = await pool.query(`
      SELECT
        COUNT(*) AS total_items,
        SUM(CASE WHEN quantity_in_stock <= reorder_level THEN 1 ELSE 0 END) AS low_stock_items
      FROM items
    `);

    // Vendors stats
    const [vendorsResult] = await pool.query(`
      SELECT
        COUNT(*) AS total_vendors,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_vendors,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive_vendors,
        SUM(CASE WHEN status = 'blacklisted' THEN 1 ELSE 0 END) AS blacklisted_vendors
      FROM vendors
    `);

    // Users stats
    const [usersResult] = await pool.query(`
      SELECT COUNT(*) AS total_users FROM users
    `);

    // Pending Indents
    let pendingIndents = 0;
    try {
      const [indentsResult] = await pool.query(`
        SELECT COUNT(*) AS pending_indents FROM indents WHERE status IN ('submitted', 'draft', 'pending')
      `);
      pendingIndents = Number(indentsResult[0]?.pending_indents || 0);
    } catch {
      pendingIndents = 0;
    }

    // Pending GRNs
    let pendingGRNs = 0;
    try {
      const [grnResult] = await pool.query(`
        SELECT COUNT(*) AS pending_grn FROM grn_receipts WHERE status IN ('draft', 'pending')
      `);
      pendingGRNs = Number(grnResult[0]?.pending_grn || 0);
    } catch {
      pendingGRNs = 0;
    }

    // Assets Issued
    let assetsIssued = 0;
    try {
      const [issuesResult] = await pool.query(`
        SELECT COUNT(*) AS total_issued FROM issue_transactions
      `);
      assetsIssued = Number(issuesResult[0]?.total_issued || 0);
    } catch {
      assetsIssued = 0;
    }

    const totalItems = Number(itemsResult[0]?.total_items || 0);
    const lowStockItems = Number(itemsResult[0]?.low_stock_items || 0);
    const totalVendors = Number(vendorsResult[0]?.total_vendors || 0);
    const activeVendors = Number(vendorsResult[0]?.active_vendors || 0);
    const totalUsers = Number(usersResult[0]?.total_users || 0);

    return {
      // Top-level stats for DashboardPage.jsx state mapping
      totalItems,
      lowStockItems,
      pendingIndents,
      pendingGRNs,
      assetsIssued,
      totalVendors: activeVendors || totalVendors,
      activeVendors,
      totalUsers,

      // Nested structures for detailed reports / API consumers
      items: {
        total_items: totalItems,
        low_stock_items: lowStockItems,
      },
      vendors: {
        total_vendors: totalVendors,
        active_vendors: activeVendors,
        inactive_vendors: Number(vendorsResult[0]?.inactive_vendors || 0),
        blacklisted_vendors: Number(vendorsResult[0]?.blacklisted_vendors || 0),
      },
      users: {
        total_users: totalUsers,
      },
      summary: {
        pendingIndents,
        pendingGRNs,
        assetsIssued,
      },
    };
  } catch (error) {
    console.error("Error in getDashboardReport:", error);
    throw error;
  }
};

// ==========================================
// ASSET STATUS REPORT
// ==========================================

const getAssetStatusReport = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT
        status,
        COUNT(*) AS total
      FROM assets
      GROUP BY status
      ORDER BY total DESC
    `);
    return rows;
  } catch {
    return [];
  }
};

// ==========================================
// ISSUE REPORT
// ==========================================

const getIssueReport = async () => {
  try {
    const [rows] = await pool.query(`
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
      INNER JOIN assets a ON it.asset_id = a.id
      ORDER BY it.issue_date DESC
    `);
    return rows;
  } catch {
    return [];
  }
};

// ==========================================
// RETURN REPORT
// ==========================================

const getReturnReport = async () => {
  try {
    const [rows] = await pool.query(`
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
      INNER JOIN assets a ON rt.asset_id = a.id
      ORDER BY rt.return_date DESC
    `);
    return rows;
  } catch {
    return [];
  }
};

// ==========================================
// DAMAGED ASSET REPORT
// ==========================================

const getDamagedAssetReport = async () => {
  try {
    const [rows] = await pool.query(`
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
  } catch {
    return [];
  }
};

export {
  getDashboardReport,
  getAssetStatusReport,
  getIssueReport,
  getReturnReport,
  getDamagedAssetReport,
};