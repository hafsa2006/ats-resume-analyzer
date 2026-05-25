const path = require('path');
const { pathToFileURL } = require('url');
const pdfParse = require('pdf-parse');
const { PdfProcessingError, isPdfBuffer, PDF_USER_MESSAGE } = require('./pdfErrors');

const pdfjsDistRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));
const PDFJS_CMAP_URL = pathToFileURL(path.join(pdfjsDistRoot, 'cmaps/')).href;
const PDFJS_STANDARD_FONT_URL = pathToFileURL(path.join(pdfjsDistRoot, 'standard_fonts/')).href;

const MIN_TEXT_LENGTH = 50;
const PDF_PARSE_OPTIONS = { max: 0, version: 'default' };

function normalizeText(text) {
  return (text || '')
    .replace(/\0/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function parseWithPdfParse(buffer) {
  const data = await pdfParse(buffer, PDF_PARSE_OPTIONS);
  return normalizeText(data?.text);
}

async function parseWithPdfJs(buffer) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(buffer);

  const loadingTask = pdfjs.getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
    useWorkerFetch: false,
    cMapUrl: PDFJS_CMAP_URL,
    cMapPacked: true,
    standardFontDataUrl: PDFJS_STANDARD_FONT_URL,
  });

  const doc = await loadingTask.promise;
  const chunks = [];

  try {
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => (typeof item.str === 'string' ? item.str : ''))
        .join(' ');
      if (pageText.trim()) chunks.push(pageText);
    }
  } finally {
    await doc.destroy();
  }

  return normalizeText(chunks.join('\n'));
}

/**
 * Extract text from a PDF buffer using pdf-parse, then pdfjs-dist as fallback.
 * @returns {{ text: string, parser: 'pdf-parse' | 'pdfjs-dist' }}
 */
async function extractTextFromPdf(buffer) {
  if (!buffer?.length || !isPdfBuffer(buffer)) {
    throw new PdfProcessingError(PDF_USER_MESSAGE);
  }

  let parseSucceeded = false;
  let bestText = '';
  let bestParser = 'pdf-parse';
  const errors = [];

  try {
    const text = await parseWithPdfParse(buffer);
    parseSucceeded = true;
    if (text.length > bestText.length) {
      bestText = text;
      bestParser = 'pdf-parse';
    }
  } catch (err) {
    errors.push({ parser: 'pdf-parse', error: err.message });
  }

  try {
    const text = await parseWithPdfJs(buffer);
    parseSucceeded = true;
    if (text.length > bestText.length) {
      bestText = text;
      bestParser = 'pdfjs-dist';
    }
  } catch (err) {
    errors.push({ parser: 'pdfjs-dist', error: err.message });
  }

  if (!parseSucceeded) {
    console.warn('PDF corrupt or unreadable:', errors);
    throw new PdfProcessingError(PDF_USER_MESSAGE);
  }

  if (bestText.length >= MIN_TEXT_LENGTH) {
    return { text: bestText, parser: bestParser, partial: false };
  }

  return { text: bestText, parser: bestParser, partial: true };
}

module.exports = { extractTextFromPdf, MIN_TEXT_LENGTH };
