# Test Setup Guide

## Quick Test Commands

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Test the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/api/health

## Test Scenarios

### 1. Search Functionality
- Type "qa files" in the search box
- Should return QA team documents
- Try "payments" - should return payment documents
- Try "runbook" - should return runbooks and SOPs

### 2. Upload Functionality
- Click "Upload" button
- Try uploading a URL (e.g., https://example.com)
- Fill in metadata and submit
- Should appear in search results

### 3. Create Document
- Click "Create" button
- Enter title: "Test.Document - Test"
- Add some content
- Fill in metadata and submit
- Should appear in search results

### 4. Browse by Group
- Click "Browse by Group" button
- Select a team (e.g., "qa")
- Should show documents for that team
- Click on a document to view it

### 5. Document Viewer
- Click on any document in search results
- Should show options to open inline or in new tab
- Test both viewing options

## Expected Behavior

- Search should work with semantic understanding
- File upload should validate metadata
- Browse should show documents organized by team
- All modals should open and close properly
- API endpoints should return proper responses

## Troubleshooting

If you encounter issues:

1. Check console for errors
2. Verify both frontend and backend are running
3. Check that the database file was created
4. Ensure all dependencies are installed

The application should work immediately after running `npm run dev`.
