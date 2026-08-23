import { pool } from "../config/db.js";

// ==========================================
// CREATE ISSUE
// ==========================================

const createIssue = async (issueData) => {
  const {
    asset_id,
    user_id,
    issue_date,
    expected_return_date,
    issue_condition,
    notes,
  } = issueData;

  const [assetRows] = await pool.execute(`SELECT id FROM assets WHERE id = ?`, [
    asset_id,
  ]);

  if (assetRows.length === 0) {
    throw new Error(`Asset with id ${asset_id} does not exist`);
  }

  const [result] = await pool.execute(
    `
      INSERT INTO issue_transactions
      (
        asset_id,
        user_id,
        issue_date,
        expected_return_date,
        issue_condition,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      asset_id,
      user_id,
      issue_date || null,
      expected_return_date || null,
      issue_condition || null,
      notes || null,
    ],
  );

  // Asset status update
  await pool.execute(
    `
      UPDATE assets
      SET status = 'ISSUED'
      WHERE id = ?
    `,
    [asset_id],
  );

  // Asset assignment insertion
  await pool.execute(
    `
      INSERT INTO asset_assignments
      (asset_id, user_id, status, assigned_date)
      VALUES (?, ?, 'ACTIVE', ?)
    `,
    [asset_id, user_id, issue_date || new Date().toISOString().slice(0, 19).replace('T', ' ')]
  );

  return {
    id: result.insertId,
    asset_id,
    user_id,
    issue_date,
    expected_return_date,
    issue_condition,
    notes,
  };
};

// ==========================================
// GET ALL ISSUES
// ==========================================

const getAllIssues = async () => {
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
// GET ISSUE BY ID
// ==========================================

const getIssueById = async (id) => {
  const [rows] = await pool.execute(
    `
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
      WHERE it.id = ?
    `,
    [id],
  );

  return rows[0];
};

export { createIssue, getAllIssues, getIssueById };
