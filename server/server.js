const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const db = new sqlite3.Database(path.join(__dirname, 'candidate.db'));

db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        position TEXT NOT NULL,
        scores TEXT NOT NULL,
        comments TEXT,
        average_score REAL NOT NULL
    );
`);

app.post('/api/evaluations', (req, res) => {
    const { name, email, position, scores, comments, averageScore } = req.body;
    const scoresJson = JSON.stringify(scores);

    db.run(
        'INSERT INTO candidates (name, email, position, scores, comments, average_score) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, position, scoresJson, comments, parseFloat(averageScore)],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save evaluation' });
            }
            res.json({ message: 'Evaluation saved', id: this.lastID });
        }
    );
});

app.get('/api/evaluations', (req, res) => {
    db.all('SELECT * FROM candidates ORDER BY average_score DESC', [], (err, rows) => {
        if (err) {
            console.error(err);
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