import pool from "../config/db.js";
import xlsx from "xlsx";


// SEARCH PENDING TAPAL USING FILTERS
export const searchPendingTapal = async (req, res) => {
  const { subject, receivedFrom, referenceNo, inwardNumber, fromDate, toDate } = req.body;

  try {
    let query = `
      SELECT r.*
      FROM tapal_received r
      LEFT JOIN tapal_dispatched d ON r.inward_no = d.inward_no
      WHERE d.id IS NULL
    `;

    const values = [];
    let idx = 1;

    if (subject) {
      query += ` AND r.subject ILIKE $${idx++}`;
      values.push(`%${subject}%`);
    }

    if (receivedFrom) {
      query += ` AND r.received_from ILIKE $${idx++}`;
      values.push(`%${receivedFrom}%`);
    }

    if (referenceNo) {
      query += ` AND r.reference_no = $${idx++}`;
      values.push(referenceNo);
    }

    if (inwardNumber) {
      query += ` AND r.inward_no = $${idx++}`;
      values.push(inwardNumber);
    }

    if (fromDate && toDate) {
      query += ` AND r.reference_date BETWEEN $${idx++} AND $${idx++}`;
      values.push(fromDate, toDate);
    }

    query += ` ORDER BY r.date DESC`;

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error searching pending tapal" });
  }
};


// DOWNLOAD AS EXCEL
export const downloadPendingExcel = async (req, res) => {
  const { subject, receivedFrom, referenceNo, inwardNumber, fromDate, toDate } = req.body;

  try {
    let query = `
      SELECT r.*
      FROM tapal_received r
      LEFT JOIN tapal_dispatched d ON r.inward_no = d.inward_no
      WHERE d.id IS NULL
    `;
    const values = [];
    let idx = 1;

    if (subject) {
      query += ` AND r.subject ILIKE $${idx++}`;
      values.push(`%${subject}%`);
    }
    if (receivedFrom) {
      query += ` AND r.received_from ILIKE $${idx++}`;
      values.push(`%${receivedFrom}%`);
    }
    if (referenceNo) {
      query += ` AND r.reference_no = $${idx++}`;
      values.push(referenceNo);
    }
    if (inwardNumber) {
      query += ` AND r.inward_no = $${idx++}`;
      values.push(inwardNumber);
    }
    if (fromDate && toDate) {
      query += ` AND r.reference_date BETWEEN $${idx++} AND $${idx++}`;
      values.push(fromDate, toDate);
    }

    query += ` ORDER BY r.date DESC`;

    const result = await pool.query(query, values);

    const rows = result.rows;
    const sheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, sheet, "PendingTapal");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=pending_tapal.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Excel download failed" });
  }
};


