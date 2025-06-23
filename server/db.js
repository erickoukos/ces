const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Update with your XAMPP MySQL password if set
    database: 'candidate_evaluation'
});

module.exports = db;