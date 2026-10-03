// 1. Import essential libraries
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// 2. Initialize the app and set up middleware
const app = express();
app.use(cors());
app.use(express.json()); // Essential for parsing JSON bodies in POST/PUT requests

// 3. Configure the database connection pool using environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// 4. Route to get all expenses (GET)
app.get('/api/expenses', async (req, res) => {
    try {
        const result = await pool.query("SELECT id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date FROM expenses ORDER BY id ASC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 5. Route to get a specific expense by ID (GET)
app.get('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(404).json({ error: "Expense not found" });
        }
        const result = await pool.query("SELECT id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date FROM expenses WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 6. Route to add a new expense (POST)
app.post('/api/expenses', async (req, res) => {
    try {
        const { title, amount, category, date } = req.body;

        if (!title || !String(title).trim() || amount === undefined || amount === '' || !category || !date) {
            return res.status(400).json({ error: "All fields are required" });
        }
        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ error: "Amount must be a number greater than 0" });
        }
        const allowedCategories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({ error: "Invalid category" });
        }

        const queryText = `
            INSERT INTO expenses (title, amount, category, date) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date;
        `;
        const result = await pool.query(queryText, [title, amount, category, date]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 7. Route to update an existing expense (PUT)
app.put('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, amount, category, date } = req.body;

        if (isNaN(id)) {
            return res.status(404).json({ error: "Expense not found" });
        }
        if (!title || !String(title).trim() || amount === undefined || amount === '' || !category || !date) {
            return res.status(400).json({ error: "All fields are required" });
        }
        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ error: "Amount must be a number greater than 0" });
        }
        const allowedCategories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({ error: "Invalid category" });
        }

        const queryText = `
            UPDATE expenses 
            SET title = $1, amount = $2, category = $3, date = $4 
            WHERE id = $5 
            RETURNING id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date;
        `;
        const result = await pool.query(queryText, [title, amount, category, date, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 8. Route to delete an expense (DELETE)
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(404).json({ error: "Expense not found" });
        }
        const queryText = "DELETE FROM expenses WHERE id = $1 RETURNING id, title, amount::float8 AS amount, category, to_char(date, 'YYYY-MM-DD') AS date;";
        const result = await pool.query(queryText, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 9. Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



