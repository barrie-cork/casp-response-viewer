# CASP Response Viewer - Deployment Guide

Complete step-by-step instructions for deploying the CASP Response Viewer. Follow these steps carefully for successful setup.

## Prerequisites

Before you begin, ensure you have:

- [ ] Google account with access to Forms, Sheets, and Apps Script
- [ ] CASP Google Form created and collecting responses
- [ ] GitHub account (create free at https://github.com/join)
- [ ] Basic text editor (VS Code, Sublime, or even Notepad)
- [ ] Web browser (Chrome, Firefox, Safari, or Edge)

## Deployment Overview

```
┌─────────────────────┐
│  Google Form        │
│  (Student Input)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Google Sheets      │
│  (Form Responses)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Apps Script API    │
│  (JSON Endpoint)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  GitHub Pages       │
│  (Web Viewer)       │
└─────────────────────┘
```

**Estimated Setup Time**: 30-45 minutes (first time)

## Part 1: Google Apps Script Setup

### Step 1.1: Access Your Google Sheet

1. Open your Google Form that collects CASP responses
2. Click **Responses** tab at the top
3. Click the green **Google Sheets icon** to open linked spreadsheet
4. You should see a sheet named "Form Responses 1" with student submissions

**Verify**: You should see columns like:
- Column A: Timestamp
- Column B: Email/Name
- Column C: Paper Title
- Column D: Author
- Column E: DOI/URL
- Column F: Date
- Column G onwards: CASP questions and explanations

### Step 1.2: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** menu
2. Select **Apps Script**
3. A new tab opens with Apps Script editor
4. You'll see a file called `Code.gs` with some default code

**Troubleshooting**: If "Apps Script" is grayed out, your Google account may not have permission. Contact your IT administrator.

### Step 1.3: Copy Apps Script Code

1. In the Apps Script editor, **select all default code** (Ctrl+A or Cmd+A)
2. **Delete it**
3. Open the file `apps-script/Code.gs` from this repository
4. **Copy all the code** from that file
5. **Paste** into the Apps Script editor
6. Click **Save** (disk icon or Ctrl+S)
7. Give your project a name (e.g., "CASP Response Viewer API")

**Verify**: You should see functions like `doGet()`, `getResponses()`, `getVotes()`, `recordVote()`

### Step 1.4: Deploy Apps Script as Web App

1. In Apps Script editor, click **Deploy** button (top right)
2. Select **New deployment**
3. Click the gear icon next to "Select type"
4. Choose **Web app**
5. Fill in deployment settings:
   - **Description**: "CASP Response Viewer API v1"
   - **Execute as**: Me (your email)
   - **Who has access**: **Anyone** (important!)
6. Click **Deploy**

### Step 1.5: Authorize Apps Script

1. A dialog appears: "This app isn't verified"
2. Click **Advanced**
3. Click **Go to [Project Name] (unsafe)**
   - Don't worry - this is YOUR script, it's safe
4. Review permissions requested:
   - See, edit, create, and delete your spreadsheets
5. Click **Allow**

**Security Note**: You're granting your own script access to your own spreadsheet. This is necessary for the API to read responses.

### Step 1.6: Copy Web App URL

1. After authorization, you'll see "Deployment successfully created"
2. **Copy the Web app URL** (looks like: `https://script.google.com/macros/s/AKfycby.../exec`)
3. Save this URL - you'll need it in Part 2
4. Click **Done**

**Test Your API**:
1. Paste the Web app URL into a new browser tab
2. Add `?action=getResponses` to the end
3. You should see JSON data with your questions and responses
4. If you see `{"error": "..."}`, check that your sheet is named "Form Responses 1"

### Step 1.7: Create Votes Sheet (Optional but Recommended)

1. Go back to your Google Sheet
2. At the bottom, click the **+** to add a new sheet
3. Rename it to exactly **"Votes"** (case-sensitive)
4. Add headers in the first row:
   - A1: `Timestamp`
   - B1: `QuestionIndex`
   - C1: `StudentRowIndex`
5. Leave the rest empty - votes will be recorded here automatically

**Why**: This separates voting data from form responses, preventing accidental modifications.

## Part 2: GitHub Repository Setup

### Step 2.1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `casp-response-viewer` (or your choice)
3. Description: "Classroom tool for viewing anonymous CASP form responses"
4. Select **Public** (required for free GitHub Pages)
5. Check **Add a README file** (optional)
6. Click **Create repository**

**Note**: If you want a private repository, you'll need GitHub Pro (free for students via GitHub Education Pack).

### Step 2.2: Upload Files to Repository

**Option A: Web Upload (Easier)**

1. In your GitHub repository, click **Add file** → **Upload files**
2. Drag and drop these files from your computer:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `config.js`
   - `README.md`
   - `DEPLOYMENT.md` (this file)
   - `INSTRUCTOR_GUIDE.md`
3. **DO NOT upload** the `apps-script/` folder (that code is in Google Apps Script, not GitHub)
4. Scroll down, add commit message: "Initial commit - CASP viewer files"
5. Click **Commit changes**

**Option B: Git Command Line (Advanced)**

```bash
# Navigate to your local project directory
cd /path/to/casp-response-viewer

# Initialize git (if not already done)
git init

# Add all files except apps-script folder
git add index.html styles.css app.js config.js README.md DEPLOYMENT.md INSTRUCTOR_GUIDE.md

# Commit
git commit -m "Initial commit - CASP viewer files"

# Add remote
git remote add origin https://github.com/[YOUR-USERNAME]/casp-response-viewer.git

# Push to GitHub
git push -u origin main
```

### Step 2.3: Configure API URL

1. In your GitHub repository, click on **`config.js`**
2. Click the **pencil icon** (Edit file)
3. Find the line: `API_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE',`
4. Replace `'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'` with the Web app URL you copied in Step 1.6
5. Example:
   ```javascript
   API_URL: 'https://script.google.com/macros/s/AKfycby.../exec',
   ```
6. Scroll down, commit message: "Configure Apps Script URL"
7. Click **Commit changes**

**Critical**: Make sure the URL is in quotes and ends with `/exec`

### Step 2.4: Enable GitHub Pages

1. In your repository, click **Settings** tab
2. Scroll down to **Pages** section (left sidebar)
3. Under **Source**, select:
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **Save**
5. Wait 1-2 minutes for deployment
6. Refresh the page - you should see a banner: "Your site is published at https://[username].github.io/casp-response-viewer/"

**Troubleshooting**:
- If "Pages" is not visible, ensure repository is Public
- If deployment fails, check that all files are in root directory (not in subfolder)
- Allow up to 5 minutes for first deployment

### Step 2.5: Test the Viewer

1. Open the GitHub Pages URL: `https://[username].github.io/casp-response-viewer/`
2. You should see:
   - Header: "CASP Response Viewer"
   - Question dropdown populated with 13 questions
   - Explanation cards loading (if you have responses)
3. Test features:
   - Navigate between questions (Previous/Next)
   - Show CONSIDER prompts
   - Filter by Yes/No/Can't Tell
   - Vote on a response
   - Show statistics

**If you see errors**:
- "Failed to load responses": Check API URL in config.js
- "Loading..." forever: Open browser console (F12) to see detailed error
- No responses showing: Verify students have submitted Google Form

## Part 3: Sharing with Students

### Step 3.1: Create Shareable Link

Your viewer URL: `https://[username].github.io/casp-response-viewer/`

**Shorten it** (optional but recommended):
1. Go to https://tinyurl.com/ or https://bit.ly/
2. Paste your full GitHub Pages URL
3. Create custom short link (e.g., `bit.ly/ucc-casp-viewer`)

### Step 3.2: Create QR Code

1. Go to https://www.qr-code-generator.com/
2. Enter your viewer URL
3. Download QR code image
4. Display in classroom or include in slides

### Step 3.3: Share with Class

**Example email to students**:

```
Subject: CASP Response Viewer - Access Link

Dear Students,

For our discussion session on [DATE], we'll be using the CASP Response Viewer
to compare and learn from each other's critical appraisals.

Access the viewer here: [YOUR-URL]

OR scan this QR code: [ATTACH QR CODE]

You can access this on any device (laptop, tablet, phone). During class,
we'll review responses together and you'll be able to vote on exemplary
explanations.

Make sure you've completed your CASP form by [DEADLINE].

See you in class!
```

## Part 4: Testing and Validation

### Test Checklist

Before using in class, verify:

#### Data Loading
- [ ] Viewer loads without errors
- [ ] All 13 questions appear in dropdown
- [ ] Student responses display correctly
- [ ] "Last updated" time shows recent timestamp
- [ ] Student IDs are consistent across questions (Student 1 is same person in all questions)

#### Navigation
- [ ] Previous button disabled on Question 1
- [ ] Next button disabled on Question 13
- [ ] Dropdown navigation works
- [ ] Question title updates when navigating

#### Filtering
- [ ] "Show All" shows all responses
- [ ] Filter by "Yes" shows only Yes responses
- [ ] Filter by "No" shows only No responses
- [ ] Filter by "Can't Tell" shows only Can't Tell responses
- [ ] Filter counts are accurate

#### Voting
- [ ] Vote button clicks record successfully
- [ ] Vote count increases after voting
- [ ] Votes persist after page refresh
- [ ] Top-voted cards highlighted in gold
- [ ] Votes appear in Google Sheet "Votes" tab

#### CONSIDER Prompts
- [ ] Toggle button shows/hides prompts
- [ ] Prompts display correctly for each question
- [ ] Button text changes (Show/Hide)

#### Statistics
- [ ] Toggle button shows/hides dashboard
- [ ] Answer distribution chart displays
- [ ] Voting chart displays top responses
- [ ] Charts update when changing questions

#### Responsive Design
- [ ] Looks good on projector (1920×1080)
- [ ] Readable on laptop (1366×768)
- [ ] Works on mobile phone (test with your phone)
- [ ] Text is readable from back of classroom

### Common Issues and Fixes

#### Issue: "Failed to load responses"

**Diagnosis**:
1. Open browser console (F12)
2. Look for error message

**Possible causes**:
- Wrong API URL in config.js → Fix: Update config.js with correct URL
- Apps Script not deployed → Fix: Redeploy from Apps Script editor
- Apps Script not set to "Anyone" access → Fix: Change deployment settings

#### Issue: Responses show as "Student 1, Student 1, Student 1..." (all same)

**Cause**: Only one response in Google Sheet

**Fix**: Get more students to submit form, or add test data manually

#### Issue: "Votes" not saving

**Diagnosis**:
1. Click vote button
2. Open Google Sheet → "Votes" tab
3. Check if new row appeared

**Possible causes**:
- Votes sheet doesn't exist → Fix: Create sheet named exactly "Votes"
- Apps Script needs reauthorization → Fix: Redeploy Apps Script

#### Issue: GitHub Pages not updating after changes

**Fix**:
1. Wait 2-3 minutes (deployment takes time)
2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache
4. Check GitHub Actions tab for build status

## Part 5: Maintenance and Updates

### Updating the Viewer

If you want to change styling or functionality:

1. Edit the file locally on your computer
2. Go to GitHub repository → file you want to update
3. Click pencil icon (Edit)
4. Paste updated content
5. Commit changes
6. Wait 1-2 minutes for GitHub Pages to redeploy

### Updating Apps Script

If you need to modify the API:

1. Go to Apps Script editor
2. Make changes
3. Click **Save**
4. Go to **Deploy** → **Manage deployments**
5. Click pencil icon next to active deployment
6. Version: **New version**
7. Click **Deploy**

**Note**: You don't need to update the URL in config.js - it stays the same

### Archiving Old Responses

After semester ends:

1. **Make a copy** of Google Sheet: File → Make a copy
2. Rename copy: "CASP Responses - Spring 2024 [ARCHIVED]"
3. Clear "Form Responses 1" in original sheet for new semester
4. Original viewer URL will now show new semester's data

### Multiple Classes

If teaching multiple sections:

**Option 1: Separate Form & Viewer per Section**
- Create separate Google Form for each section
- Deploy separate Apps Script for each
- Create separate GitHub repository for each
- Pro: Complete isolation
- Con: More maintenance

**Option 2: One Form, Filter by Section**
- Add "Section" field to Google Form
- Modify Apps Script to filter by section
- Add section selector to viewer UI
- Pro: Centralized management
- Con: Requires code customization

## Part 6: Privacy and Security

### Data Privacy Checklist

- [ ] Students are anonymized as "Student N" in viewer
- [ ] Google Sheet with real names is NOT shared publicly
- [ ] Only instructor has edit access to Google Sheet
- [ ] Voting data cannot be linked back to individual voters
- [ ] Repository is Public (required for GitHub Pages)

### Security Best Practices

1. **Do not commit real student names** to GitHub
2. **Do not include** Google Sheet URLs in public code
3. **Remind students** that their responses will be viewed anonymously in class
4. **Keep Apps Script URL public** but obscured (don't post on social media)
5. **Limit edit access** to Google Sheet to instructor only

### GDPR/Privacy Compliance

If in EU or handling EU students:

1. Add to course syllabus: "Anonymized responses may be viewed in class"
2. Get consent via Google Form: "I consent to my anonymized responses being used for classroom discussion"
3. Provide opt-out: Students can request their responses be excluded
4. Delete data after semester ends (or archive without student identifiers)

## Part 7: Advanced Customization

### Changing Number of Questions

If your CASP form has different number of questions:

1. Edit `apps-script/Code.gs`
2. Modify `QUESTION_PAIRS` array:
   ```javascript
   const QUESTION_PAIRS = [
     [6, 7, "Question 1 text", ["prompt1", "prompt2"]],
     [8, 9, "Question 2 text", ["prompt1", "prompt2"]],
     // Add or remove as needed
   ];
   ```
3. Update column indexes to match your form structure
4. Save and redeploy Apps Script

### Custom Styling

Edit `styles.css`:

**Larger font for projector**:
```css
.explanation-text {
  font-size: 18px; /* Increase from 14px */
}
```

**Different color scheme**:
```css
/* Change primary color from blue to purple */
.btn-refresh,
.btn-nav,
.btn-filter.active {
  background: #9c27b0; /* Purple instead of #4285f4 */
}
```

**Adjust card layout**:
```css
.cards-grid {
  gap: 12px; /* Increase from 8px for more spacing */
}
```

### Adding Features

Want to add new features? Common requests:

**Search/filter by keyword**:
- Add input field to HTML
- Filter cards based on text content in JavaScript

**Export to PDF**:
- Use browser print functionality (Ctrl+P)
- Or integrate a library like jsPDF

**Download responses as CSV**:
- Add export function in Apps Script
- Provide download button in viewer

## Support and Troubleshooting

### Getting Help

1. **Check console**: Open browser dev tools (F12) → Console tab
2. **Read error messages**: They usually indicate the problem
3. **Test API directly**: Open Apps Script URL in browser with `?action=getResponses`
4. **Review this guide**: Search for your issue in Common Issues section

### Reporting Issues

If you find a bug:

1. Open browser console (F12)
2. Copy error message
3. Take screenshot of issue
4. Create GitHub issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages
   - Browser/device info

### Resources

- **Apps Script Docs**: https://developers.google.com/apps-script
- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **Chart.js Docs**: https://www.chartjs.org/docs/
- **JavaScript Reference**: https://developer.mozilla.org/en-US/docs/Web/JavaScript

---

## Quick Reference: Commands and URLs

### Important URLs

```
Apps Script Editor:
https://script.google.com/home/projects/[PROJECT-ID]/edit

Apps Script Web App URL:
https://script.google.com/macros/s/[DEPLOYMENT-ID]/exec

GitHub Repository:
https://github.com/[USERNAME]/casp-response-viewer

GitHub Pages Site:
https://[USERNAME].github.io/casp-response-viewer/

Test API:
[APPS-SCRIPT-URL]?action=getResponses
```

### File Locations

```
Google Sheet: Extensions → Apps Script
GitHub: Repository root directory
Local: /Users/[you]/Documents/casp-response-viewer/
```

---

**Congratulations!** 🎉 You've successfully deployed the CASP Response Viewer. Now you're ready to facilitate engaging classroom discussions about critical appraisal.

Next steps:
1. Read [INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md) for teaching strategies
2. Test with sample data before first classroom use
3. Share URL with students
4. Enjoy your interactive discussion session!

Questions? Check the README.md or create an issue on GitHub.
