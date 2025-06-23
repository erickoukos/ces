const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Update if you set a password in XAMPP
    database: 'candidate_evaluation'
});

module.exports = db;