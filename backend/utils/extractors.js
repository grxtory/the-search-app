import fs from 'fs-extra';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// Extract text from various file types
export async function extractTextFromFile(filePath, mimeType) {
  try {
    const buffer = await fs.readFile(filePath);
    
    switch (mimeType) {
      case 'application/pdf':
        return await extractFromPDF(buffer);
        
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractFromWord(buffer);
        
      case 'text/plain':
      case 'text/markdown':
      case 'text/csv':
      case 'application/json':
      case 'text/xml':
      case 'application/xml':
        return await extractFromText(buffer);
        
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

// Extract text from PDF
async function extractFromPDF(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return 'PDF text extraction failed.';
  }
}

// Extract text from Word documents
async function extractFromWord(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Word extraction error:', error);
    return 'Word document text extraction failed.';
  }
}

// Extract text from plain text files
async function extractFromText(buffer) {
  try {
    return buffer.toString('utf8');
  } catch (error) {
    console.error('Text extraction error:', error);
    return 'Text file extraction failed.';
  }
}

// Get file metadata
export async function getFileMetadata(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    console.error('File metadata error:', error);
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
}

// Validate file type
export function isValidFileType(mimeType) {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'text/xml',
    'application/xml'
  ];
  
  return allowedTypes.includes(mimeType);
}

// Get file extension from mime type
export function getFileExtension(mimeType) {
  const extensions = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'text/markdown': '.md',
    'text/csv': '.csv',
    'application/json': '.json',
    'text/xml': '.xml',
    'application/xml': '.xml'
  };
  
  return extensions[mimeType] || '';
}
