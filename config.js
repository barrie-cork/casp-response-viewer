/**
 * Configuration for CASP RCT Response Viewer
 * Update the API_URL with your Google Apps Script Web App URL
 */

const CONFIG = {
    // Google Apps Script Web App URL
    API_URL: 'https://script.google.com/macros/s/AKfycbxCKMwcaRaFcux5IQgUznn4Ar3B2AxSXnGzRsq_JwRHrHjbnyvfwpr9fUAj3NFTITUq/exec',

    // Number of questions in RCT form (13 questions)
    TOTAL_QUESTIONS: 13,

    // Auto-refresh settings
    REFRESH_INTERVAL: 30000, // 30 seconds in milliseconds
    AUTO_REFRESH: true,

    // Display settings
    MAX_EXPLANATION_LENGTH: 2000, // Maximum characters to display
    ENABLE_VOTING: true,
    ENABLE_STATISTICS: true,

    // LocalStorage keys for vote tracking
    STORAGE_PREFIX: 'casp_rct_vote_',

    // Chart colors
    CHART_COLORS: {
        yes: '#34a853',
        no: '#ea4335',
        cantTell: '#fbbc04'
    }
};

// Configuration is now set with actual API URL
