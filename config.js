/**
 * CASP Response Viewer - Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Deploy your Apps Script as a web app (see apps-script/Code.gs for instructions)
 * 2. Copy the web app URL from the deployment
 * 3. Replace 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE' below with your actual URL
 * 4. The URL should look like: https://script.google.com/macros/s/[ID]/exec
 */

const CONFIG = {
  // Replace with your Apps Script web app URL
  API_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE',

  // Auto-refresh interval in milliseconds (30 seconds)
  REFRESH_INTERVAL: 30000,

  // Enable automatic data refresh
  AUTO_REFRESH: true,

  // Number of questions in the CASP checklist
  TOTAL_QUESTIONS: 13
};
