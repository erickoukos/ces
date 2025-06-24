let questionsData = {};
let authenticated = false;
let interviewerEmail = '';
let userRole = '';

document.getElementById('candidate-position').addEventListener('change', loadQuestions);

async function loginInterviewer() {
    const email = document.getElementById('interviewer-email').value;
    const password = document.getElementById('interviewer-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            interviewerEmail = data.email;
            userRole = data.role;
            authenticated = true;
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('evaluation-section').style.display = 'block';
            document.getElementById('questions-scores-section').style.display = 'block';
            document.getElementById('results').style.display = 'block';
            if (userRole === 'admin') {
                document.getElementById('position-management-section').style.display = 'block';
                document.getElementById('question-submission-section').style.display = 'block';
            }
            loadPositions();
            alert('Login successful!');
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Login failed');
    }
}

async function loadPositions() {
    try {
        const response = await fetch('/api/positions');
        const positions = await response.json();
        const positionSelects = [document.getElementById('candidate-position'), document.getElementById('new-question-position')];
        positionSelects.forEach(select => {
            select.innerHTML = '<option value="" disabled selected>Select Position</option>';
            positions.forEach(pos => {
                const option = document.createElement('option');
                option.value = pos.id;
                option.textContent = pos.title;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error loading positions:', error);
    }
}

async function createPosition() {
    if (userRole !== 'admin') {
        alert('Only admins can create positions.');
        return;
    }

    const title = document.getElementById('position-title').value;
    const description = document.getElementById('position-description').value;
    const qualifications = document.getElementById('position-qualifications').value;
    const requirements = document.getElementById('position-requirements').value;
    const duties = document.getElementById('position-duties').value;
    const totalMarks = document.getElementById('position-total-marks').value;

    if (!title || !description || !qualifications || !requirements || !duties || !totalMarks) {
        alert('All fields are required.');
        return;
    }
    if (totalMarks < 10 || totalMarks > 100) {
        alert('Total marks must be between 10 and 100.');
        return;
    }

    const position = { title, description, qualifications, requirements, duties, totalMarks: parseInt(totalMarks), email: interviewerEmail };

    try {
        const response = await fetch('/api/positions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(position)
        });

        if (response.ok) {
            alert('Position created successfully!');
            document.getElementById('position-title').value = '';
            document.getElementById('position-description').value = '';
            document.getElementById('position-qualifications').value = '';
            document.getElementById('position-requirements').value = '';
            document.getElementById('position-duties').value = '';
            document.getElementById('position-total-marks').value = '';
            loadPositions();
        } else {
            const data = await response.json();
            alert(data.error || 'Error creating position.');
        }
    } catch (error) {
        console.error('Error creating position:', error);
    }
}

async function loadQuestions() {
    const positionId = document.getElementById('candidate-position').value;
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';

    if (!positionId || !authenticated) return;

    try {
        const response = await fetch(`/api/questions/${positionId}`);
        questionsData[positionId] = await response.json();
        const questions = questionsData[positionId] || [];

        questions.forEach((q, index) => {
            const div = document.createElement('div');
            div.className = 'question-item';
            div.innerHTML = `
                <label>${index + 1}. ${q.text} (${q.marks} marks)</label>
                <input type="number" min="0" max="${q.marks}" class="score input-field" data-question="${index}" placeholder="Score">
            `;
            questionsContainer.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

async function submitEvaluation() {
    if (!authenticated) {
        alert('Please log in first.');
        return;
    }

    const name = document.getElementById('candidate-name').value;
    const email = document.getElementById('candidate-email').value;
    const positionId = document.getElementById('candidate-position').value;
    const comments = document.getElementById('comments').value;

    if (!name || !email || !positionId) {
        alert('Please fill in all candidate details.');
        return;
    }

    const questionScores = Array.from(document.querySelectorAll('#questions-container .score')).map(input => parseInt(input.value) || 0);
    const criteriaScores = Array.from(document.querySelectorAll('#additional-criteria .score')).map(input => parseInt(input.value) || 0);
    const totalScore = [...questionScores, ...criteriaScores].reduce((sum, score) => sum + score, 0);
    const averageScore = (totalScore / 50 * 100).toFixed(2); // Adjust denominator based on position total_marks

    const evaluation = {
        name,
        email,
        positionId,
        scores: [...questionScores, ...criteriaScores],
        comments,
        averageScore,
        interviewerEmail
    };

    try {
        const response = await fetch('/api/evaluations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evaluation)
        });

        if (response.ok) {
            alert('Evaluation submitted successfully!');
            fetchCandidates();
            clearForm();
        } else {
            const data = await response.json();
            alert(data.error || 'Error submitting evaluation.');
        }
    } catch (error) {
        console.error('Error submitting evaluation:', error);
    }
}

async function submitQuestion() {
    if (userRole !== 'admin') {
        alert('Only admins can add questions.');
        return;
    }

    const positionId = document.getElementById('new-question-position').value;
    const text = document.getElementById('new-question-text').value;
    const marks = document.getElementById('new-question-marks').value;

    if (!positionId || !text || !marks) {
        alert('Please fill in all question details.');
        return;
    }
    if (marks < 1 || marks > 10) {
        alert('Marks must be between 1 and 10.');
        return;
    }

    const question = { positionId, text, marks: parseInt(marks), email: interviewerEmail };

    try {
        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(question)
        });

        if (response.ok) {
            alert('Question added successfully!');
            document.getElementById('new-question-text').value = '';
            document.getElementById('new-question-marks').value = '';
            loadQuestions();
        } else {
            const data = await response.json();
            document.getElementById('marks-warning').style.display = 'block';
            alert(data.error || 'Error adding question.');
            setTimeout(() => document.getElementById('marks-warning').style.display = 'none', 3000);
        }
    } catch (error) {
        console.error('Error submitting question:', error);
    }
}

async function fetchCandidates() {
    try {
        const response = await fetch('/api/evaluations');
        const candidates = await response.json();
        displayResults(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error);
    }
}

function displayResults(candidates) {
    const candidateList = document.getElementById('candidate-list');
    candidateList.innerHTML = '<h3 class="text-lg font-semibold">Top 3 Candidates</h3>';

    const topCandidates = candidates.slice(0, 3);
    topCandidates.forEach((candidate, index) => {
        const candidateDiv = document.createElement('div');
        candidateDiv.className = 'candidate-item';
        candidateDiv.innerHTML = `
            <p><strong>Rank ${index + 1}: ${candidate.name}</strong></p>
            <p>Email: ${candidate.email}</p>
            <p>Position: ${candidate.position}</p>
            <p>Average Score: ${candidate.average_score}%</p>
            <p>Comments: ${candidate.comments || 'No comments'}</p>
        `;
        candidateList.appendChild(candidateDiv);
    });
}

function clearForm() {
    document.getElementById('candidate-name').value = '';
    document.getElementById('candidate-email').value = '';
    document.getElementById('candidate-position').value = '';
    document.querySelectorAll('.score').forEach(input => input.value = '');
    document.getElementById('comments').value = '';
    document.getElementById('questions-container').innerHTML = '';
}