



import pool from "../config/db.js";
import path from "path";       // Required for path.join
import XLSX from "xlsx"; 
import fs from "fs";           // Required if reading files


// Get all file statuses
export const getFileStatuses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM file_status ORDER BY updated_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching file statuses:", err.message);
    res.status(500).json({ error: "Database fetch failed" });
  }
};

// Update / Insert file status
export const updateFileStatus = async (req, res) => {
  const { file_no, status } = req.body;

  console.log("📥 Received from frontend:", file_no, status);

  try {
    const result = await pool.query(
      `INSERT INTO file_status (file_no, status) VALUES ($1, $2) RETURNING *`,
      [file_no, status]
    );

   console.log("✅ Inserted:", result.rows[0]); // <--- Add this
    res.json(result.rows[0]);

  } catch (err) {
   onsole.error("❌ INSERT ERROR:", err); // <--- Add this
    res.status(500).json({ error: err.message });
   
  }
};

// Search files by any field

// Search files by any field


// Search files by any field safely
export const searchFiles = async (req, res) => {
  try {
    const {
      section,
      seatNo,
      fileNo,
      subject,
      fromDate,
      toDate,
      outwardFrom,
      outwardTo,
      office,
      year,
    } = req.body;

    let query = `SELECT * FROM outward WHERE 1=1`;
    const params = [];
    let count = 1;

    if (section) { query += ` AND section = $${count++}`; params.push(section); }
    if (seatNo) { query += ` AND seat_no = $${count++}`; params.push(seatNo); }
    if (fileNo) { query += ` AND file_no = $${count++}`; params.push(fileNo); }
    if (subject) { query += ` AND subject ILIKE $${count++}`; params.push(`%${subject}%`); }
    if (fromDate) { query += ` AND outward_date >= $${count++}`; params.push(fromDate); }
    if (toDate) { query += ` AND outward_date <= $${count++}`; params.push(toDate); }
    if (outwardFrom) { query += ` AND outward_no >= $${count++}`; params.push(outwardFrom); }
    if (outwardTo) { query += ` AND outward_no <= $${count++}`; params.push(outwardTo); }
    if (office) { query += ` AND office = $${count++}`; params.push(office); }
    if (year) { query += ` AND year = $${count++}`; params.push(year); }

    query += ` ORDER BY outward_date DESC`;

    console.log("SQL Query:", query);
    console.log("Params:", params);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Search Error:", err.message);
    res.status(500).json({ error: "Database fetch failed" });
  }
};



// View file (open in browser)
export const viewOutwardFile = async (req, res) => {
  try {
    const { id, index = 0 } = req.params;

    const result = await pool.query(
      "SELECT file_path FROM outward WHERE id = $1",
      [id]
    );

    if (!result.rows.length) return res.status(404).send("Record not found");

    const filePaths = result.rows[0].file_path;
    if (!filePaths || !filePaths[index])
      return res.status(404).send("File not found");

    const abs = path.join(process.cwd(), filePaths[index]);

    return res.sendFile(abs);
  } catch (err) {
    console.error("viewOutwardFile error:", err);
    res.status(500).send("Error viewing file");
  }
};






// Export search results as Excel
export const exportFilesExcel = async (req, res) => {
  try {
    const { section, seatNo, fileNo, subject, fromDate, toDate } = req.body;

    let query = `SELECT * FROM outward WHERE 1=1`;
    const params = [];
    let count = 1;

    if (section) { query += ` AND section = $${count++}`; params.push(section); }
    if (seatNo) { query += ` AND seat_no = $${count++}`; params.push(seatNo); }
    if (fileNo) { query += ` AND file_no = $${count++}`; params.push(fileNo); }
    if (subject) { query += ` AND subject ILIKE $${count++}`; params.push(`%${subject}%`); }
    if (fromDate) { query += ` AND outward_date >= $${count++}`; params.push(fromDate); }
    if (toDate) { query += ` AND outward_date <= $${count++}`; params.push(toDate); }

    const result = await pool.query(query, params);
    const data = result.rows;

    if (!data.length) return res.status(404).send("No data to export");

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "OutwardFiles");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=outward_files.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to export Excel");
  }
};

