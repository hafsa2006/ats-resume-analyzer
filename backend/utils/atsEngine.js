const { TECH_SKILLS, SOFT_SKILLS } = require('./resumeParser');

const WEIGHTS = {
  keywordMatch: 0.40,
  skills: 0.20,
  experience: 0.15,
  formatting: 0.15,
  projects: 0.10,
};

const STRONG_VERBS = new Set([
  'achieved', 'built', 'created', 'delivered', 'designed', 'developed', 'engineered',
  'implemented', 'improved', 'increased', 'launched', 'led', 'managed', 'optimized',
  'reduced', 'spearheaded', 'streamlined', 'transformed', 'automated', 'architected',
  'collaborated', 'coordinated', 'deployed', 'established', 'executed', 'generated',
  'integrated', 'maintained', 'mentored', 'migrated', 'negotiated', 'orchestrated',
  'pioneered', 'resolved', 'scaled', 'secured', 'accelerated', 'analyzed',
]);

const WEAK_VERBS = new Set([
  'helped', 'worked', 'assisted', 'responsible', 'participated', 'involved',
  'handled', 'did', 'made', 'used', 'supported', 'contributed', 'tasked',
]);

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their', 'this',
  'to', 'was', 'were', 'will', 'with', 'you', 'your', 'our', 'we', 'can', 'should',
  'using', 'use', 'used', 'required', 'requirements', 'experience', 'strong',
  'work', 'working', 'ability', 'skills', 'skill', 'knowledge', 'team', 'support',
  'assist', 'including', 'basic', 'senior', 'developer', 'developers', 'need',
  'must', 'plus', 'preferred', 'looking', 'role', 'position', 'years', 'year',
]);

const REQUIRED_SECTIONS = ['experience', 'education', 'skills'];

function clamp(n, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function normalizeTokens(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function extractKeywords(text, max = 40) {
  const tokens = normalizeTokens(text);
  const freq = new Map();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([token]) => token)
    .slice(0, max);
}

function scoreKeywordMatch(resumeText, jobDescription) {
  const resumeTokens = new Set(normalizeTokens(resumeText));
  const jdKeywords = extractKeywords(jobDescription, 35);
  if (!jdKeywords.length) return { score: 100, matched: [], missing: [], recommended: [] };

  const matched = jdKeywords.filter((k) => resumeTokens.has(k));
  const missing = jdKeywords.filter((k) => !resumeTokens.has(k));
  const ratio = matched.length / jdKeywords.length;

  let score = ratio * 100;
  const stuffing = detectKeywordStuffing(resumeText, jdKeywords);
  if (stuffing.detected) score -= stuffing.penalty;

  return {
    score: clamp(score),
    matched,
    missing,
    recommended: missing.slice(0, 8),
  };
}

function detectKeywordStuffing(text, keywords) {
  const lower = (text || '').toLowerCase();
  let maxDensity = 0;
  for (const kw of keywords.slice(0, 15)) {
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const count = (lower.match(regex) || []).length;
    const density = count / Math.max(1, lower.split(/\s+/).length) * 100;
    if (count > 8) maxDensity = Math.max(maxDensity, density * count);
  }
  if (maxDensity > 3) {
    return { detected: true, penalty: 15 };
  }
  return { detected: false, penalty: 0 };
}

function scoreSkills(parsedResume, jobDescription) {
  const jdLower = jobDescription.toLowerCase();
  const jdTech = TECH_SKILLS.filter((s) => jdLower.includes(s));
  const jdSoft = SOFT_SKILLS.filter((s) => jdLower.includes(s));
  const required = [...new Set([...jdTech, ...jdSoft])];

  if (!required.length) {
    const resumeSkills = parsedResume.skills?.all || [];
    return {
      score: resumeSkills.length >= 5 ? 85 : resumeSkills.length * 15,
      matched: resumeSkills.slice(0, 15),
      missing: [],
    };
  }

  const resumeSet = new Set((parsedResume.skills?.all || []).map((s) => s.toLowerCase()));
  const matched = required.filter((s) => resumeSet.has(s));
  const missing = required.filter((s) => !resumeSet.has(s));

  return {
    score: clamp((matched.length / required.length) * 100),
    matched,
    missing,
  };
}

function scoreExperience(parsedResume, jobDescription) {
  const experiences = parsedResume.experience || [];
  let score = 0;

  if (experiences.length >= 2) score += 40;
  else if (experiences.length === 1) score += 25;
  else score += 5;

  const yearMatch = jobDescription.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
  const requiredYears = yearMatch ? parseInt(yearMatch[1], 10) : 0;
  const resumeYears = estimateYearsExperience(experiences, parsedResume.rawSections?.experience?.join(' ') || '');

  if (requiredYears > 0) {
    score += clamp((Math.min(resumeYears, requiredYears) / requiredYears) * 40, 0, 40);
  } else {
    score += experiences.length >= 1 ? 30 : 10;
  }

  const bullets = experiences.flatMap((e) => e.bullets || []);
  const withMetrics = bullets.filter((b) => /\d+%|\$\d+|\d+\+|\d+\s*(users|clients|customers|projects|team)/i.test(b));
  score += clamp((withMetrics.length / Math.max(1, bullets.length)) * 30, 0, 30);

  return { score: clamp(score), yearsEstimate: resumeYears, quantifiedBullets: withMetrics.length };
}

function estimateYearsExperience(experiences, expText) {
  const years = new Set();
  const text = expText + experiences.map((e) => e.dates).join(' ');
  const matches = text.matchAll(/(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi);
  for (const m of matches) {
    const start = parseInt(m[1], 10);
    const end = m[2].match(/present|current/i) ? new Date().getFullYear() : parseInt(m[2], 10);
    if (start > 1980 && end >= start) {
      for (let y = start; y <= end; y++) years.add(y);
    }
  }
  return years.size || experiences.length * 2;
}

function scoreFormatting(parsedResume, resumeText) {
  let score = 100;
  const issues = [];
  const sections = parsedResume.sections || [];

  for (const req of REQUIRED_SECTIONS) {
    if (!sections.includes(req)) {
      score -= 15;
      issues.push(`Missing ${req} section`);
    }
  }

  if (/\t{2,}/.test(resumeText)) {
    score -= 10;
    issues.push('Excessive tabs may break ATS parsing');
  }
  if (/<table|<img|column|text box/i.test(resumeText)) {
    score -= 20;
    issues.push('ATS-unfriendly elements detected (tables/images)');
  }
  if (resumeText.length < 200) {
    score -= 25;
    issues.push('Resume text too short');
  }
  if (!parsedResume.email) {
    score -= 5;
    issues.push('Email not detected');
  }

  const readability = calculateReadability(resumeText);
  if (readability < 40) {
    score -= 10;
    issues.push('Low readability — simplify sentence structure');
  }

  return { score: clamp(score), issues, readability };
}

function calculateReadability(text) {
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const avgWords = words / sentences;
  if (avgWords < 15) return 80;
  if (avgWords < 25) return 65;
  if (avgWords < 35) return 50;
  return 35;
}

function scoreProjects(parsedResume) {
  const projects = parsedResume.projects || [];
  let score = 0;

  if (projects.length >= 2) score += 50;
  else if (projects.length === 1) score += 35;
  else score += 10;

  const allDesc = projects.flatMap((p) => p.description || []).join(' ');
  const hasTech = TECH_SKILLS.some((s) => allDesc.toLowerCase().includes(s));
  if (hasTech) score += 25;

  const hasMetrics = /\d+%|\$\d+|\d+\+|increased|reduced|improved/i.test(allDesc);
  if (hasMetrics) score += 25;

  return { score: clamp(score), count: projects.length };
}

function detectWeakVerbs(resumeText) {
  const bullets = resumeText.split('\n').filter((l) => /^[\s•\-*]/.test(l));
  const weak = [];
  for (const bullet of bullets) {
    const firstWord = bullet.replace(/^[\s•\-*]+/, '').split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (WEAK_VERBS.has(firstWord)) {
      weak.push(firstWord);
    }
  }
  return [...new Set(weak)].slice(0, 6);
}

function detectMissingMetrics(parsedResume) {
  const bullets = (parsedResume.experience || []).flatMap((e) => e.bullets || []);
  const withoutMetrics = bullets.filter((b) => !/\d/.test(b));
  return withoutMetrics.length;
}

function buildRecruiterHeatmap(resumeText, jdKeywords) {
  const lines = resumeText.split('\n').filter((l) => l.trim());
  const total = lines.length || 1;
  const heatmap = [];

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].toLowerCase();
    let attention = 100 - (i / total) * 60;
    const keywordHits = jdKeywords.filter((k) => line.includes(k)).length;
    attention += keywordHits * 8;
    if (/experience|skills|summary|education/i.test(line)) attention += 10;
    heatmap.push({
      line: i + 1,
      text: lines[i].slice(0, 80),
      attention: clamp(attention, 10, 100),
    });
  }
  return heatmap;
}

function buildKeywordDensity(resumeText, keywords) {
  const words = resumeText.split(/\s+/).filter(Boolean).length || 1;
  return keywords.slice(0, 12).map((kw) => {
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const count = (resumeText.match(regex) || []).length;
    return { keyword: kw, count, density: Math.round((count / words) * 1000) / 10 };
  });
}

function buildSuggestions(scores, parsedResume, keyword, formatting) {
  const suggestions = [];

  if (keyword.missing.length) {
    suggestions.push(`Add missing keywords: ${keyword.missing.slice(0, 5).join(', ')}.`);
  }
  const weakVerbs = detectWeakVerbs(parsedResume.rawSections?.experience?.join('\n') || '');
  if (weakVerbs.length) {
    suggestions.push(`Replace weak action verbs (${weakVerbs.join(', ')}) with stronger ones like "delivered", "engineered", or "optimized".`);
  }
  const missingMetrics = detectMissingMetrics(parsedResume);
  if (missingMetrics > 2) {
    suggestions.push(`Quantify ${missingMetrics} bullet points with metrics (%, $, time saved, users impacted).`);
  }
  if (formatting.issues.length) {
    suggestions.push(formatting.issues[0]);
  }
  if (scores.projects < 60) {
    suggestions.push('Add 1–2 project entries with tech stack and measurable outcomes.');
  }
  if (scores.experience < 60) {
    suggestions.push('Expand experience section with role-specific achievements aligned to the job description.');
  }
  suggestions.push('Tailor your professional summary to mirror top keywords from the job posting.');

  return suggestions.slice(0, 6);
}

function buildAiEnhancements(parsedResume, jobDescription, keyword) {
  const bullets = (parsedResume.experience || []).flatMap((e) =>
    (e.bullets || []).slice(0, 2).map((b) => ({ role: e.title, bullet: b }))
  );

  const enhancedBullets = bullets.slice(0, 3).map(({ role, bullet }) => ({
    original: bullet,
    improved: `Led initiative resulting in measurable impact: ${bullet.replace(/^[a-z]/, (c) => c.toUpperCase())} — achieving 25%+ improvement in key metrics.`,
    role,
  }));

  const skillGaps = keyword.missing.slice(0, 5).map((skill) => ({
    skill,
    recommendation: `Consider a course or side project demonstrating ${skill} to close this gap.`,
  }));

  const interviewQuestions = keyword.matched.slice(0, 4).map((skill) => ({
    skill,
    question: `Describe a challenging project where you used ${skill}. What was the outcome?`,
  }));

  const careerRecommendations = [
    scoresBelow(keyword.score, 70) ? 'Focus on keyword alignment — mirror JD language in your top third.' : null,
    (parsedResume.projects?.length || 0) < 2 ? 'Build portfolio projects showcasing missing skills.' : null,
    'Network with employees at target companies and customize each application.',
  ].filter(Boolean);

  return {
    enhancedBullets,
    skillGapAnalysis: skillGaps,
    interviewQuestions,
    careerRecommendations,
    summaryImprovement: `Results-driven professional with expertise in ${keyword.matched.slice(0, 4).join(', ') || 'relevant technologies'}. Proven track record delivering impact aligned with ${jobDescription.split('\n')[0]?.slice(0, 60) || 'target role'} requirements.`,
  };
}

function scoresBelow(score, threshold) {
  return score < threshold;
}

function computeAtsAnalysis(resumeText, jobDescription, parsedResume) {
  const keyword = scoreKeywordMatch(resumeText, jobDescription);
  const skills = scoreSkills(parsedResume, jobDescription);
  const experience = scoreExperience(parsedResume, jobDescription);
  const formatting = scoreFormatting(parsedResume, resumeText);
  const projects = scoreProjects(parsedResume);

  const scoreBreakdown = {
    keywordMatch: keyword.score,
    skills: skills.score,
    experience: experience.score,
    formatting: formatting.score,
    projects: projects.score,
  };

  const atsScore = clamp(
    scoreBreakdown.keywordMatch * WEIGHTS.keywordMatch +
    scoreBreakdown.skills * WEIGHTS.skills +
    scoreBreakdown.experience * WEIGHTS.experience +
    scoreBreakdown.formatting * WEIGHTS.formatting +
    scoreBreakdown.projects * WEIGHTS.projects
  );

  const jdKeywords = extractKeywords(jobDescription, 25);
  const heatmap = buildRecruiterHeatmap(resumeText, jdKeywords);
  const keywordDensity = buildKeywordDensity(resumeText, [...keyword.matched, ...keyword.missing]);

  const issues = {
    weakVerbs: detectWeakVerbs(resumeText),
    missingMetrics: detectMissingMetrics(parsedResume),
    keywordStuffing: detectKeywordStuffing(resumeText, jdKeywords).detected,
    missingSections: REQUIRED_SECTIONS.filter((s) => !(parsedResume.sections || []).includes(s)),
    formattingIssues: formatting.issues,
  };

  const suggestions = buildSuggestions(scoreBreakdown, parsedResume, keyword, formatting);
  const aiEnhancements = buildAiEnhancements(parsedResume, jobDescription, keyword);

  return {
    atsScore,
    scoreBreakdown,
    matchedSkills: [...new Set([...keyword.matched, ...skills.matched])],
    missingSkills: [...new Set([...keyword.missing, ...skills.missing])],
    recommendedKeywords: keyword.recommended,
    suggestions,
    parsedResume,
    insights: {
      recruiterHeatmap: heatmap,
      keywordDensity,
      readability: formatting.readability,
      compatibilityPercent: atsScore,
      issues,
    },
    aiEnhancements,
  };
}

module.exports = { computeAtsAnalysis, WEIGHTS, extractKeywords };
