# CASP Response Viewer - Classroom Discussion Tool

A web-based classroom discussion tool for displaying and comparing anonymous student CASP (Critical Appraisal Skills Programme) form responses. Optimized for projector display and interactive voting on exemplary explanations.

## Features

- **Question-by-question navigation** through 13 CASP checklist questions
- **Anonymous student responses** with consistent IDs across questions
- **Paragraph-focused layout** with compact 14px font for maximum readability
- **Voting system** to highlight exemplary critical thinking
- **Filter by answer type** (Yes/No/Can't Tell)
- **Statistics dashboard** with charts for answer distribution and voting patterns
- **Responsive design** for projectors (1920×1080) and mobile devices
- **Real-time updates** with auto-refresh capability
- **Collapsible CONSIDER prompts** from the CASP checklist

## Technology Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript (no frameworks)
- **Hosting**: GitHub Pages (free static hosting)
- **Backend**: Google Apps Script (serves JSON from Google Sheets)
- **Data Source**: Google Forms + Google Sheets
- **Charts**: Chart.js for statistics visualization

## Project Structure

```
casp-response-viewer/
├── index.html          # Main viewer interface
├── styles.css          # Styling with compact layout
├── app.js              # Application logic
├── config.js           # Configuration (API URL)
├── README.md           # This file
├── DEPLOYMENT.md       # Detailed deployment guide
├── INSTRUCTOR_GUIDE.md # Classroom usage tips
└── apps-script/
    └── Code.gs         # Google Apps Script API code
```

## Quick Start

### Prerequisites

1. Google Forms CASP checklist collecting student responses
2. Google Sheet with form responses
3. GitHub account for hosting
4. Basic familiarity with Google Apps Script

### Setup Steps (Summary)

1. **Deploy Apps Script API**
   - Open your Google Sheet with CASP responses
   - Go to Extensions → Apps Script
   - Copy code from `apps-script/Code.gs`
   - Deploy as web app (Anyone can access)
   - Copy the web app URL

2. **Configure Viewer**
   - Edit `config.js`
   - Replace `YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with your URL

3. **Deploy to GitHub Pages**
   - Create GitHub repository
   - Upload all files (except `apps-script/` folder)
   - Enable GitHub Pages in repository settings
   - Access at `https://[username].github.io/[repo-name]/`

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed step-by-step instructions.

## Usage

### For Instructors

1. **Before Class**
   - Ensure students have submitted CASP forms
   - Open viewer URL on projector
   - Verify responses are loading

2. **During Class**
   - Navigate through questions using Previous/Next buttons
   - Show CONSIDER prompts to remind students of evaluation criteria
   - Filter responses by Yes/No/Can't Tell to compare reasoning patterns
   - Encourage students to vote on exemplary explanations
   - Use statistics dashboard to identify learning gaps

3. **After Class**
   - Review voting data to identify common misconceptions
   - Note which explanation patterns students valued most
   - Use insights to improve future teaching

See **[INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md)** for detailed classroom facilitation tips.

### For Students

1. Open the viewer URL shared by instructor
2. Read through explanations for each question
3. Compare different reasoning approaches
4. Vote for explanations you find most comprehensive
5. Learn from peers' critical thinking strategies

## Configuration Options

Edit `config.js` to customize:

```javascript
const CONFIG = {
  API_URL: 'your-apps-script-url',  // Required: Your Apps Script web app URL
  REFRESH_INTERVAL: 30000,          // Auto-refresh interval (30 seconds)
  AUTO_REFRESH: true,               // Enable/disable auto-refresh
  TOTAL_QUESTIONS: 13               // Number of CASP questions
};
```

## Browser Compatibility

- **Recommended**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome for Android
- **Minimum**: Any modern browser with ES6 support

## Troubleshooting

### "Failed to load responses" error

1. Check that Apps Script URL is correct in `config.js`
2. Verify Apps Script is deployed with "Anyone" access
3. Open browser console (F12) to see detailed error
4. Test API directly by opening the Apps Script URL in browser

### No responses showing

1. Verify Google Form has been submitted by students
2. Check Google Sheet has data in "Form Responses 1" tab
3. Ensure column structure matches expected format (see DEPLOYMENT.md)

### Votes not saving

1. Verify "Votes" sheet exists in Google Sheet
2. Check Apps Script has permission to write to sheet
3. Look for errors in browser console when clicking vote button

### Page not loading on GitHub Pages

1. Wait 2-3 minutes after enabling Pages (deployment takes time)
2. Check repository is Public (required for GitHub Pages)
3. Verify Pages is enabled in Settings → Pages
4. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

## Privacy & Data Security

- **Anonymization**: Student names are replaced with "Student N" IDs
- **No personal data exposed**: Only responses visible in viewer
- **Google Sheet access**: Only instructor has access to sheet with real names
- **Voting data**: Stored in separate sheet tab, can be reviewed by instructor
- **Public hosting**: Response content is publicly visible (do not include sensitive info)

## Customization

### Changing Colors

Edit `styles.css` and modify color variables:
- Primary blue: `#4285f4`
- Green (vote button): `#34a853`
- Gold (top-voted): `#ffa500`

### Adjusting Font Sizes

For larger projector text, edit in `styles.css`:
```css
.explanation-text {
  font-size: 16px;  /* Increase from 14px */
}
```

### Modifying Questions

If your CASP form has different questions, update `apps-script/Code.gs`:
- Edit the `QUESTION_PAIRS` array
- Adjust column indexes to match your form structure

## Contributing

This is an educational tool. Suggestions for improvements:
- Open an issue for bugs or feature requests
- Share your classroom experiences and feedback
- Contribute improvements via pull requests

## License

This tool is provided for educational use. The CASP checklist is © Critical Appraisal Skills Programme (CASP). See https://casp-uk.net/ for official CASP resources.

## Credits

- **CASP Checklist**: Critical Appraisal Skills Programme (https://casp-uk.net/)
- **Charts**: Chart.js (https://www.chartjs.org/)
- **Hosting**: GitHub Pages
- **Developed for**: University College Cork - Critical Appraisal Course

## Support

For issues with:
- **This tool**: Check DEPLOYMENT.md or open a GitHub issue
- **CASP methodology**: Visit https://casp-uk.net/
- **Google Apps Script**: See https://developers.google.com/apps-script
- **GitHub Pages**: See https://docs.github.com/en/pages

## Version History

- **v1.0** (2025-11-07): Initial release
  - 13-question CASP RCT checklist support
  - Voting system with Google Sheets storage
  - Responsive design for projector and mobile
  - Statistics dashboard with Chart.js

---

**Happy Teaching!** 📚✨
