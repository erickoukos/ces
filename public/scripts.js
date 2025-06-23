let questionsData = [];

document.getElementById('candidate-position').addEventListener('change', loadQuestions);

async function loadQuestions() {
    const position = document.getElementById('candidate-position').value;
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';

    if (!position) return;

    try {
        const response = await fetch('/static/questions.json');
        questionsData = await response.json();
        const questions = questionsData[position] || [];

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
    const name = document.getElementById('candidate-name').value;
    const email = document.getElementById('candidate-email').value;
    const position = document.getElementById('candidate-position').value;
    const comments = document.getElementById('comments').value;

    if (!name || !email || !position) {
        alert('Please fill in all candidate details.');
        return;
    }

    const questionScores = Array.from(document.querySelectorAll('#questions-container .score')).map(input => parseInt(input.value) || 0);
    const criteriaScores = Array.from(document.querySelectorAll('#additional-criteria .score')).map(input => parseInt(input.value) || 0);
    const totalScore = [...questionScores, ...criteriaScores].reduce((sum, score) => sum + score, 0);
    const averageScore = (totalScore / 50 * 100).toFixed(2);

    const evaluation = {
        name,
        email,
        position,
        scores: [...questionScores, ...criteriaScores],
        comments,
        averageScore
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
            alert('Error submitting evaluation.');
        }
    } catch (error) {
        console.error('Error submitting evaluation:', error);
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