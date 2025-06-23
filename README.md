Candidate Evaluation System
A web-based system to evaluate candidates for digital marketing positions, using MySQL with XAMPP for storage.
Prerequisites

XAMPP (with MySQL/MariaDB enabled)
Node.js (v16 or later)
A web browser

Setup Instructions

Start XAMPP:

Open XAMPP Control Panel.
Start Apache and MySQL modules.


Create MySQL Database:

Go to http://localhost/phpmyadmin.
Create a database named candidate_evaluation.
Run the following SQL in the "SQL" tab:CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    scores TEXT NOT NULL,
    comments TEXT,
    average_score DECIMAL(5,2) NOT NULL
);




Create Project Directory:
mkdir candidate-evaluation-system
cd candidate-evaluation-system


Initialize Node.js Project:
npm init -y


Install Dependencies:
npm install express mysql2


Create File Structure:

Create folders: public and server.
Save the provided files (index.html, styles.css, scripts.js, questions.json, server.js, db.js, package.json, README.md) in their respective locations.


Update MySQL Password (if set):

If you set a password for MySQL in XAMPP, update server.js and db.js:password: 'your_password'




Start the Server:
npm start


Access the Application:

Open http://localhost:3000 in a browser.



Adding Questions and Positions

Add a New Position:
Edit public/index.html.
Add an option to the #candidate-position dropdown:<option value="Graphic Designer">Graphic Designer</option>




Add Questions:
Edit public/questions.json.
Add a new position key with questions:"Graphic Designer": [
    { "text": "Describe your experience with Adobe Illustrator.", "marks": 4 },
    { "text": "How do you ensure brand consistency?", "marks": 4 },
    { "text": "Share a design project example.", "marks": 5 },
    { "text": "How do you meet campaign deadlines?", "marks": 5 },
    { "text": "What tools do you use for prototyping?", "marks": 4 },
    { "text": "How do you handle client feedback?", "marks": 4 },
    { "text": "Describe a challenging design project.", "marks": 5 },
    { "text": "How do you stay updated with design trends?", "marks": 4 },
    { "text": "What is your approach to typography?", "marks": 4 },
    { "text": "How do you optimize designs for digital?", "marks": 4 }
]


Ensure total marks (questions + criteria) sum to 50.


Restart Server:
Stop and restart the server (npm start) to load changes.



Database

Database: candidate_evaluation in MySQL (via XAMPP).
Table: candidates (id, name, email, position, scores, comments, average_score).
View Data:
Use phpMyAdmin (http://localhost/phpmyadmin) to browse the candidates table.
Or query via Node.js:const db = require('./server/db.js');
db.query('SELECT * FROM candidates', (err, rows) => console.log(rows));





Usage

Evaluate Candidates:
Enter name, email, and select position.
Score questions and additional criteria (grooming, etc.).
Add comments and submit.


View Rankings:
Top three candidates are displayed based on average score.



Notes

Multiple Interviewers: Each submission is a separate entry. To average scores across interviewers, modify the database to group by email.
Security: Add authentication for production use.
Troubleshooting:
Ensure XAMPP’s MySQL is running.
Verify MySQL credentials in server.js and db.js.
Check http://localhost:3000 is accessible.
Ensure questions.json is valid JSON.



Example: Adding a Position

Add to index.html:<option value="Graphic Designer">Graphic Designer</option>


Add to questions.json:"Graphic Designer": [
    { "text": "Describe your experience with Adobe Illustrator.", "marks": 4 },
    { "text": "How do you ensure brand consistency?", "marks": 4 },
    { "text": "Share a design project example.", "marks": 5 },
    { "text": "How do you meet campaign deadlines?", "marks": 5 },
    { "text": "What tools do you use for prototyping?", "marks": 4 },
    { "text": "How do you handle client feedback?", "marks": 4 },
    { "text": "Describe a challenging design project.", "marks": 5 },
    { "text": "How do you stay updated with design trends?", "marks": 4 },
    { "text": "What is your approach to typography?", "marks": 4 },
    { "text": "How do you optimize designs for digital?", "marks": 4 }
]


Total: 10 questions (8×4 + 2×5 = 40) + criteria (5×2 = 10) = 50 marks.


Restart server and test.

