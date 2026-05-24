const { GoogleGenerativeAI } = require('@google/generative-ai');
const { parseResume } = require('./resumeParser');
const { computeAtsAnalysis } = require('./atsEngine');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const AI_PROMPT = `You are an expert ATS resume coach. Given resume analysis data, return valid JSON only (no markdown):
{
  "suggestions": ["3-5 actionable improvement tips"],
  "enhancedBullets": [{"original": "...", "improved": "...", "role": "..."}],
  "summaryImprovement": "improved professional summary",
  "interviewQuestions": [{"skill": "...", "question": "..."}],
  "careerRecommendations": ["2-3 career tips"],
  "skillGapAnalysis": [{"skill": "...", "recommendation": "..."}]
}

Resume excerpt:
{{RESUME}}

Job description:
{{JD}}

Missing skills: {{MISSING}}
Current score: {{SCORE}}`;

function stripJsonBlock(str) {
  let s = str.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```\w*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return s.trim();
}

async function enhanceWithGemini(baseResult, resumeText, jobDescription) {
  if (!process.env.GEMINI_API_KEY) return baseResult;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = AI_PROMPT
      .replace('{{RESUME}}', resumeText.slice(0, 4000))
      .replace('{{JD}}', jobDescription.slice(0, 2000))
      .replace('{{MISSING}}', baseResult.missingSkills.slice(0, 10).join(', '))
      .replace('{{SCORE}}', String(baseResult.atsScore));

    const result = await model.generateContent(prompt);
    const raw = result.response?.text?.();
    if (!raw) return baseResult;

    const data = JSON.parse(stripJsonBlock(raw));
    return {
      ...baseResult,
      suggestions: Array.isArray(data.suggestions) && data.suggestions.length
        ? data.suggestions
        : baseResult.suggestions,
      aiEnhancements: {
        ...baseResult.aiEnhancements,
        enhancedBullets: data.enhancedBullets || baseResult.aiEnhancements.enhancedBullets,
        summaryImprovement: data.summaryImprovement || baseResult.aiEnhancements.summaryImprovement,
        interviewQuestions: data.interviewQuestions || baseResult.aiEnhancements.interviewQuestions,
        careerRecommendations: data.careerRecommendations || baseResult.aiEnhancements.careerRecommendations,
        skillGapAnalysis: data.skillGapAnalysis || baseResult.aiEnhancements.skillGapAnalysis,
      },
    };
  } catch {
    return baseResult;
  }
}

async function analyzeResumeWithJob(resumeText, jobDescription) {
  const parsedResume = parseResume(resumeText);
  const baseResult = computeAtsAnalysis(resumeText, jobDescription, parsedResume);
  return enhanceWithGemini(baseResult, resumeText, jobDescription);
}

module.exports = { analyzeResumeWithJob, parseResume };
