const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const { extractTextFromPdf } = require('./pdfParser');
const { extractTextWithOcr } = require('./ocrParser');

const PDF_MIMES = ['application/pdf'];
const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/jpg'];
const DOCX_MIMES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

async function extractFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return (result.value || '').trim();
}

async function extractResumeText(filePath, mimetype) {
  const buffer = fs.readFileSync(filePath);
  const mime = (mimetype || '').toLowerCase();
  const ext = path.extname(filePath).toLowerCase();

  if (PDF_MIMES.includes(mime) || ext === '.pdf') {
    const text = await extractTextFromPdf(buffer);
    if (text && text.trim().length > 50) {
      return { text: text.trim(), usedOcr: false };
    }
    return { text: (await extractTextWithOcr(filePath)).trim(), usedOcr: true };
  }

  if (IMAGE_MIMES.includes(mime)) {
    return { text: (await extractTextWithOcr(filePath)).trim(), usedOcr: true };
  }

  if (DOCX_MIMES.includes(mime) || ext === '.docx' || ext === '.doc') {
    const text = await extractFromDocx(buffer);
    if (text.length > 20) return { text, usedOcr: false };
  }

  throw new Error('Unsupported file type. Use PDF, DOCX, PNG, or JPG.');
}

module.exports = { extractResumeText };
