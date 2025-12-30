import pool from "../config/db.js";
import xlsx from "xlsx";

// Fetch Tapal data for print
export const printTapal = async (req, res) => {
  const { outwardFromNo, outwardToNo } = req.body;

  if (!outwardFromNo || !outwardToNo) {
    return res.status(400).json({ error: "Please provide both From and To numbers" });
  }

  try {
    // Use BETWEEN in SQL to filter correctly
    const result = await pool.query(
      `SELECT * FROM tapal_received
       WHERE inward_no >= $1 AND inward_no <= $2
       ORDER BY inward_no ASC`,
      [outwardFromNo, outwardToNo]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Print Tapal Error:", err);
    res.status(500).json({ error: "Error fetching Tapal for print" });
  }
};

// Download filtered Tapal as Excel
export const downloadPrintTapalExcel = async (req, res) => {
  const { outwardFromNo, outwardToNo } = req.body;

  if (!outwardFromNo || !outwardToNo) {
    return res.status(400).json({ error: "Please provide both From and To numbers" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM tapal_received
       WHERE inward_no >= $1 AND inward_no <= $2
       ORDER BY inward_no ASC`,
      [outwardFromNo, outwardToNo]
    );

    const rows = result.rows;

    const workbook = xlsx.utils.book_new();
    const sheet = xlsx.utils.json_to_sheet(rows);
    xlsx.utils.book_append_sheet(workbook, sheet, "Tapal");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=Tapal.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (err) {
    console.error("Excel Download Error:", err);
    res.status(500).json({ error: "Excel download failed" });
  }
};
