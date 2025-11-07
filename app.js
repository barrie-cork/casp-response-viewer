/**
 * CASP Response Viewer - Main Application
 *
 * This application loads CASP form responses from Google Sheets via Apps Script API,
 * displays them in a classroom-friendly interface, and enables voting on exemplary explanations.
 */

const app = {
  data: null,
  currentQuestionIndex: 0,
  currentFilter: 'all',
  refreshInterval: null,
  charts: {
    answer: null,
    voting: null
  },

  /**
   * Initialize application
   */
  init() {
    console.log('Initializing CASP Response Viewer...');

    // Check configuration
    if (CONFIG.API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      this.showError('Please configure your Apps Script URL in config.js');
      return;
    }

    // Load initial data
    this.loadData();

    // Set up auto-refresh if enabled
    if (CONFIG.AUTO_REFRESH) {
      this.refreshInterval = setInterval(() => this.loadData(), CONFIG.REFRESH_INTERVAL);
    }
  },

  /**
   * Load data from Apps Script API
   */
  async loadData() {
    try {
      console.log('Fetching data from API...');
      const response = await fetch(`${CONFIG.API_URL}?action=getResponses`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.data = await response.json();
      console.log('Data loaded:', this.data);

      // Check for API errors
      if (this.data.error) {
        throw new Error(this.data.error);
      }

      // Update UI
      this.populateQuestionSelector();
      this.loadQuestion(this.currentQuestionIndex);
      this.updateLastRefreshTime();

    } catch (error) {
      console.error('Error loading data:', error);
      this.showError(`Failed to load responses: ${error.message}. Please check your API URL in config.js and ensure the Apps Script is deployed correctly.`);
    }
  },

  /**
   * Populate question dropdown selector
   */
  populateQuestionSelector() {
    const select = document.getElementById('questionSelect');
    select.innerHTML = '';

    this.data.questions.forEach((q, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = q.questionText;
      select.appendChild(option);
    });
  },

  /**
   * Load and display specific question
   */
  loadQuestion(index) {
    this.currentQuestionIndex = parseInt(index);

    if (!this.data || !this.data.questions || !this.data.questions[this.currentQuestionIndex]) {
      console.error('Invalid question index:', index);
      return;
    }

    const question = this.data.questions[this.currentQuestionIndex];
    console.log('Loading question:', this.currentQuestionIndex, question.questionText);

    // Update question title
    document.getElementById('questionTitle').textContent = question.questionText;

    // Update CONSIDER prompts
    this.updateConsiderPrompts(question.considerPrompts);

    // Update question selector
    document.getElementById('questionSelect').value = index;

    // Update navigation buttons
    this.updateNavigationState();

    // Display responses
    this.displayResponses(question.responses);

    // Update filter counts
    this.updateFilterCounts(question.responses);

    // Apply current filter
    this.filterByAnswer(this.currentFilter);
  },

  /**
   * Update CONSIDER prompts for current question
   */
  updateConsiderPrompts(prompts) {
    const content = document.getElementById('considerContent');
    content.innerHTML = `
      <strong>CONSIDER:</strong>
      <ul>
        ${prompts.map(prompt => `<li>${this.escapeHtml(prompt)}</li>`).join('')}
      </ul>
    `;
  },

  /**
   * Toggle CONSIDER prompts visibility
   */
  toggleConsider() {
    const content = document.getElementById('considerContent');
    const button = document.getElementById('considerBtn');

    if (content.classList.contains('show')) {
      content.classList.remove('show');
      button.textContent = '📋 Show CONSIDER Prompts';
    } else {
      content.classList.add('show');
      button.textContent = '📋 Hide CONSIDER Prompts';
    }
  },

  /**
   * Display response cards
   */
  displayResponses(responses) {
    const grid = document.getElementById('cardsGrid');
    grid.innerHTML = '';

    if (!responses || responses.length === 0) {
      grid.innerHTML = '<p class="no-responses">No responses yet for this question.</p>';
      return;
    }

    // Sort by votes (descending)
    const sorted = [...responses].sort((a, b) => b.votes - a.votes);
    const maxVotes = sorted[0].votes;

    sorted.forEach(response => {
      const card = this.createExplanationCard(response, maxVotes);
      grid.appendChild(card);
    });

    console.log(`Displayed ${sorted.length} responses`);
  },

  /**
   * Create explanation card element
   */
  createExplanationCard(response, maxVotes) {
    const card = document.createElement('div');
    card.className = 'explanation-card';
    card.dataset.answer = this.normalizeAnswer(response.answer);

    // Highlight top-voted (if votes > 0)
    if (response.votes > 0 && response.votes === maxVotes) {
      card.classList.add('top-voted');
    }

    // Card header (student ID + answer badge)
    const header = document.createElement('div');
    header.className = 'card-header';
    header.innerHTML = `
      <span class="student-id">${this.escapeHtml(response.studentId)}</span>
      <span class="answer-badge answer-${this.normalizeAnswer(response.answer)}">
        ${this.escapeHtml(response.answer)}
      </span>
    `;

    // Explanation text
    const explanation = document.createElement('div');
    explanation.className = 'explanation-text';
    if (response.explanation === '(No explanation provided)') {
      explanation.classList.add('empty');
    }
    explanation.textContent = response.explanation;

    // Card footer (votes + vote button)
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    footer.innerHTML = `
      <span class="vote-count">👍 ${response.votes}</span>
      <button class="btn-vote" onclick="app.vote(${this.currentQuestionIndex}, ${response.rowIndex})">
        Vote for this
      </button>
    `;

    card.appendChild(header);
    card.appendChild(explanation);
    card.appendChild(footer);

    return card;
  },

  /**
   * Filter responses by answer
   */
  filterByAnswer(filter) {
    this.currentFilter = filter;

    // Update filter button states
    document.querySelectorAll('.btn-filter').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      }
    });

    // Show/hide cards
    document.querySelectorAll('.explanation-card').forEach(card => {
      if (filter === 'all' || card.dataset.answer === filter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  },

  /**
   * Update filter counts
   */
  updateFilterCounts(responses) {
    const counts = {
      all: responses.length,
      yes: responses.filter(r => this.normalizeAnswer(r.answer) === 'yes').length,
      no: responses.filter(r => this.normalizeAnswer(r.answer) === 'no').length,
      'cant-tell': responses.filter(r => this.normalizeAnswer(r.answer) === 'cant-tell').length
    };

    document.getElementById('countAll').textContent = counts.all;
    document.getElementById('countYes').textContent = counts.yes;
    document.getElementById('countNo').textContent = counts.no;
    document.getElementById('countCantTell').textContent = counts['cant-tell'];
  },

  /**
   * Record a vote
   */
  async vote(questionIndex, studentRowIndex) {
    try {
      console.log(`Recording vote: Question ${questionIndex}, Student row ${studentRowIndex}`);

      const url = `${CONFIG.API_URL}?action=recordVote&questionIndex=${questionIndex}&studentRowIndex=${studentRowIndex}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Vote failed');
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      console.log('Vote recorded successfully');

      // Refresh to show updated votes
      await this.loadData();

    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to record vote. Please try again.');
    }
  },

  /**
   * Navigation functions
   */
  nextQuestion() {
    if (this.currentQuestionIndex < this.data.questions.length - 1) {
      this.loadQuestion(this.currentQuestionIndex + 1);
    }
  },

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.loadQuestion(this.currentQuestionIndex - 1);
    }
  },

  updateNavigationState() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = this.currentQuestionIndex === 0;
    nextBtn.disabled = this.currentQuestionIndex === this.data.questions.length - 1;
  },

  /**
   * Statistics functions
   */
  toggleStatistics() {
    const content = document.getElementById('statisticsContent');
    const button = document.getElementById('statsBtn');
    const isVisible = content.style.display !== 'none';

    content.style.display = isVisible ? 'none' : 'block';
    button.textContent = isVisible ? '📊 Show Statistics' : '📊 Hide Statistics';

    if (!isVisible) {
      this.drawCharts();
    }
  },

  drawCharts() {
    if (!this.data || !this.data.questions[this.currentQuestionIndex]) {
      return;
    }

    const question = this.data.questions[this.currentQuestionIndex];

    // Destroy existing charts
    if (this.charts.answer) {
      this.charts.answer.destroy();
    }
    if (this.charts.voting) {
      this.charts.voting.destroy();
    }

    // Answer distribution pie chart
    const answers = question.responses.reduce((acc, r) => {
      const answer = r.answer || 'No Answer';
      acc[answer] = (acc[answer] || 0) + 1;
      return acc;
    }, {});

    const ctx1 = document.getElementById('answerChart').getContext('2d');
    this.charts.answer = new Chart(ctx1, {
      type: 'pie',
      data: {
        labels: Object.keys(answers),
        datasets: [{
          data: Object.values(answers),
          backgroundColor: ['#4285f4', '#ea4335', '#fbbc04', '#34a853']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: {
            display: true,
            text: 'Answer Distribution for Current Question'
          }
        }
      }
    });

    // Top voted responses bar chart
    const topVoted = [...question.responses]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5)
      .filter(r => r.votes > 0);

    if (topVoted.length > 0) {
      const ctx2 = document.getElementById('votingChart').getContext('2d');
      this.charts.voting = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: topVoted.map(r => r.studentId),
          datasets: [{
            label: 'Votes',
            data: topVoted.map(r => r.votes),
            backgroundColor: '#4285f4'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y',
          plugins: {
            title: {
              display: true,
              text: 'Top 5 Most Voted Responses'
            }
          }
        }
      });
    } else {
      document.getElementById('votingChart').getContext('2d').clearRect(0, 0, 500, 300);
    }
  },

  /**
   * Utility functions
   */
  normalizeAnswer(answer) {
    if (!answer) return 'no-answer';
    return answer.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  updateLastRefreshTime() {
    const time = new Date().toLocaleTimeString();
    document.getElementById('updateTime').textContent = `Last updated: ${time}`;
  },

  showError(message) {
    const grid = document.getElementById('cardsGrid');
    grid.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  app.init();
});
