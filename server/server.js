const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, '../public')));

// Serve index.html at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => { // Use bcrypt in production
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).json({ error: 'Login failed' });
        }
        if (results.length > 0) {
            res.json({ message: 'Login successful', email: results[0].email, role: results[0].role });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// Create position
app.post('/api/positions', (req, res) => {
    const { title, description, qualifications, requirements, duties } = req.body;
    if (!title || !description || !qualifications || !requirements || !duties) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const query = 'INSERT INTO positions (title, description, qualifications, requirements, duties) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, description, qualifications, requirements, duties], (err, result) => {
        if (err) {
            console.error('Error creating position:', err);
            return res.status(500).json({ error: 'Failed to create position' });
        }
        res.json({ message: 'Position created', id: result.insertId });
    });
});

// Add question (restricted to admins)
app.post('/api/questions', (req, res) => {
    const { positionId, text, marks, email } = req.body;
    if (!positionId || !text || !marks || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const checkRoleQuery = 'SELECT role FROM users WHERE email = ?';
    db.query(checkRoleQuery, [email], (err, results) => {
        if (err || !results.length || results[0].role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const query = 'INSERT INTO questions (position_id, text, marks) VALUES (?, ?, ?)';
        db.query(query, [positionId, text, parseInt(marks)], (err, result) => {
            if (err) {
                console.error('Error saving question:', err);
                return res.status(500).json({ error: 'Failed to save question' });
            }
            res.json({ message: 'Question saved', id: result.insertId });
        });
    });
});

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

    // Create tables and alter candidates table separately
    db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'interviewer') DEFAULT 'interviewer'
        )
    `, (err) => {
        if (err) console.error('Error creating users table:', err);
    });

    db.query(`
        CREATE TABLE IF NOT EXISTS positions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) UNIQUE NOT NULL,
            description TEXT,
            qualifications TEXT,
            requirements TEXT,
            duties TEXT
        )
    `, (err) => {
        if (err) console.error('Error creating positions table:', err);
    });

    db.query(`
        CREATE TABLE IF NOT EXISTS questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            position_id INT NOT NULL,
            text TEXT NOT NULL,
            marks INT NOT NULL,
            FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error('Error creating questions table:', err);
    });

    db.query(`
        ALTER TABLE candidates
        ADD COLUMN IF NOT EXISTS position_id INT,
        DROP COLUMN IF EXISTS position,
        ADD COLUMN IF NOT EXISTS interviewer_email VARCHAR(255),
        ADD FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
    `, (err) => {
        if (err) console.error('Error altering candidates table:', err);
    });
});

app.post('/api/evaluations', (req, res) => {
    const { name, email, positionId, scores, comments, averageScore, interviewerEmail } = req.body;
    const scoresJson = JSON.stringify(scores);

    const query = 'INSERT INTO candidates (name, email, position_id, scores, comments, average_score, interviewer_email) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, email, positionId, scoresJson, comments, parseFloat(averageScore), interviewerEmail], (err, result) => {
        if (err) {
            console.error('Error saving evaluation:', err);
            return res.status(500).json({ error: 'Failed to save evaluation' });
        }
        res.json({ message: 'Evaluation saved', id: result.insertId });
    });
});

app.get('/api/evaluations', (req, res) => {
    const query = `
        SELECT name, email, p.title as position, AVG(average_score) as average_score, GROUP_CONCAT(comments SEPARATOR ' | ') as comments
        FROM candidates c
        JOIN positions p ON c.position_id = p.id
        GROUP BY name, email, p.title
        ORDER BY average_score DESC
    `;
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching candidates:', err);
            return res.status(500).json({ error: 'Failed to fetch candidates' });
        }
        const candidates = rows.map(row => ({
            ...row,
            scores: [] // Placeholder, as scores are averaged
        }));
        res.json(candidates);
    });
});

app.get('/api/questions/:positionId', (req, res) => {
    const { positionId } = req.params;
    const query = 'SELECT text, marks FROM questions WHERE position_id = ?';
    db.query(query, [positionId], (err, rows) => {
        if (err) {
            console.error('Error fetching questions:', err);
            return res.status(500).json({ error: 'Failed to fetch questions' });
        }
        res.json(rows);
    });
});

app.get('/api/positions', (req, res) => {
    const query = 'SELECT id, title FROM positions';
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching positions:', err);
            return res.status(500).json({ error: 'Failed to fetch positions' });
        }
        res.json(rows);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));