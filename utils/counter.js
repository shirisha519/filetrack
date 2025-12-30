import pool from "../config/db.js";

// General purpose auto-increment counter
export const getNextSequence = async (name) => {
  const result = await pool.query(
    `UPDATE counter
     SET seq = seq + 1
     WHERE name = $1
     RETURNING seq`,
    [name]
  );

  return result.rows[0].seq;
};
