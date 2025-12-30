import pool from "../config/db.js";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get admin by username
    const result = await pool.query(
      "SELECT * FROM admin WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = result.rows[0];

    // Verify password using PostgreSQL crypt
    const passwordCheck = await pool.query(
      "SELECT username FROM admin WHERE username = $1 AND password_hash = crypt($2, password_hash)",
      [username, password]
    );

    if (passwordCheck.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
