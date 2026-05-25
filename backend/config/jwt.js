const path = require('path');
const dotenv = require('dotenv');

// Ensure backend .env is loaded even if modules are imported out of order.
dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const DEV_FALLBACK_SECRET = 'ats-resume-analyzer-dev-secret';

const getJwtSecret = () => {
  const envSecret = typeof process.env.JWT_SECRET === 'string'
    ? process.env.JWT_SECRET.trim()
    : '';

  if (envSecret) {
    return envSecret;
  }

  return DEV_FALLBACK_SECRET;
};

const assertJwtSecret = () => {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error('JWT secret is missing. Set JWT_SECRET in backend .env.');
  }
  return secret;
};

module.exports = {
  getJwtSecret,
  assertJwtSecret,
};
