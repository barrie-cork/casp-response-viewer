# CASP RCT Votes Recovery Guide

## Setup Instructions for Existing Votes

### Step 1: Create Votes Sheet in Google Sheets

1. Open your Google Sheet with RCT form responses
2. Add a new sheet tab named **"Votes"** (exactly, case-sensitive)
3. Add these headers in row 1:
   - **A1:** Timestamp
   - **B1:** QuestionIndex
   - **C1:** StudentRowIndex
4. Bold the header row (select row 1, then Ctrl+B or Cmd+B)

### Step 2: Import Existing Votes

Since there are already 7 votes in the system (visible in the API response), you need to add them manually to the Votes sheet:

Based on the API data, add these rows to the Votes sheet (starting from row 2):

| Timestamp | QuestionIndex | StudentRowIndex |
|-----------|---------------|-----------------|
| [Any date] | 0 | 0 | (Student 1, Q1 - 2 votes, add 2 rows)
| [Any date] | 0 | 0 |
| [Any date] | 0 | 4 | (Student 5, Q1 - 1 vote)
| [Any date] | 1 | 3 | (Student 4, Q2 - 1 vote)
| [Any date] | 3 | 3 | (Student 4, Q4 - 1 vote)
| [Any date] | 3 | 4 | (Student 5, Q4 - 1 vote)
| [Any date] | 6 | 4 | (Student 5, Q7 - 1 vote)

**Note:**
- QuestionIndex is 0-based (Q1 = 0, Q2 = 1, etc.)
- StudentRowIndex is the row number in the responses minus 2 (Student 1 = row 0)
- The Timestamp can be any valid date/time

### Step 3: Update the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Replace the entire Code.gs content with the updated version from `apps-script/Code.gs`
3. Key changes in the updated version:
   - Added `doPost` function for handling vote submissions
   - Added `getVotesFormatted` function for retrieving votes
   - Votes will now be properly saved and retrieved

4. Save the script (Ctrl+S or Cmd+S)
5. Click **Deploy → Manage deployments**
6. Click the pencil icon to edit
7. Under **Version**, select **New version**
8. Add description: "Added POST support for voting"
9. Click **Deploy**
10. The Web App URL stays the same

### Step 4: Verify Votes Display

1. Open the RCT viewer webpage
2. You should now see:
   - Vote counts displayed on responses
   - "✓ Voted" on responses you've already voted for (if stored in localStorage)
   - The existing 7 votes should be visible

### Step 5: Test New Voting

1. Click "Vote for this" on any response
2. The vote should:
   - Save to the Votes sheet
   - Update the count immediately
   - Prevent duplicate voting (one vote per person per response)

## Troubleshooting

### Votes Not Showing

1. Check the Votes sheet exists and has correct headers
2. Verify the vote data format matches the example above
3. Check browser console for errors (F12)
4. Try clearing browser cache and localStorage

### Cannot Submit New Votes

1. Ensure Apps Script is updated with doPost function
2. Verify deployment is set to "Anyone" can access
3. Check that Web App executes as "Me" (your account)
4. Re-deploy if necessary (create new version)

### Vote Counts Incorrect

1. Check for duplicate entries in Votes sheet
2. Verify QuestionIndex and StudentRowIndex are correct
3. The system aggregates multiple votes for same question/student combination

## How the Voting System Works

1. **Initial Load**:
   - Fetches responses with embedded vote counts from API
   - Transforms nested structure to flat structure
   - Extracts vote counts during transformation

2. **Vote Submission**:
   - POST request to Apps Script with question and student indices
   - Apps Script adds entry to Votes sheet
   - Returns success/failure status

3. **Vote Display**:
   - Shows total vote count for each response
   - Highlights top-voted response with gold border
   - Shows green border on user's voted responses

4. **Vote Prevention**:
   - Uses localStorage to track user's votes locally
   - Key format: `casp_rct_vote_q{questionIndex}_s{studentRowIndex}`
   - Prevents duplicate votes from same browser

## Current Vote Status

As of the last check, these votes exist in the system:
- Question 1: Student 1 (2 votes), Student 5 (1 vote)
- Question 2: Student 4 (1 vote)
- Question 4: Student 4 (1 vote), Student 5 (1 vote)
- Question 7: Student 5 (1 vote)

Total: 7 votes across 6 different responses