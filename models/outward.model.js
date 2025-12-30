



import pool from "../config/db.js";

exports.createOutward = async (data) => {
  const query = `
    INSERT INTO outward (
      outward_no, branch, date, inward_no, office, section, seat_no, year,
      received_from, send_to, category, subject, remarks, file_path
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *;
  `;

  const values = [
    data.outward_no,
    data.branch,
    data.date,
    data.inwardNo,
    data.office,
    data.section,
    data.seatNo,
    data.year,
    data.receivedFrom,
    data.to,
    data.category,
    data.subject,
    data.remarks,
    data.file_path || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};


exports.getLatestOutwardNo = async () => {
  const result = await pool.query(`
    SELECT outward_no 
    FROM outward 
    ORDER BY id DESC 
    LIMIT 1
  `);
  return result.rows[0];
};
