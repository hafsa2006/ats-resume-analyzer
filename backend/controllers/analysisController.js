const mongoose = require('mongoose');
const Analysis = require('../models/Analysis');
const { extractResumeText, PdfProcessingError } = require('../utils/extractResumeText');
const { analyzeResumeWithJob } = require('../utils/geminiService');
const { getMockDashboardStats } = require('../utils/mockDashboardStats');
const path = require('path');
const fs = require('fs');

const useMockDashboard = () =>
  process.env.MOCK_DASHBOARD === 'true' || mongoose.connection.readyState !== 1;

function formatAnalysisResponse(analysis) {
  return {
    analysisId: analysis._id,
    atsScore: analysis.atsScore,
    scoreBreakdown: analysis.scoreBreakdown,
    matchedSkills: analysis.matchedSkills,
    missingSkills: analysis.missingSkills,
    recommendedKeywords: analysis.recommendedKeywords,
    suggestions: analysis.suggestions,
    parsedResume: analysis.parsedResume,
    insights: analysis.insights,
    aiEnhancements: analysis.aiEnhancements,
    fileName: analysis.fileName,
    createdAt: analysis.createdAt,
  };
}

async function runAnalysis(req, res) {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required.' });
    }
    const jobDescription = (req.body.jobDescription || '').trim();
    if (!jobDescription) {
      return res.status(400).json({ message: 'Job description is required.' });
    }

    filePath = req.file.path;
    const { text: resumeText } = await extractResumeText(filePath, req.file.mimetype);
    const analysisResult = await analyzeResumeWithJob(resumeText, jobDescription);

    const analysis = await Analysis.create({
      userId: req.user._id,
      fileName: req.file.originalname || '',
      resumeText,
      jobDescription,
      atsScore: analysisResult.atsScore,
      scoreBreakdown: analysisResult.scoreBreakdown,
      matchedSkills: analysisResult.matchedSkills,
      missingSkills: analysisResult.missingSkills,
      recommendedKeywords: analysisResult.recommendedKeywords || [],
      suggestions: analysisResult.suggestions,
      parsedResume: analysisResult.parsedResume,
      insights: analysisResult.insights,
      aiEnhancements: analysisResult.aiEnhancements,
    });

    res.status(201).json(formatAnalysisResponse(analysis));
  } catch (err) {
    if (err instanceof PdfProcessingError) {
      return res.status(422).json({
        message: err.userMessage,
        code: err.code,
      });
    }
    const status = err.message?.includes('Job description') || err.message?.includes('required') ? 400 : 500;
    res.status(status).json({ message: err.message || 'Analysis failed.' });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
}

async function getHistory(req, res) {
  try {
    const list = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-resumeText');

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load history.' });
  }
}

async function getAnalysisById(req, res) {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found.' });
    }
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load analysis.' });
  }
}

async function getDashboardStats(req, res) {
  try {
    if (useMockDashboard()) {
      return res.json(getMockDashboardStats());
    }

    if (!req.user) {
      return res.json(getMockDashboardStats());
    }

    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('atsScore scoreBreakdown matchedSkills missingSkills createdAt fileName');

    const total = analyses.length;
    const avgScore = total
      ? Math.round(analyses.reduce((s, a) => s + a.atsScore, 0) / total)
      : 0;
    const bestScore = total ? Math.max(...analyses.map((a) => a.atsScore)) : 0;

    const scoreTrend = analyses
      .slice(0, 10)
      .reverse()
      .map((a, i) => ({
        name: `Run ${i + 1}`,
        score: a.atsScore,
        date: a.createdAt,
      }));

    const skillFrequency = {};
    for (const a of analyses) {
      for (const skill of a.matchedSkills || []) {
        skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
      }
    }
    const topSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));

    const recentActivity = analyses.slice(0, 8).map((a) => ({
      id: a._id,
      type: 'analysis',
      score: a.atsScore,
      fileName: a.fileName || 'Resume',
      createdAt: a.createdAt,
    }));

    res.json({
      totalAnalyses: total,
      avgScore,
      bestScore,
      scoreTrend,
      topSkills,
      recentActivity,
      recentAnalyses: analyses.slice(0, 5),
    });
  } catch (err) {
    console.warn('Dashboard stats fallback to mock:', err.message);
    res.json(getMockDashboardStats());
  }
}

module.exports = { runAnalysis, getHistory, getAnalysisById, getDashboardStats };
