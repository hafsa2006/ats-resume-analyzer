const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { assertJwtSecret } = require('../config/jwt');
const { isDatabaseConnected, waitForDatabase } = require('../config/database');

const DB_UNAVAILABLE_MSG =
  'Database is not connected. Wait a few seconds and retry, or fix MongoDB in backend/.env (see querySrv / Atlas IP whitelist).';

function isDbError(err) {
  return (
    mongoose.connection.readyState !== 1 ||
    err?.name === 'MongoServerSelectionError' ||
    err?.name === 'MongoNetworkError' ||
    err?.name === 'MongoTimeoutError'
  );
}

const authMiddleware = async (req, res, next) => {
  try {
    if (!isDatabaseConnected()) {
      const ready = await waitForDatabase(12000);
      if (!ready) {
        return res.status(503).json({ message: DB_UNAVAILABLE_MSG, code: 'DB_UNAVAILABLE' });
      }
    }

    const jwtSecret = assertJwtSecret();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('-password').maxTimeMS(8000);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    if (isDbError(err)) {
      return res.status(503).json({ message: DB_UNAVAILABLE_MSG, code: 'DB_UNAVAILABLE' });
    }
    console.error('Auth middleware error:', err.message);
    return res.status(500).json({ message: 'Authentication failed. Please try again.' });
  }
};

module.exports = authMiddleware;
