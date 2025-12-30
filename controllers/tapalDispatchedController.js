



import pool from '../config/db.js';

export const addTapalDispatched = async (req, res) => {
    const { inwardNo, date, dispatchedTo, remarks, note } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO tapal_dispatched
            (inward_no, date, dispatched_to, remarks, note) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [inwardNo, date, dispatchedTo, remarks, note]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database insert error' });
    }
};

export const getAllDispatched = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tapal_dispatched ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database fetch error' });
    }
};
