import pool from "../config/db.js";
import multer from "multer";
import fs from "fs";
import ExcelJS from "exceljs";
import path from "path";



// ================= Multer Config =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/outward";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

export const outwardUpload = multer({ storage }).array("documents"); // handle multiple files

// ================= Generate Outward Number =================
export const generateOutwardNo = async (req, res) => {
  try {
    const result = await pool.query("SELECT COALESCE(MAX(id),0)+1 AS next FROM outward");
    res.json({ outwardNo: result.rows[0].next });
  } catch (err) {
    console.error("Error generating outward number:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// ================= Save Outward Entry =================
// ================= Save Outward Entry =================
export const saveOutward = async (req, res) => {
  try {
    let outward_no = req.body.outward_no;

    if (!outward_no) {
      const nextResult = await pool.query(
        "SELECT COALESCE(MAX(id),0)+1 AS next FROM outward"
      );
      outward_no = "OUT-" + String(nextResult.rows[0].next).padStart(5, "0");
    }

    const inwardFilePaths = req.body.inward_file_paths || [];

    // ✅ COPY FILES FROM INWARD → OUTWARD
    let file_paths = null;

    if (Array.isArray(inwardFilePaths) && inwardFilePaths.length > 0) {
      file_paths = inwardFilePaths.map((oldPath) => {
        const fileName = path.basename(oldPath);
        const newPath = `uploads/outward/${Date.now()}-${fileName}`;

        fs.copyFileSync(
          path.join(process.cwd(), oldPath),
          path.join(process.cwd(), newPath)
        );

        return newPath.replace(/\\/g, "/");
      });
    }

    const query = `
      INSERT INTO outward (
        outward_no, outward_date, inward_no, office, section, seat_no,
        year, file_no, received_from, dispatch_to, category,
        subject, remarks, file_path, file_status, created_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW()
      )
      RETURNING outward_no, file_status;
    `;

    const values = [
      outward_no,
      req.body.outward_date,
      req.body.inward_no,
      req.body.office,
      req.body.section,
      req.body.seat_no,
      req.body.year,
      req.body.file_no,
      req.body.received_from,
      req.body.dispatch_to,
      req.body.category,
      req.body.subject,
      req.body.remarks,
      file_paths,
      req.body.file_status || "Open"
    ];

    const result = await pool.query(query, values);

    res.json({
      success: true,
      outward_no: result.rows[0].outward_no,
      status: result.rows[0].file_status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Save outward failed" });
  }
};


// ======================== GET OUTWARD BY RANGE ========================
export const getOutwardRange = async (req, res) => {
  try {
    const { fromNo, toNo } = req.query;

    const { rows } = await pool.query(
      `SELECT *
       FROM outward
       WHERE outward_no >= $1 AND outward_no <= $2
       ORDER BY outward_no ASC`,
      [fromNo, toNo]
    );

    rows.forEach(r => {
      try {
        r.file_path = parsePgArray(r.file_path).map(f => f.replace(/\\/g, "/"));
      } catch {
        r.file_path = [];
      }
    });

    res.json(rows);

  } catch (err) {
    console.error("getOutwardRange error:", err);
    res.status(500).json({ message: "Error fetching outward records" });
  }
};

// ======================== VIEW SINGLE FILE ========================
export const viewOutwardFile = async (req, res) => {
  try {
    const { outwardNo } = req.params;
    const index = req.query.index ? parseInt(req.query.index) : 0;

    // Fetch file_path array from DB
    const { rows } = await pool.query(
      "SELECT file_path FROM outward WHERE outward_no = $1",
      [outwardNo]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No record found" });
    }

    let dbPaths = rows[0].file_path;

    // Handle null, empty, or malformed file_path
    if (!dbPaths || (Array.isArray(dbPaths) && dbPaths.length === 0) || dbPaths === "{}") {
      return res.status(404).json({ message: "No files available" });
    }

    // If PostgreSQL returns array as string (e.g., '{"uploads/file.txt"}')
    if (typeof dbPaths === "string") {
      try {
        dbPaths = dbPaths.replace(/[{}]/g, "").split(",").map(f => f.trim());
      } catch {
        dbPaths = [dbPaths]; // fallback
      }
    }

    // Ensure dbPaths is an array
    if (!Array.isArray(dbPaths)) dbPaths = [dbPaths];

    // Remove null/undefined entries
    dbPaths = dbPaths.filter(f => f);

    if (!dbPaths.length) {
      return res.status(404).json({ message: "No valid files found" });
    }

    // Ensure requested index exists
    if (index < 0 || index >= dbPaths.length) {
      return res.status(400).json({ message: "Invalid file index" });
    }

    // Normalize slashes
    const filePath = dbPaths[index].replace(/\\/g, "/");
    const realPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(realPath)) {
      return res.status(404).json({ message: "File missing on server" });
    }

    res.sendFile(realPath);

  } catch (err) {
    console.error("viewOutwardFile error:", err);
    res.status(500).json({ message: "File view failed" });
  }
};



// ======================== EXPORT EXCEL ==========================
export const exportOutwardExcel = async (req, res) => {
  try {
    const { fromNo, toNo } = req.body;

    const { rows } = await pool.query(
      `SELECT outward_no, outward_date, inward_no, office, section, seat_no, year,
              file_no, received_from, dispatch_to, category, file_status,
              subject, remarks
       FROM outward
       WHERE CAST(SPLIT_PART(outward_no, '-', 2) AS INTEGER)
       BETWEEN CAST(SPLIT_PART($1, '-', 2) AS INTEGER)
       AND     CAST(SPLIT_PART($2, '-', 2) AS INTEGER)
       ORDER BY CAST(SPLIT_PART(outward_no, '-', 2) AS INTEGER) ASC`,
      [fromNo, toNo]
    );

    if (!rows.length)
      return res.status(404).json({ message: "No data found" });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Outward Data");

    sheet.columns = [
      { header: "Outward No", key: "outward_no", width: 15 },
      { header: "Date", key: "outward_date", width: 15 },
      { header: "Inward No", key: "inward_no", width: 15 },
      { header: "Office", key: "office", width: 20 },
      { header: "Section", key: "section", width: 15 },
      { header: "Seat No", key: "seat_no", width: 12 },
      { header: "Year", key: "year", width: 10 },
      { header: "File No", key: "file_no", width: 15 },
      { header: "Received From", key: "received_from", width: 20 },
      { header: "Dispatch To", key: "dispatch_to", width: 20 },
      { header: "Category", key: "category", width: 15 },
      { header: "File Status", key: "file_status", width: 15 },
      { header: "Subject", key: "subject", width: 30 },
      { header: "Remarks", key: "remarks", width: 30 },
    ];

    rows.forEach((r) => sheet.addRow(r));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=outward.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    res.status(500).json({ message: "Excel Export Failed" });
  }
};


