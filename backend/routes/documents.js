import express from 'express';
import { getDatabase } from '../database/connection.js';

const router = express.Router();

// Get all documents (for browsing)
router.get('/', async (req, res) => {
  try {
    const { team, docType, system, lifecycle, confidentiality, audience, limit = 50, offset = 0 } = req.query;
    
    const database = await getDatabase();
    let sql = 'SELECT * FROM documents WHERE 1=1';
    const params = [];

    // Add filters
    if (team) {
      sql += ' AND owningTeam = ?';
      params.push(team);
    }
    
    if (docType) {
      sql += ' AND docType = ?';
      params.push(docType);
    }
    
    if (system) {
      sql += ' AND system = ?';
      params.push(system);
    }
    
    if (lifecycle) {
      sql += ' AND lifecycle = ?';
      params.push(lifecycle);
    }
    
    if (confidentiality) {
      sql += ' AND confidentiality = ?';
      params.push(confidentiality);
    }
    
    if (audience) {
      sql += ' AND audience = ?';
      params.push(audience);
    }

    // Order by lifecycle and upload date
    sql += ' ORDER BY CASE WHEN lifecycle = "deprecated" THEN 1 ELSE 0 END, uploadedAt DESC';
    
    // Add pagination
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const documents = await database.all(sql, params);
    
    // Format tags
    const formattedDocuments = documents.map(doc => ({
      ...doc,
      tags: doc.tags ? doc.tags.split(',') : []
    }));

    res.json({
      documents: formattedDocuments,
      total: formattedDocuments.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents', details: error.message });
  }
});

// Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const database = await getDatabase();
    const document = await database.get('SELECT * FROM documents WHERE id = ?', id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Format tags
    document.tags = document.tags ? document.tags.split(',') : [];

    res.json({ document });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to get document', details: error.message });
  }
});

// Browse by group (team)
router.get('/browse/team/:team', async (req, res) => {
  try {
    const { team } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const database = await getDatabase();
    
    // Get documents for the team
    const documents = await database.all(`
      SELECT * FROM documents 
      WHERE owningTeam = ? 
      ORDER BY CASE WHEN lifecycle = "deprecated" THEN 1 ELSE 0 END, uploadedAt DESC
      LIMIT ? OFFSET ?
    `, [team, parseInt(limit), parseInt(offset)]);

    // Get team statistics
    const stats = await database.get(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN lifecycle = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN lifecycle = 'in-review' THEN 1 END) as inReview,
        COUNT(CASE WHEN lifecycle = 'draft' THEN 1 END) as draft,
        COUNT(CASE WHEN lifecycle = 'deprecated' THEN 1 END) as deprecated
      FROM documents 
      WHERE owningTeam = ?
    `, [team]);

    // Format documents
    const formattedDocuments = documents.map(doc => ({
      ...doc,
      tags: doc.tags ? doc.tags.split(',') : []
    }));

    res.json({
      team,
      documents: formattedDocuments,
      stats,
      total: formattedDocuments.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Browse team error:', error);
    res.status(500).json({ error: 'Failed to browse team documents', details: error.message });
  }
});

// Get folder structure (virtual folders based on metadata)
router.get('/folders/structure', async (req, res) => {
  try {
    const database = await getDatabase();
    
    // Get all unique teams
    const teams = await database.all('SELECT DISTINCT owningTeam FROM documents ORDER BY owningTeam');
    
    const folderStructure = [];
    
    for (const team of teams) {
      const teamName = team.owningTeam;
      
      // Get systems for this team
      const systems = await database.all(`
        SELECT DISTINCT system 
        FROM documents 
        WHERE owningTeam = ? AND system IS NOT NULL 
        ORDER BY system
      `, [teamName]);
      
      // Get document types for this team
      const docTypes = await database.all(`
        SELECT DISTINCT docType 
        FROM documents 
        WHERE owningTeam = ? 
        ORDER BY docType
      `, [teamName]);
      
      // Get lifecycle states for this team
      const lifecycles = await database.all(`
        SELECT DISTINCT lifecycle 
        FROM documents 
        WHERE owningTeam = ? 
        ORDER BY lifecycle
      `, [teamName]);
      
      // Get document count for this team
      const count = await database.get(`
        SELECT COUNT(*) as count 
        FROM documents 
        WHERE owningTeam = ?
      `, [teamName]);
      
      folderStructure.push({
        name: teamName,
        type: 'team',
        count: count.count,
        systems: systems.map(s => s.system),
        docTypes: docTypes.map(d => d.docType),
        lifecycles: lifecycles.map(l => l.lifecycle)
      });
    }

    res.json({ folderStructure });

  } catch (error) {
    console.error('Get folder structure error:', error);
    res.status(500).json({ error: 'Failed to get folder structure', details: error.message });
  }
});

// Get documents by folder path (e.g., /team/system/doctype)
router.get('/folders/:path(*)', async (req, res) => {
  try {
    const { path } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const pathParts = path.split('/').filter(Boolean);
    const database = await getDatabase();
    
    let sql = 'SELECT * FROM documents WHERE 1=1';
    const params = [];
    
    // Apply filters based on path parts
    if (pathParts.length >= 1) {
      sql += ' AND owningTeam = ?';
      params.push(pathParts[0]);
    }
    
    if (pathParts.length >= 2) {
      sql += ' AND system = ?';
      params.push(pathParts[1]);
    }
    
    if (pathParts.length >= 3) {
      sql += ' AND docType = ?';
      params.push(pathParts[2]);
    }
    
    // Order and paginate
    sql += ' ORDER BY CASE WHEN lifecycle = "deprecated" THEN 1 ELSE 0 END, uploadedAt DESC';
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const documents = await database.all(sql, params);
    
    // Format documents
    const formattedDocuments = documents.map(doc => ({
      ...doc,
      tags: doc.tags ? doc.tags.split(',') : []
    }));

    res.json({
      path,
      documents: formattedDocuments,
      total: formattedDocuments.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Get folder documents error:', error);
    res.status(500).json({ error: 'Failed to get folder documents', details: error.message });
  }
});

// Update document
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const database = await getDatabase();
    
    // Check if document exists
    const existing = await database.get('SELECT * FROM documents WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Build update query
    const updateFields = [];
    const updateParams = [];
    
    const allowedFields = [
      'title', 'owningTeam', 'docType', 'system', 'lifecycle', 
      'confidentiality', 'audience', 'tags', 'content'
    ];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateParams.push(updates[field]);
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Add lastReviewed timestamp
    updateFields.push('lastReviewed = ?');
    updateParams.push(new Date().toISOString().split('T')[0]);
    
    // Add document ID
    updateParams.push(id);
    
    await database.run(`
      UPDATE documents 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `, updateParams);
    
    // Get updated document
    const updatedDocument = await database.get('SELECT * FROM documents WHERE id = ?', id);
    updatedDocument.tags = updatedDocument.tags ? updatedDocument.tags.split(',') : [];
    
    res.json({
      success: true,
      document: updatedDocument
    });

  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document', details: error.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const database = await getDatabase();
    
    // Check if document exists
    const existing = await database.get('SELECT * FROM documents WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Delete from database
    await database.run('DELETE FROM documents WHERE id = ?', id);
    
    res.json({ success: true, message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document', details: error.message });
  }
});

export default router;
