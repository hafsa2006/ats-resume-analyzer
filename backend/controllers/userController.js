const User = require('../models/User');

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load profile.' });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name?.trim()) updates.name = name.trim();
    if (email?.trim()) updates.email = email.trim().toLowerCase();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already in use.' });
    }
    res.status(500).json({ message: err.message || 'Failed to update profile.' });
  }
}

async function updatePreferences(req, res) {
  try {
    const { theme, emailNotifications, analysisAlerts, exportFormat } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (theme) user.preferences.theme = theme;
    if (typeof emailNotifications === 'boolean') user.preferences.emailNotifications = emailNotifications;
    if (typeof analysisAlerts === 'boolean') user.preferences.analysisAlerts = analysisAlerts;
    if (exportFormat) user.preferences.exportFormat = exportFormat;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update preferences.' });
  }
}

module.exports = { getProfile, updateProfile, updatePreferences };
