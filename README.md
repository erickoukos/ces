# Candidate Evaluation System
A web-based system to evaluate candidates for digital marketing positions, using MySQL with XAMPP for storage.
Prerequisites

- XAMPP (with MySQL/MariaDB enabled)
- Node.js (v16 or later, confirmed v22.14.0)
- A web browser

## Setup Instructions

### 1. Start XAMPP:

Open XAMPP Control Panel.
Start Apache and MySQL modules.
Verify at http://localhost/phpmyadmin.


### 2. Create MySQL Database:

In phpMyAdmin, create a database named candidate_evaluation.
Run:

`CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    scores TEXT NOT NULL,
    comments TEXT,
    average_score DECIMAL(5,2) NOT NULL
);`




### 3. Verify Project Directory:

Ensure you’re in C:\xampp\htdocs\ces.


Update Dependencies:

Save the provided package.json.
Run: `npm install`




Create File Structure:

Create folders: public and server.
Save files: index.html, styles.css, scripts.js, questions.json in public/.
Save files: server.js, db.js in server/.
Save package.json and README.md in C:\xampp\htdocs\ces.


Update MySQL Password (if set):

If you set a password for MySQL in XAMPP, update server.js and db.js:password: 'your_password'




Start the Server:
npm start


Access the Application:

Open http://localhost:3000 in a browser.



Adding Questions and Positions

Add a New Position:
Edit public/index.html.
Add to #candidate-position dropdown:<option value="Graphic Designer">Graphic Designer</option>




Add Questions:
Edit public/questions.json.
Add a new position key:"Graphic Designer": [
    `{ "text": "Describe your experience with Adobe Illustrator.", "marks": 4 },`
    `{ "text": "How do you ensure brand consistency?", "marks": 4 },`
    `{ "text": "Share a design project example.", "marks": 5 },`
    `{ "text": "How do you meet campaign deadlines?", "marks": 5 },`
    `{ "text": "What tools do you use for prototyping?", "marks": 4 },`
    `{ "text": "How do you handle client feedback?", "marks": 4 },`
    `{ "text": "Describe a challenging design project.", "marks": 5 },`
    `{ "text": "How do you stay updated with design trends?", "marks": 4 },`
    `{ "text": "What is your approach to typography?", "marks": 4 },`
    `{ "text": "How do you optimize designs for digital?", "marks": 4 }`
]


Ensure total marks: 40 (questions) + 10 (criteria) = 50.


Restart Server:
Stop and run npm start.



Database

Database: candidate_evaluation in MySQL (via XAMPP).
Table: candidates (id, name, email, position, scores, comments, average_score).
View Data:
Use phpMyAdmin (http://localhost/phpmyadmin).
Or query via Node.js:const db = require('./server/db.js');
db.query('SELECT * FROM candidates', (err, rows) => console.log(rows));





Usage

Evaluate Candidates:
Enter name, email, position.
Score questions (40 marks) and criteria (10 marks).
Add comments and submit.


View Rankings:
Top three candidates displayed by average score.



Troubleshooting

MySQL Connection Error:
Verify MySQL is running in XAMPP.
Check credentials in server.js and db.js.
Ensure candidate_evaluation database exists.


Server Won’t Start:
Check port 3000: netstat -aon | findstr :3000.
Change port in server.js if needed (e.g., PORT = 3001).


Questions Don’t Load:
Validate questions.json (use JSON validator).
Ensure it’s in public/.


Page Not Loading:
Confirm npm start is running.
Try http://127.0.0.1:3000.



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


Restart server and test.
