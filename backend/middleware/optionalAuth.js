const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { assertJwtSecret } = require('../config/jwt');

/** Attach user when token is valid; continue without user when DB is down or token missing */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, assertJwtSecret());
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}

module.exports = optionalAuth;
