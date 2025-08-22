// In-memory database for demo purposes
let documents = [];
let nextId = 1;

export async function getDatabase() {
  return {
    all: async (sql, params = []) => {
      // Simple in-memory query implementation
      if (sql.includes('SELECT * FROM documents')) {
        return documents;
      }
      return [];
    },
    get: async (sql, params = []) => {
      if (sql.includes('SELECT COUNT(*)')) {
        return { count: documents.length };
      }
      if (sql.includes('SELECT * FROM documents WHERE id = ?')) {
        return documents.find(doc => doc.id === params[0]);
      }
      return null;
    },
    run: async (sql, params = []) => {
      if (sql.includes('INSERT INTO documents')) {
        const newDoc = {
          id: nextId++,
          title: params[0],
          owningTeam: params[1],
          owner: params[2],
          docType: params[3],
          system: params[4],
          lifecycle: params[5],
          confidentiality: params[6],
          audience: params[7],
          tags: params[8],
          extractedText: params[9],
          lastReviewed: params[10],
          nextReview: params[11],
          uploadedAt: params[12],
          source: params[13],
          fileSize: params[14],
          url: params[15],
          content: params[16],
          filePath: params[17],
          fileName: params[18],
          mimeType: params[19]
        };
        documents.push(newDoc);
        return { lastID: newDoc.id };
      }
      return { lastID: 0 };
    },
    exec: async (sql) => {
      // No-op for table creation
      return;
    }
  };
}

export async function initDatabase() {
  // Initialize with sample data
  if (documents.length === 0) {
    await insertSampleData();
  }
}

async function insertSampleData() {
  const sampleDocuments = [
    {
      id: nextId++,
      title: 'Payments.Refunds - Runbook',
      owningTeam: 'payments',
      owner: 'alex.chen',
      docType: 'runbook',
      system: 'payments',
      lifecycle: 'approved',
      confidentiality: 'restricted',
      audience: 'eng',
      tags: 'critical,on-call',
      extractedText: 'Step-by-step guide for handling refund failures in production. Includes rollback procedures and escalation paths.',
      lastReviewed: '2025-01-15',
      nextReview: '2025-04-15',
      uploadedAt: '2024-11-20',
      source: 'file',
      fileSize: '2.4 MB',
      url: null,
      content: `# Refunds Runbook

## Alert Response
1. Check metrics dashboard
2. Verify payment service health
3. Check error rates in logs

## Mitigation Steps
1. Enable circuit breaker if error rate > 5%
2. Route traffic to secondary region
3. Page on-call lead if not resolved in 15 minutes`,
      filePath: null,
      fileName: 'refunds-runbook.md',
      mimeType: 'text/markdown'
    },
    {
      id: nextId++,
      title: 'Auth.SSO - Technical Spec',
      owningTeam: 'platform',
      owner: 'sarah.kim',
      docType: 'spec',
      system: 'auth',
      lifecycle: 'in-review',
      confidentiality: 'public-internal',
      audience: 'eng',
      tags: 'security,architecture',
      extractedText: 'Single sign-on implementation using SAML 2.0 protocol with Okta integration.',
      lastReviewed: '2025-01-10',
      nextReview: '2025-02-10',
      uploadedAt: '2025-01-05',
      source: 'link',
      fileSize: null,
      url: 'https://internal.docs/auth-sso-spec',
      content: `# SSO Technical Specification

## Overview
Implementing SAML 2.0 based SSO with Okta as IdP

## Architecture
- Service Provider: Our platform
- Identity Provider: Okta
- Protocol: SAML 2.0

## Security Considerations
- Token expiry: 1 hour
- Refresh token: 24 hours
- MFA required for admin roles`,
      filePath: null,
      fileName: null,
      mimeType: null
    },
    {
      id: nextId++,
      title: 'QA.Testing - Automation Guide',
      owningTeam: 'qa',
      owner: 'mike.johnson',
      docType: 'SOP',
      system: 'testing',
      lifecycle: 'approved',
      confidentiality: 'public-internal',
      audience: 'eng',
      tags: 'automation,testing,qa',
      extractedText: 'Comprehensive guide for setting up and running automated test suites for the platform.',
      lastReviewed: '2025-01-20',
      nextReview: '2025-04-20',
      uploadedAt: '2025-01-15',
      source: 'file',
      fileSize: '1.8 MB',
      url: null,
      content: `# QA Testing Automation Guide

## Setup Instructions
1. Install test dependencies
2. Configure test environment
3. Set up CI/CD pipeline

## Running Tests
- Unit tests: npm run test:unit
- Integration tests: npm run test:integration
- E2E tests: npm run test:e2e

## Best Practices
- Write descriptive test names
- Use page object model
- Maintain test data separately`,
      filePath: null,
      fileName: 'qa-testing-guide.md',
      mimeType: 'text/markdown'
    },
    {
      id: nextId++,
      title: 'Dev.API - Documentation',
      owningTeam: 'dev',
      owner: 'jessica.wang',
      docType: 'spec',
      system: 'api',
      lifecycle: 'approved',
      confidentiality: 'public-internal',
      audience: 'eng',
      tags: 'api,documentation,dev',
      extractedText: 'Complete API documentation with endpoints, authentication, and examples.',
      lastReviewed: '2025-01-12',
      nextReview: '2025-02-12',
      uploadedAt: '2025-01-08',
      source: 'file',
      fileSize: '3.2 MB',
      url: null,
      content: `# API Documentation

## Authentication
All API requests require a valid JWT token in the Authorization header.

## Endpoints

### GET /api/users
Returns a list of users.

### POST /api/users
Creates a new user.

## Error Handling
Standard HTTP status codes are used for all responses.`,
      filePath: null,
      fileName: 'api-docs.md',
      mimeType: 'text/markdown'
    },
    {
      id: nextId++,
      title: 'BA.Requirements - User Stories',
      owningTeam: 'ba',
      owner: 'david.smith',
      docType: 'PRD',
      system: 'product',
      lifecycle: 'in-review',
      confidentiality: 'public-internal',
      audience: 'product',
      tags: 'requirements,user-stories,ba',
      extractedText: 'Product requirements document with detailed user stories and acceptance criteria.',
      lastReviewed: '2025-01-18',
      nextReview: '2025-02-18',
      uploadedAt: '2025-01-10',
      source: 'file',
      fileSize: '2.1 MB',
      url: null,
      content: `# Product Requirements Document

## User Stories

### As a user, I want to search for documents
- I can enter search terms
- I can filter by team, type, and other criteria
- I can view document previews

### As an admin, I want to upload documents
- I can drag and drop files
- I can add metadata
- I can set access permissions

## Acceptance Criteria
- Search returns relevant results within 2 seconds
- Upload supports PDF, Word, and Markdown files
- Metadata is required for all uploads`,
      filePath: null,
      fileName: 'requirements-doc.md',
      mimeType: 'text/markdown'
    }
  ];

  documents.push(...sampleDocuments);
  console.log('Sample data inserted successfully');
}
