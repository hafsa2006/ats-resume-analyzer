const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const { extractTextFromPdf, MIN_TEXT_LENGTH } = require('./pdfParser');
const { PdfProcessingError } = require('./pdfErrors');
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

async function extractPdfResume(_filePath, buffer) {
  try {
    const { text, partial } = await extractTextFromPdf(buffer);

    if (!partial && text.length >= MIN_TEXT_LENGTH) {
      return { text, usedOcr: false };
    }

    if (text.length >= 20) {
      return { text, usedOcr: false };
    }

    throw new PdfProcessingError();
  } catch (err) {
    if (err instanceof PdfProcessingError) throw err;
    throw new PdfProcessingError(undefined, err);
  }
}

async function extractResumeText(filePath, mimetype) {
  const buffer = fs.readFileSync(filePath);
  const mime = (mimetype || '').toLowerCase();
  const ext = path.extname(filePath).toLowerCase();

  if (PDF_MIMES.includes(mime) || ext === '.pdf') {
    return extractPdfResume(filePath, buffer);
  }

  if (IMAGE_MIMES.includes(mime)) {
    return { text: (await extractTextWithOcr(filePath)).trim(), usedOcr: true };
  }

  if (DOCX_MIMES.includes(mime) || ext === '.docx' || ext === '.doc') {
    const text = await extractFromDocx(buffer);
    if (text.length > 20) return { text, usedOcr: false };
    throw new Error('Could not extract enough text from the document. Try exporting as PDF from Word or Google Docs.');
  }

  throw new Error('Unsupported file type. Use PDF, DOCX, PNG, or JPG.');
}

module.exports = { extractResumeText, PdfProcessingError };
