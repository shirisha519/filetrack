import pool from "../config/db.js";

export const getPendingFiles = async (req, res) => {
  try {
    const { fileNo, section } = req.body;

    // Base query
    let query = `
      SELECT 
        i.inward_no,
        i.section,
        i.seat_no,
        i.file_no,
        i.subject,
        i.inward_date,
        COALESCE(array_to_string(i.file_path, ','), 'Pending') AS file_name
      FROM inward i
      WHERE i.inward_no NOT IN (SELECT inward_no FROM outward)
    `;

    let values = [];
    let conditions = [];

    if (fileNo) {
      values.push(fileNo);
      conditions.push(`i.file_no = $${values.length}`);
    }

    if (section) {
      values.push(section);
      conditions.push(`i.section = $${values.length}`);
    }

    if (conditions.length) {
      query += " AND " + conditions.join(" AND ");
    }

    query += " ORDER BY i.inward_date DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error("Pending Search Error:", err);
    res.status(500).json({ error: "Server error fetching pending files" });
  }
};
