/**
 * Student Search Integration
 * 
 * This script integrates the PDF student search functionality 
 * into your main project.
 */

// Configuration
const PDF_API_URL = 'http://localhost:8000'; // Change this to match your API server

class StudentPdfSearch {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || PDF_API_URL;
    this.searchContainerId = options.searchContainerId || 'pdf-student-search';
    this.resultsContainerId = options.resultsContainerId || 'pdf-search-results';
    this.detailsContainerId = options.detailsContainerId || 'pdf-student-details';
    this.onStudentSelect = options.onStudentSelect || null;
    
    this.initialized = false;
  }

  /**
   * Initialize the search component in the specified container
   */
  init() {
    // Check if containers exist
    const searchContainer = document.getElementById(this.searchContainerId);
    const resultsContainer = document.getElementById(this.resultsContainerId);
    const detailsContainer = document.getElementById(this.detailsContainerId);
    
    if (!searchContainer || !resultsContainer || !detailsContainer) {
      console.error('Student PDF Search: Required containers not found');
      return false;
    }
    
    // Create search form
    searchContainer.innerHTML = `
      <div class="pdf-search-form">
        <div class="form-group">
          <input type="text" id="pdf-student-name" class="form-control" placeholder="Enter student name...">
          <button id="pdf-search-btn" class="btn btn-primary">Search</button>
        </div>
        <div id="pdf-search-status"></div>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('pdf-search-btn').addEventListener('click', () => this.searchStudents());
    document.getElementById('pdf-student-name').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchStudents();
    });
    
    // Check API connection
    this.checkApiStatus();
    
    this.initialized = true;
    return true;
  }

  /**
   * Check the connection to the PDF API
   */
  async checkApiStatus() {
    const statusElement = document.getElementById('pdf-search-status');
    if (!statusElement) return;
    
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        statusElement.innerHTML = '<span class="status-indicator online"></span> PDF API Connected';
        return true;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error) {
      statusElement.innerHTML = '<span class="status-indicator offline"></span> PDF API Disconnected';
      console.error('PDF API connection error:', error);
      return false;
    }
  }

  /**
   * Search for students by name
   */
  async searchStudents() {
    if (!this.initialized) {
      console.error('Student PDF Search not initialized. Call init() first.');
      return;
    }
    
    const nameInput = document.getElementById('pdf-student-name');
    const resultsContainer = document.getElementById(this.resultsContainerId);
    
    if (!nameInput || !resultsContainer) return;
    
    const searchName = nameInput.value.trim();
    if (!searchName) {
      resultsContainer.innerHTML = '<div class="alert alert-warning">Please enter a name to search</div>';
      return;
    }
    
    // Show loading indicator
    resultsContainer.innerHTML = '<div class="loading-spinner"></div><p>Searching...</p>';
    
    try {
      const response = await fetch(`${this.apiUrl}/search-students/?name=${encodeURIComponent(searchName)}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      this.displaySearchResults(data);
      
    } catch (error) {
      resultsContainer.innerHTML = `
        <div class="alert alert-danger">
          Search error: ${error.message}. Make sure the API server is running at ${this.apiUrl}
        </div>
      `;
      console.error('Search error:', error);
    }
  }

  /**
   * Display search results
   */
  displaySearchResults(data) {
    const resultsContainer = document.getElementById(this.resultsContainerId);
    if (!resultsContainer) return;
    
    if (data.status !== 'success') {
      resultsContainer.innerHTML = `<div class="alert alert-danger">Error: ${data.detail || 'Unknown error'}</div>`;
      return;
    }
    
    if (data.results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="alert alert-info">
          No students found matching "${data.query}"
        </div>
      `;
      return;
    }
    
    let html = `
      <div class="search-results-header">
        <h4>Found ${data.count} student(s) matching "${data.query}"</h4>
      </div>
      <div class="search-results-list">
    `;
    
    data.results.forEach((student, index) => {
      html += `
        <div class="result-item" data-index="${index}">
          <h5>${student.name || 'Unknown Name'}</h5>
          <div class="result-details">
            ${student.student_id ? `<span>ID: ${student.student_id}</span>` : ''}
            ${student.course ? `<span>Course: ${student.course}</span>` : ''}
          </div>
          <div class="result-source">Source: ${student.source_file || 'Unknown'}</div>
        </div>
      `;
    });
    
    html += '</div>';
    resultsContainer.innerHTML = html;
    
    // Store the results data
    this.searchResults = data.results;
    
    // Add click handlers to results
    const resultItems = resultsContainer.querySelectorAll('.result-item');
    resultItems.forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.getAttribute('data-index'), 10);
        if (isNaN(index) || index >= this.searchResults.length) return;
        
        this.displayStudentDetails(this.searchResults[index]);
      });
    });
  }

  /**
   * Display detailed student information
   */
  displayStudentDetails(student) {
    const detailsContainer = document.getElementById(this.detailsContainerId);
    if (!detailsContainer) return;
    
    // Show the details container
    detailsContainer.style.display = 'block';
    
    // Call onStudentSelect callback if provided
    if (typeof this.onStudentSelect === 'function') {
      this.onStudentSelect(student);
    }
    
    // Define the order and labels for student properties
    const propertyOrder = [
      { key: 'name', label: 'Name' },
      { key: 'student_id', label: 'Student ID' },
      { key: 'dob', label: 'Date of Birth' },
      { key: 'course', label: 'Course' },
      { key: 'grade', label: 'Grade/GPA' },
      { key: 'email', label: 'Email' }
    ];
    
    let html = `
      <div class="student-details-header">
        <h3>${student.name || 'Student Details'}</h3>
        <button id="pdf-back-btn" class="btn btn-sm btn-secondary">Back to Results</button>
      </div>
      <div class="student-details-content">
        <div class="student-info-table">
    `;
    
    // Add each property to the detailed view
    propertyOrder.forEach(prop => {
      if (student[prop.key]) {
        html += `
          <div class="info-row">
            <div class="info-label">${prop.label}:</div>
            <div class="info-value">${student[prop.key]}</div>
          </div>
        `;
      }
    });
    
    // Add source information
    html += `
        </div>
        <div class="source-info">
          <div class="source-header">Source Information</div>
          <div class="info-row">
            <div class="info-label">PDF File:</div>
            <div class="info-value">${student.source_file || 'Unknown'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Extracted:</div>
            <div class="info-value">${this.formatDate(student.extraction_time)}</div>
          </div>
        </div>
      </div>
    `;
    
    detailsContainer.innerHTML = html;
    
    // Add back button handler
    document.getElementById('pdf-back-btn').addEventListener('click', () => {
      detailsContainer.style.display = 'none';
    });
  }
  
  /**
   * Format an ISO date string
   */
  formatDate(isoString) {
    if (!isoString) return 'Unknown';
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (e) {
      return isoString;
    }
  }
}

// CSS styles for the component
const addStyles = () => {
  if (document.getElementById('pdf-search-styles')) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'pdf-search-styles';
  styleElement.textContent = `
    /* PDF Student Search Styles */
    .pdf-search-form {
      margin-bottom: 20px;
    }
    .pdf-search-form .form-group {
      display: flex;
      margin-bottom: 10px;
    }
    .pdf-search-form input {
      flex-grow: 1;
      padding: 8px;
      border: 1px solid #ced4da;
      border-radius: 4px 0 0 4px;
    }
    .pdf-search-form button {
      padding: 8px 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
    }
    #pdf-search-status {
      font-size: 12px;
      margin-top: 5px;
    }
    .status-indicator {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 5px;
    }
    .status-indicator.online {
      background-color: #28a745;
    }
    .status-indicator.offline {
      background-color: #dc3545;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      margin: 20px auto;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: pdf-search-spin 1s linear infinite;
    }
    @keyframes pdf-search-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .search-results-list {
      margin-top: 15px;
    }
    .result-item {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      background-color: #fff;
    }
    .result-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .result-item h5 {
      margin: 0 0 8px 0;
      color: #007bff;
    }
    .result-details {
      margin-bottom: 5px;
    }
    .result-details span {
      margin-right: 15px;
      font-size: 14px;
    }
    .result-source {
      font-size: 12px;
      color: #6c757d;
    }
    .student-details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .student-info-table {
      margin-bottom: 20px;
    }
    .info-row {
      display: grid;
      grid-template-columns: 130px 1fr;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-label {
      font-weight: 600;
      color: #6c757d;
    }
    .source-info {
      background-color: #f8f9fa;
      border-radius: 4px;
      padding: 10px 15px;
      margin-top: 20px;
    }
    .source-header {
      font-weight: 600;
      margin-bottom: 10px;
      color: #495057;
    }
  `;
  
  document.head.appendChild(styleElement);
};

// Add the styles to the document
addStyles();

// Make it available globally
window.StudentPdfSearch = StudentPdfSearch; 