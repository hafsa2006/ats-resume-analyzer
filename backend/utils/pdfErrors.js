const PDF_USER_MESSAGE =
  'Unable to process this PDF. Please upload a text-based resume PDF exported from Word or Google Docs.';

class PdfProcessingError extends Error {
  constructor(message = PDF_USER_MESSAGE, cause = null) {
    super(message);
    this.name = 'PdfProcessingError';
    this.code = 'PDF_PARSE_FAILED';
    this.userMessage = message;
    this.cause = cause;
  }
}

function isPdfBuffer(buffer) {
  if (!buffer || buffer.length < 5) return false;
  const header = buffer.slice(0, 5).toString('ascii');
  return header.startsWith('%PDF');
}

module.exports = {
  PDF_USER_MESSAGE,
  PdfProcessingError,
  isPdfBuffer,
};
