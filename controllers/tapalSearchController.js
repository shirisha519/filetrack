



import pool from '../config/db.js';

export const searchTapal = async (req, res) => {
    const { inwardNumber, subject, receivedFrom, referenceNo, referenceDate, fromDate, toDate } = req.body;

    try {
        let query = `SELECT * FROM tapal_received WHERE 1=1`;
        const values = [];
        let idx = 1;

        if (inwardNumber) {
            query += ` AND inward_no = $${idx++}`;
            values.push(inwardNumber);
        }
        if (subject) {
            query += ` AND subject ILIKE $${idx++}`;
            values.push(`%${subject}%`);
        }
        if (receivedFrom) {
            query += ` AND received_from ILIKE $${idx++}`;
            values.push(`%${receivedFrom}%`);
        }
        if (referenceNo) {
            query += ` AND reference_no = $${idx++}`;
            values.push(referenceNo);
        }
        if (referenceDate) {
            query += ` AND reference_date = $${idx++}`;
            values.push(referenceDate);
        }
        if (fromDate && toDate) {
            query += ` AND reference_date BETWEEN $${idx++} AND $${idx++}`;
            values.push(fromDate, toDate);
        }

        query += ` ORDER BY date DESC`;

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error searching Tapal' });
    }
};
