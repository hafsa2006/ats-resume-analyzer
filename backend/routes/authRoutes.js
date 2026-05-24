const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { assertJwtSecret } = require('../config/jwt');

router.post('/signup', async (req, res) => {
  try {
    const jwtSecret = assertJwtSecret();
    const { name, email, password } = req.body || {};
    const emailNorm = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const nameStr = typeof name === 'string' ? name.trim() : '';
    if (!nameStr || !emailNorm || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ email: emailNorm });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered. Try logging in instead.' });
    }
    const user = await User.create({ name: nameStr, email: emailNorm, password });
    const token = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered. Try logging in instead.' });
    }
    res.status(500).json({ message: err.message || 'Signup failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const jwtSecret = assertJwtSecret();
    const { email, password } = req.body || {};
    const emailNorm = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!emailNorm || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed.' });
  }
});

module.exports = router;
