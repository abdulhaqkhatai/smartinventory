import { pool } from "../config/db.js";


const createReturn = async ({
  asset_id,
  user_id,
  return_date,
  return_condition,
  damage_description,
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

    if (assets[0].status !== "ISSUED") {
      throw new Error("Asset is not currently issued");
    }

    // Create return transaction
    const [returnResult] = await connection.execute(
      `INSERT INTO return_transactions
      (
        asset_id,
        user_id,
        return_date,
        return_condition,
        damage_description,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        asset_id,
        user_id,
        return_date,
        return_condition || null,
        damage_description || null,
        notes || null,
      ]
    );

    // Close active assignment
    await connection.execute(
      `UPDATE asset_assignments
       SET
         status = 'RETURNED',
         returned_date = ?
       WHERE asset_id = ?
       AND user_id = ?
       AND status = 'ACTIVE'`,
      [
        return_date,
        asset_id,
        user_id,
      ]
    );

    // Update asset status
    let newStatus = "AVAILABLE";

    if (
      return_condition &&
      return_condition.toLowerCase() === "damaged"
    ) {
      newStatus = "DAMAGED";
    }

    await connection.execute(
      `UPDATE assets
       SET status = ?
       WHERE id = ?`,
      [
        newStatus,
        asset_id,
      ]
    );

    await connection.commit();

    return {
      id: returnResult.insertId,
      asset_id,
      user_id,
      return_date,
      return_condition: return_condition || null,
      damage_description: damage_description || null,
      notes: notes || null,
    };

  } catch (error) {
    await connection.rollback();
    throw error;

  } finally {
    connection.release();
  }
};


const getAllReturns = async () => {
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
      rt.notes,
      rt.created_at
    FROM return_transactions rt
    INNER JOIN assets a
      ON rt.asset_id = a.id
    ORDER BY rt.id DESC
  `);

  return rows;
};


const getReturnById = async (id) => {
  const [rows] = await pool.execute(
    `
    SELECT
      rt.id,
      rt.asset_id,
      a.asset_code,
      a.asset_name,
      rt.user_id,
      rt.return_date,
      rt.return_condition,
      rt.damage_description,
      rt.notes,
      rt.created_at
    FROM return_transactions rt
    INNER JOIN assets a
      ON rt.asset_id = a.id
    WHERE rt.id = ?
    `,
    [id]
  );

  if (rows.length === 0) {
    throw new Error("Return transaction not found");
  }

  return rows[0];
};


export {
  createReturn,
  getAllReturns,
  getReturnById,
};