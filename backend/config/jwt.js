const path = require('path');
const dotenv = require('dotenv');

// Ensure backend .env is loaded even if modules are imported out of order.
dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const DEV_FALLBACK_SECRET = 'ats-resume-analyzer-dev-secret';
const isProduction = process.env.NODE_ENV === 'production';

const getJwtSecret = () => {
  const envSecret = typeof process.env.JWT_SECRET === 'string'
    ? process.env.JWT_SECRET.trim()
    : '';

  if (envSecret) {
    return envSecret;
  }

  if (isProduction) {
    throw new Error(
      'JWT_SECRET is required in production. Set it in your hosting environment (e.g. Render).'
    );
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
