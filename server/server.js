const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, '../public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Update with your XAMPP MySQL password if set
    database: 'candidate_evaluation'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
});

app.post('/api/evaluations', (req, res) => {
    const { name, email, position, scores, comments, averageScore } = req.body;
    const scoresJson = JSON.stringify(scores);

    const query = 'INSERT INTO candidates (name, email, position, scores, comments, average_score) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [name, email, position, scoresJson, comments, parseFloat(averageScore)], (err, result) => {
        if (err) {
            console.error('Error saving evaluation:', err);
            return res.status(500).json({ error: 'Failed to save evaluation' });
        }
        res.json({ message: 'Evaluation saved', id: result.insertId });
    });
});

app.get('/api/evaluations', (req, res) => {
    const query = 'SELECT * FROM candidates ORDER BY average_score DESC';
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching candidates:', err);
            return res.status(500).json({ error: 'Failed to fetch candidates' });
        }
        const candidates = rows.map(row => ({
            ...row,
            scores: JSON.parse(row.scores)
        }));
        res.json(candidates);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));