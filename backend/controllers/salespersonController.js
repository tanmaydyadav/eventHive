const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Create a new salesperson (only by admin)
const createSalesperson = async (req, res) => {
    try {
        const { username, email, password, phone,age } = req.body;

        // Check if the email is already in use
        const emailCheck = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the salesperson
        const result = await pool.query(
            `INSERT INTO clients (username, email, password, phone_number,age,role) 
             VALUES ($1, $2, $3, $4,$5,$6) RETURNING *`,
            [username, email, hashedPassword, phone,age, 2]
        );

        res.status(201).json({ message: 'Salesperson created successfully', salesperson: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all salespersons
const getSalespersons = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clients where role =2');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update a salesperson
const updateSalesperson = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;

        const result = await pool.query(
            `UPDATE clients 
             SET name = $1, email = $2, phone = $3 
             WHERE salesperson_id = $4 RETURNING *`,
            [name, email, phone, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Salesperson not found' });
        }

        res.status(200).json({ message: 'Salesperson updated successfully', salesperson: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a salesperson
const deleteSalesperson = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM clients WHERE client_id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Salesperson not found' });
        }

        res.status(200).json({ message: 'Salesperson deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createSalesperson,
    getSalespersons,
    updateSalesperson,
    deleteSalesperson
};
