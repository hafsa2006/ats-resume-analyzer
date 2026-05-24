const Tesseract = require('tesseract.js');

async function extractTextWithOcr(imagePathOrBuffer) {
  try {
    const result = await Tesseract.recognize(imagePathOrBuffer, 'eng', {
      logger: (m) => {},
    });
    return result.data.text || '';
  } catch (err) {
    throw new Error('OCR failed: ' + (err.message || 'Unknown error'));
  }
}

module.exports = { extractTextWithOcr };
