import express from 'express';
import { getDatabase } from '../database/connection.js';

const router = express.Router();

// Search documents with semantic understanding
router.get('/', async (req, res) => {
  try {
    const { q: query, team, docType, system, lifecycle, confidentiality, audience } = req.query;
    
    if (!query && !team && !docType && !system && !lifecycle && !confidentiality && !audience) {
      return res.json({ results: [], total: 0 });
    }

    const database = await getDatabase();
    let sql = 'SELECT * FROM documents WHERE 1=1';
    const params = [];

    // Handle search query with semantic understanding
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      const conditions = [];
      
      for (const term of searchTerms) {
        // Handle ambiguous queries like "qa files"
        if (term === 'qa' || term === 'quality' || term === 'assurance') {
          conditions.push('(owningTeam = ? OR tags LIKE ? OR title LIKE ? OR extractedText LIKE ?)');
          params.push('qa', `%${term}%`, `%${term}%`, `%${term}%`);
        } else if (term === 'files' || term === 'docs' || term === 'documents') {
          // This is a general term, search in content
          conditions.push('(title LIKE ? OR extractedText LIKE ? OR tags LIKE ?)');
          params.push(`%${term}%`, `%${term}%`, `%${term}%`);
        } else {
          // Regular search term
          conditions.push('(title LIKE ? OR extractedText LIKE ? OR tags LIKE ? OR owningTeam LIKE ? OR docType LIKE ? OR system LIKE ?)');
          params.push(`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`);
        }
      }
      
      if (conditions.length > 0) {
        sql += ` AND (${conditions.join(' OR ')})`;
      }
    }

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

    // Order by relevance and lifecycle
    sql += ' ORDER BY CASE WHEN lifecycle = "deprecated" THEN 1 ELSE 0 END, title ASC';

    const results = await database.all(sql, params);
    
    // Calculate search scores for ranking
    const scoredResults = results.map(doc => {
      let score = 0;
      const queryLower = query ? query.toLowerCase() : '';
      
      if (query) {
        // Title matches get highest score
        if (doc.title.toLowerCase().includes(queryLower)) score += 3;
        
        // Team matches for ambiguous queries
        if (queryLower.includes('qa') && doc.owningTeam === 'qa') score += 2;
        if (queryLower.includes('dev') && doc.owningTeam === 'dev') score += 2;
        if (queryLower.includes('ba') && doc.owningTeam === 'ba') score += 2;
        
        // Tag matches
        if (doc.tags && doc.tags.toLowerCase().includes(queryLower)) score += 1.5;
        
        // Content matches
        if (doc.extractedText && doc.extractedText.toLowerCase().includes(queryLower)) score += 1;
        
        // System and docType matches
        if (doc.system && doc.system.toLowerCase().includes(queryLower)) score += 1;
        if (doc.docType && doc.docType.toLowerCase().includes(queryLower)) score += 1;
      }
      
      return {
        ...doc,
        tags: doc.tags ? doc.tags.split(',') : [],
        searchScore: score
      };
    });

    // Sort by search score if there's a query
    if (query) {
      scoredResults.sort((a, b) => b.searchScore - a.searchScore);
    }

    res.json({
      results: scoredResults,
      total: scoredResults.length,
      query: query || null,
      filters: { team, docType, system, lifecycle, confidentiality, audience }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const database = await getDatabase();
    const searchTerm = `%${query}%`;
    
    const suggestions = await database.all(`
      SELECT DISTINCT title, owningTeam, docType, system
      FROM documents 
      WHERE title LIKE ? OR owningTeam LIKE ? OR docType LIKE ? OR system LIKE ?
      LIMIT 10
    `, [searchTerm, searchTerm, searchTerm, searchTerm]);

    res.json({ suggestions });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get available filters
router.get('/filters', async (req, res) => {
  try {
    const database = await getDatabase();
    
    const teams = await database.all('SELECT DISTINCT owningTeam FROM documents ORDER BY owningTeam');
    const docTypes = await database.all('SELECT DISTINCT docType FROM documents ORDER BY docType');
    const systems = await database.all('SELECT DISTINCT system FROM documents WHERE system IS NOT NULL ORDER BY system');
    const lifecycles = await database.all('SELECT DISTINCT lifecycle FROM documents ORDER BY lifecycle');
    const confidentiality = await database.all('SELECT DISTINCT confidentiality FROM documents ORDER BY confidentiality');
    const audiences = await database.all('SELECT DISTINCT audience FROM documents ORDER BY audience');

    res.json({
      teams: teams.map(t => t.owningTeam),
      docTypes: docTypes.map(d => d.docType),
      systems: systems.map(s => s.system),
      lifecycles: lifecycles.map(l => l.lifecycle),
      confidentiality: confidentiality.map(c => c.confidentiality),
      audiences: audiences.map(a => a.audience)
    });

  } catch (error) {
    console.error('Filters error:', error);
    res.status(500).json({ error: 'Failed to get filters' });
  }
});

export default router;
