import { pool } from "../config/db.js";


const createIssue = async ({
  asset_id,
  user_id,
  issue_date,
  expected_return_date,
  issue_condition,
  notes,
}) => {

  const connection = await pool.getConnection();

  try {

    await connection.beginTransaction();

    // Check asset
    const [assets] = await connection.execute(
      `SELECT id, status
       FROM assets
       WHERE id = ?`,
      [asset_id]
    );

    if (assets.length === 0) {
      throw new Error("Asset not found");
    }

    // Asset must be available
    if (assets[0].status !== "AVAILABLE") {
      throw new Error("Asset is not available");
    }

    // Create issue transaction
    const [issueResult] = await connection.execute(
      `INSERT INTO issue_transactions
      (
        asset_id,
        user_id,
        issue_date,
        expected_return_date,
        issue_condition,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        asset_id,
        user_id,
        issue_date,
        expected_return_date || null,
        issue_condition || null,
        notes || null,
      ]
    );

    // Create assignment
    await connection.execute(
      `INSERT INTO asset_assignments
      (
        asset_id,
        user_id,
        assigned_date,
        status,
        notes
      )
      VALUES (?, ?, ?, 'ACTIVE', ?)`,
      [
        asset_id,
        user_id,
        issue_date,
        notes || null,
      ]
    );

    // Update asset status
    await connection.execute(
      `UPDATE assets
       SET status = 'ISSUED'
       WHERE id = ?`,
      [asset_id]
    );

    await connection.commit();

    return {
      id: issueResult.insertId,
      asset_id,
      user_id,
      issue_date,
      expected_return_date: expected_return_date || null,
      issue_condition: issue_condition || null,
      notes: notes || null,
    };

  } catch (error) {

    await connection.rollback();
    throw error;

  } finally {

    connection.release();
  }
};


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
      it.notes,
      it.created_at
    FROM issue_transactions it
    INNER JOIN assets a
      ON it.asset_id = a.id
    ORDER BY it.id DESC
  `);

  return rows;
};


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
      it.notes,
      it.created_at
    FROM issue_transactions it
    INNER JOIN assets a
      ON it.asset_id = a.id
    WHERE it.id = ?
    `,
    [id]
  );

  if (rows.length === 0) {
    throw new Error("Issue transaction not found");
  }

  return rows[0];
};


export {
  createIssue,
  getAllIssues,
  getIssueById,
};