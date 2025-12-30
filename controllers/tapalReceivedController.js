





import pool from '../config/db.js';

export const addTapalReceived = async (req, res) => {
    const { inwardNo, date, referenceNo, referenceDate, subject, receivedFrom } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO tapal_received 
            (inward_no, date, reference_no, reference_date, subject, received_from) 
            VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [inwardNo, date, referenceNo, referenceDate, subject, receivedFrom]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database insert error' });
    }
};

export const getAllTapalReceived = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tapal_received ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database fetch error' });
    }
};
