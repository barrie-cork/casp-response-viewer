/**
 * CASP RCT Response Viewer - Main Application
 * Displays student responses to CASP Randomised Controlled Trial questions with voting and statistics
 */

class CASPResponseViewer {
    constructor() {
        this.data = null;
        this.votes = {};
        this.userVotes = {};
        this.currentQuestionIndex = 0;
        this.currentFilter = 'all';
        this.autoRefresh = CONFIG.AUTO_REFRESH;
        this.refreshInterval = null;
        this.charts = {};

        this.init();
    }

    async init() {
        this.attachEventListeners();
        await this.loadData();

        if (this.autoRefresh) {
            this.startAutoRefresh();
        }
    }

    attachEventListeners() {
        // Navigation
        document.getElementById('prevQuestion').addEventListener('click', () => this.previousQuestion());
        document.getElementById('nextQuestion').addEventListener('click', () => this.nextQuestion());
        document.getElementById('questionSelector').addEventListener('change', (e) => {
            this.currentQuestionIndex = parseInt(e.target.value);
            this.displayCurrentQuestion();
        });

        // Filter
        document.getElementById('filterAnswer').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.displayResponses();
        });

        // Statistics
        document.getElementById('showStatistics').addEventListener('click', () => this.showStatistics());

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            document.getElementById('statisticsModal').style.display = 'none';
        });

        // Click outside modal to close
        document.getElementById('statisticsModal').addEventListener('click', (e) => {
            if (e.target.id === 'statisticsModal') {
                document.getElementById('statisticsModal').style.display = 'none';
            }
        });

        // Refresh toggle
        document.getElementById('toggleRefresh').addEventListener('click', () => this.toggleAutoRefresh());

        // Retry button
        document.getElementById('retryButton').addEventListener('click', () => this.loadData());

        // CONSIDER prompt toggle
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('consider-toggle')) {
                const content = e.target.nextElementSibling;
                const isShowing = content.style.display === 'block';
                content.style.display = isShowing ? 'none' : 'block';
                e.target.textContent = isShowing ? '▼ Show CONSIDER Prompts' : '▲ Hide CONSIDER Prompts';
            }
        });
    }

    async loadData() {
        try {
            this.showLoading(true);
            this.hideError();

            // Check if API URL is configured
            if (!CONFIG.API_URL || CONFIG.API_URL === '') {
                throw new Error('API URL not configured. Please update config.js');
            }

            // Fetch responses
            const response = await fetch(CONFIG.API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rawData = await response.json();

            // Transform the data structure if needed
            this.data = this.transformData(rawData);

            // Fetch votes
            if (CONFIG.ENABLE_VOTING) {
                await this.loadVotes();
            }

            // Load user's votes from localStorage
            this.loadUserVotes();

            // Populate question selector
            this.populateQuestionSelector();

            // Display current question
            this.displayCurrentQuestion();

            // Update last refresh time
            document.getElementById('lastUpdate').textContent =
                `Last updated: ${new Date().toLocaleTimeString()}`;

            this.showLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError(error.message);
            this.showLoading(false);
        }
    }

    async loadVotes() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=getVotes`);
            if (response.ok) {
                const votesData = await response.json();

                // The API returns votes in format: {"q0_s0": 2, "q1_s3": 1, ...}
                // We need to convert to: {"0_0": 2, "1_3": 1, ...}
                this.votes = {};

                if (votesData && typeof votesData === 'object') {
                    // Check if it's the direct format from getVotes
                    Object.entries(votesData).forEach(([key, count]) => {
                        // Parse the key format "q0_s0" to "0_0"
                        const match = key.match(/q(\d+)_s(\d+)/);
                        if (match) {
                            const newKey = `${match[1]}_${match[2]}`;
                            this.votes[newKey] = count;
                        }
                    });

                    console.log('Loaded votes:', this.votes);
                } else if (votesData.votes) {
                    // Alternative format with votes array
                    votesData.votes.forEach(vote => {
                        const key = `${vote.questionIndex}_${vote.studentRowIndex}`;
                        this.votes[key] = (this.votes[key] || 0) + 1;
                    });
                }
            }
        } catch (error) {
            console.error('Error loading votes:', error);
            // Continue without votes
        }
    }

    transformData(rawData) {
        // Check if data needs transformation (responses nested in questions)
        if (rawData.questions && rawData.questions.length > 0 && rawData.questions[0].responses) {
            // Transform nested structure to flat structure
            const transformedData = {
                questions: [],
                responses: [],
                totalStudents: rawData.totalStudents || 0,
                lastUpdated: rawData.lastUpdated
            };

            // Create a map of student responses
            const studentMap = new Map();

            // Process each question
            rawData.questions.forEach((q, qIndex) => {
                // Add question info (without responses)
                transformedData.questions.push({
                    questionText: q.questionText,
                    considerPrompt: q.considerPrompts ? q.considerPrompts.join('\n• ') : ''
                });

                // Process responses for this question
                if (q.responses) {
                    q.responses.forEach(r => {
                        // Get or create student entry
                        if (!studentMap.has(r.rowIndex)) {
                            studentMap.set(r.rowIndex, {
                                index: r.rowIndex,
                                studentId: r.studentId,
                                answers: []
                            });
                        }

                        // Add this answer to the student's answers array
                        const student = studentMap.get(r.rowIndex);
                        while (student.answers.length <= qIndex) {
                            student.answers.push(null);
                        }
                        student.answers[qIndex] = {
                            answer: r.answer,
                            explanation: r.explanation
                        };
                    });
                }
            });

            // Convert map to array
            transformedData.responses = Array.from(studentMap.values());

            return transformedData;
        }

        // Data is already in expected format
        return rawData;
    }

    loadUserVotes() {
        // Check localStorage for which responses this user has voted for
        this.userVotes = {};
        for (let q = 0; q < CONFIG.TOTAL_QUESTIONS; q++) {
            for (let s = 0; s < 100; s++) { // Assume max 100 students
                const key = `${CONFIG.STORAGE_PREFIX}q${q}_s${s}`;
                if (localStorage.getItem(key)) {
                    this.userVotes[`${q}_${s}`] = true;
                }
            }
        }
    }

    populateQuestionSelector() {
        const selector = document.getElementById('questionSelector');
        selector.innerHTML = '';

        // RCT has 13 questions (including 4a, 4b, 4c)
        const questionLabels = [
            'Question 1: Clear focused issue',
            'Question 2: Randomisation',
            'Question 3: Blinding',
            'Question 4a: Groups similar at start',
            'Question 4b: Groups treated equally',
            'Question 4c: All patients accounted for',
            'Question 5: Sample size',
            'Question 6: How results presented',
            'Question 7: Estimate of treatment effect',
            'Question 8: Precision of estimate',
            'Question 9: Apply to local population',
            'Question 10: Clinically important outcomes',
            'Question 11: Benefits worth harms/costs'
        ];

        questionLabels.forEach((label, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = label;
            selector.appendChild(option);
        });

        selector.value = this.currentQuestionIndex;
    }

    displayCurrentQuestion() {
        if (!this.data || !this.data.questions) return;

        const question = this.data.questions[this.currentQuestionIndex];
        if (!question) return;

        // Update question text
        document.getElementById('questionText').textContent = question.questionText;

        // Update CONSIDER prompts
        const considerContent = document.querySelector('.consider-content');
        if (question.considerPrompt) {
            considerContent.innerHTML = this.formatConsiderPrompts(question.considerPrompt);
        } else {
            considerContent.innerHTML = '<p>No CONSIDER prompts available for this question.</p>';
        }

        // Update navigation buttons
        document.getElementById('prevQuestion').disabled = this.currentQuestionIndex === 0;
        document.getElementById('nextQuestion').disabled = this.currentQuestionIndex === CONFIG.TOTAL_QUESTIONS - 1;

        // Display responses
        this.displayResponses();
    }

    formatConsiderPrompts(prompt) {
        if (!prompt) return '';

        // Convert bullet points to HTML list
        const lines = prompt.split('\n');
        let html = '';
        let inList = false;

        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('•') || line.startsWith('-')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${line.substring(1).trim()}</li>`;
            } else if (line) {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += `<p>${line}</p>`;
            }
        });

        if (inList) html += '</ul>';
        return html;
    }

    displayResponses() {
        const container = document.getElementById('responsesContainer');
        container.innerHTML = '';

        if (!this.data || !this.data.responses) {
            container.innerHTML = '<div class="no-results">No responses available.</div>';
            return;
        }

        const question = this.data.questions[this.currentQuestionIndex];
        const responses = this.data.responses.filter(r => {
            const answer = r.answers[this.currentQuestionIndex];
            if (!answer) return false;

            if (this.currentFilter === 'all') return true;
            if (this.currentFilter === 'Yes') return answer.answer === 'Yes';
            if (this.currentFilter === 'No') return answer.answer === 'No';
            if (this.currentFilter === "Can't Tell") return answer.answer === "Can't Tell";
            return false;
        });

        // Update response count
        document.getElementById('responseCount').textContent =
            `Showing ${responses.length} of ${this.data.responses.length} responses`;

        if (responses.length === 0) {
            container.innerHTML = '<div class="no-results">No responses match your filter criteria.</div>';
            document.getElementById('noResults').style.display = 'block';
            return;
        }

        document.getElementById('noResults').style.display = 'none';

        // Sort responses by vote count (descending)
        const sortedResponses = responses.sort((a, b) => {
            const votesA = this.votes[`${this.currentQuestionIndex}_${a.index}`] || 0;
            const votesB = this.votes[`${this.currentQuestionIndex}_${b.index}`] || 0;
            return votesB - votesA;
        });

        // Find top voted response
        const maxVotes = Math.max(...sortedResponses.map(r =>
            this.votes[`${this.currentQuestionIndex}_${r.index}`] || 0
        ));

        // Create response cards
        sortedResponses.forEach((response, index) => {
            const card = this.createResponseCard(response, index, maxVotes);
            container.appendChild(card);
        });
    }

    createResponseCard(response, index, maxVotes) {
        const answer = response.answers[this.currentQuestionIndex];
        const voteKey = `${this.currentQuestionIndex}_${response.index}`;
        const voteCount = this.votes[voteKey] || 0;
        const hasVoted = this.userVotes[voteKey];
        const isTopVoted = voteCount > 0 && voteCount === maxVotes;

        const card = document.createElement('div');
        card.className = 'response-card';
        if (isTopVoted) card.classList.add('top-voted');
        if (hasVoted) card.classList.add('user-voted');

        // Card header
        const header = document.createElement('div');
        header.className = 'card-header';

        const studentInfo = document.createElement('span');
        studentInfo.className = 'student-info';
        studentInfo.textContent = response.studentId;

        const badge = document.createElement('span');
        badge.className = `answer-badge answer-${answer.answer.toLowerCase().replace("'", '').replace(' ', '-')}`;
        badge.textContent = answer.answer;

        header.appendChild(studentInfo);
        header.appendChild(badge);

        // Explanation text
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'explanation-text';
        const explanationText = answer.explanation || 'No explanation provided';

        // Truncate if too long
        if (explanationText.length > CONFIG.MAX_EXPLANATION_LENGTH) {
            explanationDiv.textContent = explanationText.substring(0, CONFIG.MAX_EXPLANATION_LENGTH) + '...';
        } else {
            explanationDiv.textContent = explanationText;
        }

        // Card actions (voting)
        const actions = document.createElement('div');
        actions.className = 'card-actions';

        if (CONFIG.ENABLE_VOTING) {
            const voteBtn = document.createElement('button');
            voteBtn.className = 'btn btn-vote';
            if (hasVoted) {
                voteBtn.classList.add('voted');
                voteBtn.textContent = 'Voted';
            } else {
                voteBtn.textContent = '👍 Vote for this';
                voteBtn.onclick = () => this.vote(this.currentQuestionIndex, response.index);
            }

            const voteCountSpan = document.createElement('span');
            voteCountSpan.className = 'vote-count';
            voteCountSpan.textContent = voteCount > 0 ? `${voteCount} vote${voteCount !== 1 ? 's' : ''}` : 'No votes yet';

            actions.appendChild(voteBtn);
            actions.appendChild(voteCountSpan);
        }

        card.appendChild(header);
        card.appendChild(explanationDiv);
        if (CONFIG.ENABLE_VOTING) {
            card.appendChild(actions);
        }

        return card;
    }

    async vote(questionIndex, studentRowIndex) {
        // Check if already voted using localStorage
        const storageKey = `${CONFIG.STORAGE_PREFIX}q${questionIndex}_s${studentRowIndex}`;

        if (localStorage.getItem(storageKey)) {
            this.showToast('You have already voted for this response', 'info');
            return;
        }

        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'vote',
                    questionIndex: questionIndex,
                    studentRowIndex: studentRowIndex
                })
            });

            if (!response.ok) {
                throw new Error('Failed to record vote');
            }

            const result = await response.json();

            if (result.success) {
                // Store vote in localStorage
                localStorage.setItem(storageKey, new Date().toISOString());

                // Update local vote count
                const voteKey = `${questionIndex}_${studentRowIndex}`;
                this.votes[voteKey] = (this.votes[voteKey] || 0) + 1;
                this.userVotes[voteKey] = true;

                // Refresh display
                this.displayResponses();

                this.showToast('Vote recorded successfully!', 'success');
            } else {
                throw new Error(result.error || 'Failed to record vote');
            }
        } catch (error) {
            console.error('Error voting:', error);
            this.showToast('Failed to record vote. Please try again.', 'error');
        }
    }

    showStatistics() {
        if (!this.data || !this.data.responses) {
            this.showToast('No data available for statistics', 'error');
            return;
        }

        const modal = document.getElementById('statisticsModal');
        modal.style.display = 'flex';

        // Calculate statistics
        this.calculateAndDisplayStats();
    }

    calculateAndDisplayStats() {
        // Completion rate
        const totalStudents = this.data.responses.length;
        const completedResponses = this.data.responses.filter(r =>
            r.answers.filter(a => a && a.answer).length === CONFIG.TOTAL_QUESTIONS
        ).length;
        const completionRate = ((completedResponses / totalStudents) * 100).toFixed(1);

        document.getElementById('completionRate').textContent =
            `${completedResponses} of ${totalStudents} students (${completionRate}%) completed all questions`;

        // Answer distribution chart
        this.createAnswerDistributionChart();

        // Top voted responses chart
        this.createTopVotedChart();

        // Uncertainty chart
        this.createUncertaintyChart();
    }

    createAnswerDistributionChart() {
        const ctx = document.getElementById('answerChart').getContext('2d');

        // Destroy existing chart if any
        if (this.charts.answer) {
            this.charts.answer.destroy();
        }

        const question = this.data.questions[this.currentQuestionIndex];
        const answers = this.data.responses.map(r => r.answers[this.currentQuestionIndex]);

        const counts = {
            'Yes': 0,
            'No': 0,
            "Can't Tell": 0
        };

        answers.forEach(a => {
            if (a && a.answer) {
                counts[a.answer] = (counts[a.answer] || 0) + 1;
            }
        });

        this.charts.answer = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    data: Object.values(counts),
                    backgroundColor: [
                        CONFIG.CHART_COLORS.yes,
                        CONFIG.CHART_COLORS.no,
                        CONFIG.CHART_COLORS.cantTell
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: `Answer Distribution for Current Question`
                    }
                }
            }
        });
    }

    createTopVotedChart() {
        const ctx = document.getElementById('voteChart').getContext('2d');

        // Destroy existing chart if any
        if (this.charts.vote) {
            this.charts.vote.destroy();
        }

        // Get top 5 voted responses across all questions
        const allVotes = [];
        Object.entries(this.votes).forEach(([key, count]) => {
            if (count > 0) {
                const [qIndex, sIndex] = key.split('_').map(Number);
                const response = this.data.responses.find(r => r.index === sIndex);
                if (response) {
                    allVotes.push({
                        student: response.studentId,
                        question: qIndex + 1,
                        votes: count
                    });
                }
            }
        });

        if (allVotes.length === 0) {
            document.getElementById('topVotedSection').style.display = 'none';
            return;
        }

        document.getElementById('topVotedSection').style.display = 'block';

        // Sort and take top 5
        const topVotes = allVotes.sort((a, b) => b.votes - a.votes).slice(0, 5);

        this.charts.vote = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topVotes.map(v => `${v.student} (Q${v.question})`),
                datasets: [{
                    label: 'Votes',
                    data: topVotes.map(v => v.votes),
                    backgroundColor: CONFIG.CHART_COLORS.yes
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Top Voted Responses'
                    }
                }
            }
        });
    }

    createUncertaintyChart() {
        const ctx = document.getElementById('uncertaintyChart').getContext('2d');

        // Destroy existing chart if any
        if (this.charts.uncertainty) {
            this.charts.uncertainty.destroy();
        }

        // Calculate Can't Tell percentage for each question
        const uncertaintyData = [];
        this.data.questions.forEach((q, qIndex) => {
            const answers = this.data.responses.map(r => r.answers[qIndex]);
            const total = answers.filter(a => a && a.answer).length;
            const cantTell = answers.filter(a => a && a.answer === "Can't Tell").length;
            const percentage = total > 0 ? (cantTell / total * 100) : 0;

            uncertaintyData.push({
                question: `Q${qIndex + 1}`,
                percentage: percentage
            });
        });

        // Sort by percentage descending
        uncertaintyData.sort((a, b) => b.percentage - a.percentage);

        this.charts.uncertainty = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: uncertaintyData.map(d => d.question),
                datasets: [{
                    label: "Can't Tell %",
                    data: uncertaintyData.map(d => d.percentage),
                    backgroundColor: CONFIG.CHART_COLORS.cantTell
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Questions Ranked by Uncertainty'
                    }
                }
            }
        });
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            document.getElementById('questionSelector').value = this.currentQuestionIndex;
            this.displayCurrentQuestion();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < CONFIG.TOTAL_QUESTIONS - 1) {
            this.currentQuestionIndex++;
            document.getElementById('questionSelector').value = this.currentQuestionIndex;
            this.displayCurrentQuestion();
        }
    }

    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;

        if (this.autoRefresh) {
            this.startAutoRefresh();
            document.getElementById('refreshStatus').textContent = 'Auto-refresh: ON';
            this.showToast('Auto-refresh enabled', 'success');
        } else {
            this.stopAutoRefresh();
            document.getElementById('refreshStatus').textContent = 'Auto-refresh: OFF';
            this.showToast('Auto-refresh disabled', 'info');
        }
    }

    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.refreshInterval = setInterval(() => this.loadData(), CONFIG.REFRESH_INTERVAL);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
        document.getElementById('responsesContainer').style.display = show ? 'none' : 'block';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('error').style.display = 'block';
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }

    showToast(message, type = 'info') {
        // Remove any existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CASPResponseViewer();
});