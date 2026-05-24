const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { assertJwtSecret } = require('../config/jwt');

const authMiddleware = async (req, res, next) => {
  try {
    const jwtSecret = assertJwtSecret();
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    next(err);
  }
};

module.exports = authMiddleware;
