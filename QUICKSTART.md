# CASP Response Viewer - Quick Start Guide

Get up and running in 15 minutes!

## What You'll Do

1. ✅ Deploy Google Apps Script (5 min)
2. ✅ Create GitHub repository (5 min)
3. ✅ Configure and test (5 min)

## Step-by-Step

### 1. Deploy Apps Script API

```
1. Open your Google Sheet with CASP responses
2. Extensions → Apps Script
3. Delete default code
4. Copy ALL code from apps-script/Code.gs
5. Paste into editor
6. Save project (name it "CASP Viewer API")
7. Deploy → New deployment → Web app
   - Execute as: Me
   - Who has access: Anyone
8. Authorize permissions
9. COPY the web app URL (you'll need this!)
```

**Your URL looks like**: `https://script.google.com/macros/s/AKfycby.../exec`

### 2. Create GitHub Repository

```
1. Go to github.com/new
2. Name: casp-response-viewer
3. Public repository
4. Create repository
5. Upload these files (drag & drop):
   - index.html
   - styles.css
   - app.js
   - config.js
   - README.md
   - DEPLOYMENT.md
   - INSTRUCTOR_GUIDE.md
6. Commit files
```

### 3. Configure API URL

```
1. In GitHub, click config.js
2. Click pencil icon (edit)
3. Replace YOUR_APPS_SCRIPT_WEB_APP_URL_HERE with your actual URL
4. Commit changes
```

**Example**:
```javascript
API_URL: 'https://script.google.com/macros/s/AKfycby.../exec',
```

### 4. Enable GitHub Pages

```
1. Repository → Settings → Pages
2. Source: main branch, / (root)
3. Save
4. Wait 2 minutes
```

**Your site**: `https://[your-username].github.io/casp-response-viewer/`

### 5. Test It!

```
1. Open your GitHub Pages URL
2. Should see question dropdown
3. Should see student responses loading
4. Try:
   - Navigate between questions
   - Filter by Yes/No/Can't Tell
   - Vote on a response
   - Show statistics
```

## Troubleshooting

**"Failed to load responses"**
→ Check API URL in config.js is correct

**No responses showing**
→ Make sure students have submitted Google Form

**Votes not working**
→ Create "Votes" sheet in Google Sheet

## Next Steps

1. ✅ Read [INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md) for teaching tips
2. ✅ Share URL with students
3. ✅ Test in classroom before first use
4. ✅ Enjoy your interactive discussion!

## Need More Help?

- **Detailed instructions**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Teaching strategies**: [INSTRUCTOR_GUIDE.md](INSTRUCTOR_GUIDE.md)
- **Feature overview**: [README.md](README.md)

---

**Estimated time**: 15 minutes 🚀

**Difficulty**: Beginner-friendly ⭐

**Cost**: $0 (completely free!)
