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
    status = 'Approved',
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
        notes,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      asset_id,
      user_id,
      issue_date || null,
      expected_return_date || null,
      issue_condition || null,
      notes || null,
      status,
    ],
  );

  if (status === 'Approved') {
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
  }

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

const updateIssueStatus = async (id, status) => {
  const [issueRows] = await pool.execute('SELECT * FROM issue_transactions WHERE id = ?', [id]);
  if (issueRows.length === 0) throw new Error('Issue not found');
  
  const issue = issueRows[0];
  
  if (status === 'Approved' && issue.status === 'Pending') {
    await pool.execute('UPDATE issue_transactions SET status = ? WHERE id = ?', [status, id]);
    
    // Update asset
    await pool.execute('UPDATE assets SET status = "ISSUED" WHERE id = ?', [issue.asset_id]);
    
    // Add assignment
    await pool.execute(
      `INSERT INTO asset_assignments (asset_id, user_id, status, assigned_date) VALUES (?, ?, 'ACTIVE', ?)`,
      [issue.asset_id, issue.user_id, new Date().toISOString().slice(0, 19).replace('T', ' ')]
    );
  } else {
    await pool.execute('UPDATE issue_transactions SET status = ? WHERE id = ?', [status, id]);
  }
  return { id, status };
};

export { createIssue, getAllIssues, getIssueById, updateIssueStatus };
