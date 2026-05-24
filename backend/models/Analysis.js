const mongoose = require('mongoose');

const scoreBreakdownSchema = new mongoose.Schema({
  keywordMatch: Number,
  skills: Number,
  experience: Number,
  formatting: Number,
  projects: Number,
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: { type: String, default: '' },
  resumeText: { type: String, default: '' },
  jobDescription: { type: String, required: true },
  atsScore: { type: Number, required: true, min: 0, max: 100 },
  scoreBreakdown: { type: scoreBreakdownSchema, default: {} },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  recommendedKeywords: [{ type: String }],
  suggestions: [{ type: String }],
  parsedResume: { type: mongoose.Schema.Types.Mixed, default: {} },
  insights: { type: mongoose.Schema.Types.Mixed, default: {} },
  aiEnhancements: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Analysis', analysisSchema);
