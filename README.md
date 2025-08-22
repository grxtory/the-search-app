# Document Search Application

A comprehensive document search and management system with semantic search capabilities, file upload, and metadata-driven organization.

## Features

- **Semantic Search**: Intelligent search that understands ambiguous queries like "qa files"
- **File Upload**: Support for PDFs, Word documents, Markdown, and text files
- **Text Extraction**: Automatic text extraction from uploaded files
- **Metadata Management**: Structured metadata with validation
- **Browse by Group**: Virtual folder structure organized by team metadata
- **Search Suggestions**: Autocomplete and search suggestions
- **Document Management**: Create, update, and delete documents

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/api/health

## Project Structure

```
the search app/
├── package.json                 # Main project configuration
├── vite.config.js              # Frontend build configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── index.html                  # Main HTML file
├── docs-search-app.tsx         # Main React component
├── src/
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── backend/
│   ├── package.json           # Backend dependencies
│   ├── server.js              # Express server
│   ├── database/
│   │   └── connection.js      # Database setup and sample data
│   ├── routes/
│   │   ├── search.js          # Search API endpoints
│   │   ├── upload.js          # File upload endpoints
│   │   └── documents.js       # Document management
│   ├── services/
│   │   └── (future services)
│   ├── middleware/
│   │   └── (future middleware)
│   └── utils/
│       └── extractors.js      # Text extraction utilities
└── uploads/                   # File upload directory
```

## API Endpoints

### Search

- `GET /api/search?q=query` - Search documents
- `GET /api/search/suggestions?q=query` - Get search suggestions
- `GET /api/search/filters` - Get available filters

### Upload

- `POST /api/upload/file` - Upload file with metadata
- `POST /api/upload/url` - Add URL with metadata
- `POST /api/upload/create` - Create document with content

### Documents

- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID
- `GET /api/documents/browse/team/:team` - Browse by team
- `GET /api/documents/folders/structure` - Get folder structure
- `GET /api/documents/folders/:path` - Get documents by folder path
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

## Testing the Application

### Sample Data

The application comes with sample documents for testing:

1. **Payments.Refunds - Runbook** (payments team)
2. **Auth.SSO - Technical Spec** (platform team)
3. **QA.Testing - Automation Guide** (qa team)
4. **Dev.API - Documentation** (dev team)
5. **BA.Requirements - User Stories** (ba team)

### Test Queries

Try these search queries to test the semantic search:

- `qa files` - Should return QA team documents
- `payments` - Should return payment-related documents
- `runbook` - Should return runbooks and SOPs
- `testing` - Should return testing-related documents
- `api` - Should return API documentation

### File Upload Testing

1. **Upload a file:**
   - Click "Upload" button
   - Select a file (PDF, Word, Markdown, etc.)
   - Fill in required metadata
   - Submit

2. **Create a document:**
   - Click "Create" button
   - Enter title and content
   - Fill in metadata
   - Save

3. **Browse by group:**
   - Use the folder view to browse documents by team

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database

The application uses SQLite for local development. The database file is created automatically at `backend/database/documents.db`.

### File Storage

Uploaded files are stored in the `uploads/` directory with unique filenames.

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
```

### File Upload Limits

- Maximum file size: 50MB
- Supported file types: PDF, Word, Markdown, Text, CSV, JSON, XML

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the port in `backend/server.js` or kill the process using the port

2. **Database errors:**
   - Delete `backend/database/documents.db` and restart the server

3. **File upload fails:**
   - Check that the `uploads/` directory exists and is writable
   - Verify file type is supported

4. **Search not working:**
   - Check that the backend is running on port 3001
   - Verify the database has sample data

### Logs

Check the console output for both frontend and backend for error messages and debugging information.

## Next Steps

This is a working prototype. For production deployment, consider:

1. **Authentication**: Add user authentication and authorization
2. **Search Engine**: Integrate with Elasticsearch or Typesense for better search
3. **File Storage**: Use cloud storage (S3, GCS) instead of local files
4. **Database**: Use PostgreSQL or MySQL for production
5. **Security**: Add input validation, rate limiting, and security headers
6. **Monitoring**: Add logging, metrics, and error tracking
7. **Testing**: Add unit and integration tests

## License

This project is for demonstration purposes.
