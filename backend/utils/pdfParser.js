const pdf = require('pdf-parse');

async function extractTextFromPdf(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text || '';
  } catch (err) {
    throw new Error('Failed to extract text from PDF: ' + (err.message || 'Unknown error'));
  }
}

module.exports = { extractTextFromPdf };
