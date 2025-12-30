// controllers/inward.controller.js
import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // keep original name but prefix timestamp
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

export const upload = multer({ storage });

// GET NEXT INWARD NO
export const getNextInwardNo = async (req, res) => {
  try {
    // Assumes you have a DB function generate_inward_no()
    const { rows } = await pool.query("SELECT generate_inward_no() AS inward_no");
    res.json({ inwardNo: rows[0].inward_no });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate inward no" });
  }
};

// CREATE INWARD ENTRY (multiple files)
export const createInward = async (req, res) => {
  try {
    let inwardNo = req.body.inward_no;

    if (!inwardNo) {
      const { rows } = await pool.query("SELECT generate_inward_no() AS inward_no");
      inwardNo = rows[0].inward_no;
    }

    const {
      inward_date,
      office,
      section,
      seat_no,
      file_no,
      year,
      received_from,
      to_person,
      category,
      file_status,
      subject,
      remarks
    } = req.body;

    // req.files is array from upload.array('files')
    const files = req.files || [];

    // Convert multer file objects to relative paths to store in DB
    // store as relative: uploads/xxxxx-name.ext
    const filePaths = files.map(f => path.relative(process.cwd(), f.path).replace(/\\/g, '/'));

    // If no inward_date provided, use today
    const finalDate = inward_date && String(inward_date).trim() !== ""
      ? inward_date
      : new Date().toISOString().split("T")[0];

    const query = `
      INSERT INTO inward (
        inward_no, inward_date, office, section, seat_no, file_no, year,
        received_from, to_person, category, file_status, subject, remarks, file_path, created_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      )
      RETURNING *;
    `;

    const values = [
      inwardNo,
      finalDate,
      office || null,
      section || null,
      seat_no || null,
      file_no || null,
      year || null,
      received_from || null,
      to_person || null,
      category || null,
      file_status || null,
      subject || null,
      remarks || null,
      filePaths.length ? filePaths : null, // will be inserted as TEXT[] if not null
      new Date()
    ];

    const result = await pool.query(query, values);

    res.json({
      message: `Inward No ${inwardNo} created successfully`,
      inward_no: inwardNo,
      data: result.rows[0]
    });

  } catch (err) {
    console.error("createInward error:", err);
    res.status(500).json({ message: "Failed to create inward", error: err.message });
  }
};
export const searchInward = async (req, res) => {
  try {
    const {
      inward_no,
      file_no,
      office,
      section,
      seat_no,
      received_from,
      subject,
      fromDate,
      toDate
    } = req.body;

    let query = `SELECT * FROM inward WHERE 1=1`;
    let values = [];

    // EXACT inward number
    if (inward_no) {
      query += ` AND inward_no = $${values.length + 1}`;
      values.push(inward_no);
    }

    // FILE NO LIKE search
    if (file_no) {
      query += ` AND file_no LIKE $${values.length + 1}`;
      values.push(`${file_no}%`);
    }

    if (office) {
      query += ` AND office = $${values.length + 1}`;
      values.push(office);
    }

    if (section) {
      query += ` AND section = $${values.length + 1}`;
      values.push(section);
    }

    if (seat_no) {
      query += ` AND seat_no = $${values.length + 1}`;
      values.push(seat_no);
    }

    if (received_from) {
      query += ` AND received_from = $${values.length + 1}`;
      values.push(received_from);
    }

    if (subject) {
      query += ` AND subject ILIKE $${values.length + 1}`;
      values.push(`%${subject}%`);
    }

    // DATE RANGE only if no inward_no & file_no
    if (!inward_no && !file_no) {
      if (fromDate) {
        query += ` AND inward_date >= $${values.length + 1}`;
        values.push(fromDate);
      }
      if (toDate) {
        query += ` AND inward_date <= $${values.length + 1}`;
        values.push(toDate);
      }
    }

    query += " ORDER BY inward_no ASC";

    const { rows } = await pool.query(query, values);
    res.json(rows);

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ error: "Search failed." });
  }
};




//view
export const viewInwardFile = async (req, res) => {
  try {
    const { inwardNo } = req.params;
    const index = req.query.index ? parseInt(req.query.index) : 0;

    const { rows } = await pool.query(
      "SELECT file_path FROM inward WHERE inward_no = $1",
      [inwardNo]
    );

    if (!rows.length) return res.status(404).json({ message: "No record found" });

    const dbPaths = rows[0].file_path;
    if (!dbPaths || dbPaths.length === 0)
      return res.status(404).json({ message: "File not available" });

    const dbPath = dbPaths[index];
    const realPath = path.join(process.cwd(), dbPath);

    if (!fs.existsSync(realPath))
      return res.status(404).json({ message: "File missing" });

    res.sendFile(realPath);
  } catch (err) {
    console.error("viewInwardFile error:", err);
    res.status(500).json({ message: "File view failed" });
  }
};


// Similar downloadInwardFile (use res.download)
// controllers/inward.controller.js
export const downloadInwardFile = async (req, res) => {
  try {
    const { inwardNo } = req.params;
    const index = req.query.index ? parseInt(req.query.index) : 0;

    const { rows } = await pool.query(
      "SELECT file_path FROM inward WHERE inward_no = $1",
      [inwardNo]
    );

    if (!rows.length)
      return res.status(404).json({ message: "No record found" });

    const dbPaths = rows[0].file_path;
    if (!dbPaths || dbPaths.length === 0)
      return res.status(404).json({ message: "File not available" });

    const filePath = dbPaths[index];
    const realPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(realPath))
      return res.status(404).json({ message: "File missing" });

    const fileName = path.basename(realPath);

    // Force Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    return res.download(realPath);
  } catch (err) {
    console.error("downloadInwardFile error:", err);
    res.status(500).json({ message: "File download failed" });
  }
};

