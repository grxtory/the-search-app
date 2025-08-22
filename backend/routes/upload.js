import express from 'express';
import { getDatabase } from '../database/connection.js';

const router = express.Router();

// Simplified upload configuration for demo

// Upload file with metadata (simplified for demo)
router.post('/file', async (req, res) => {
  try {
    const metadata = req.body;

    // Validate required metadata
    const requiredFields = ['title', 'owningTeam', 'docType', 'confidentiality', 'audience'];
    const missingFields = requiredFields.filter(field => !metadata[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      });
    }

    // Validate title format
    const titlePattern = /^[A-Z][a-z]+\.[A-Z][a-z]+\s-\s.+$/;
    if (!titlePattern.test(metadata.title)) {
      return res.status(400).json({ 
        error: 'Title must follow format: System.Topic - Purpose' 
      });
    }

    // Save to database
    const database = await getDatabase();
    const result = await database.run(`
      INSERT INTO documents (
        title, owningTeam, owner, docType, system, lifecycle, confidentiality, 
        audience, tags, extractedText, lastReviewed, nextReview, uploadedAt, 
        source, fileSize, url, content, filePath, fileName, mimeType
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      metadata.title,
      metadata.owningTeam,
      metadata.owner || 'current.user',
      metadata.docType,
      metadata.system || null,
      metadata.lifecycle || 'draft',
      metadata.confidentiality,
      metadata.audience,
      metadata.tags || '',
      'File content would be extracted here...',
      new Date().toISOString().split('T')[0],
      ['runbook', 'SOP'].includes(metadata.docType)
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null,
      new Date().toISOString().split('T')[0],
      'file',
      '1.0 MB',
      null,
      'File content would be extracted here...',
      null,
      'demo-file.txt',
      'text/plain'
    ]);

    // Get the inserted document
    const document = await database.get('SELECT * FROM documents WHERE id = ?', result.lastID);
    
    res.json({
      success: true,
      document: {
        ...document,
        tags: document.tags ? document.tags.split(',') : []
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Upload URL with metadata
router.post('/url', async (req, res) => {
  try {
    const { url, ...metadata } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate required metadata
    const requiredFields = ['title', 'owningTeam', 'docType', 'confidentiality', 'audience'];
    const missingFields = requiredFields.filter(field => !metadata[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      });
    }

    // Validate title format
    const titlePattern = /^[A-Z][a-z]+\.[A-Z][a-z]+\s-\s.+$/;
    if (!titlePattern.test(metadata.title)) {
      return res.status(400).json({ 
        error: 'Title must follow format: System.Topic - Purpose' 
      });
    }

    // Save to database
    const database = await getDatabase();
    const result = await database.run(`
      INSERT INTO documents (
        title, owningTeam, owner, docType, system, lifecycle, confidentiality, 
        audience, tags, extractedText, lastReviewed, nextReview, uploadedAt, 
        source, fileSize, url, content, filePath, fileName, mimeType
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      metadata.title,
      metadata.owningTeam,
      metadata.owner || 'current.user',
      metadata.docType,
      metadata.system || null,
      metadata.lifecycle || 'draft',
      metadata.confidentiality,
      metadata.audience,
      metadata.tags || '',
      `Content from ${url}...`,
      new Date().toISOString().split('T')[0],
      ['runbook', 'SOP'].includes(metadata.docType)
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null,
      new Date().toISOString().split('T')[0],
      'link',
      null,
      url,
      `# ${metadata.title}\n\nContent from ${url} would be extracted here.`,
      null,
      null,
      null
    ]);

    // Get the inserted document
    const document = await database.get('SELECT * FROM documents WHERE id = ?', result.lastID);
    
    res.json({
      success: true,
      document: {
        ...document,
        tags: document.tags ? document.tags.split(',') : []
      }
    });

  } catch (error) {
    console.error('URL upload error:', error);
    res.status(500).json({ error: 'URL upload failed', details: error.message });
  }
});

// Create document with content
router.post('/create', async (req, res) => {
  try {
    const { content, ...metadata } = req.body;

    if (!content || content.length < 10) {
      return res.status(400).json({ error: 'Document content is required (minimum 10 characters)' });
    }

    // Validate required metadata
    const requiredFields = ['title', 'owningTeam', 'docType', 'confidentiality', 'audience'];
    const missingFields = requiredFields.filter(field => !metadata[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      });
    }

    // Validate title format
    const titlePattern = /^[A-Z][a-z]+\.[A-Z][a-z]+\s-\s.+$/;
    if (!titlePattern.test(metadata.title)) {
      return res.status(400).json({ 
        error: 'Title must follow format: System.Topic - Purpose' 
      });
    }

    // Save to database
    const database = await getDatabase();
    const result = await database.run(`
      INSERT INTO documents (
        title, owningTeam, owner, docType, system, lifecycle, confidentiality, 
        audience, tags, extractedText, lastReviewed, nextReview, uploadedAt, 
        source, fileSize, url, content, filePath, fileName, mimeType
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      metadata.title,
      metadata.owningTeam,
      metadata.owner || 'current.user',
      metadata.docType,
      metadata.system || null,
      metadata.lifecycle || 'draft',
      metadata.confidentiality,
      metadata.audience,
      metadata.tags || '',
      content.substring(0, 150) + '...',
      new Date().toISOString().split('T')[0],
      ['runbook', 'SOP'].includes(metadata.docType)
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null,
      new Date().toISOString().split('T')[0],
      'created',
      null,
      null,
      content,
      null,
      null,
      'text/markdown'
    ]);

    // Get the inserted document
    const document = await database.get('SELECT * FROM documents WHERE id = ?', result.lastID);
    
    res.json({
      success: true,
      document: {
        ...document,
        tags: document.tags ? document.tags.split(',') : []
      }
    });

  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Document creation failed', details: error.message });
  }
});

export default router;
