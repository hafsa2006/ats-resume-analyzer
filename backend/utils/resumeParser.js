const TECH_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang', 'rust',
  'swift', 'kotlin', 'php', 'scala', 'r', 'sql', 'html', 'css', 'react', 'angular', 'vue',
  'next.js', 'node.js', 'express', 'django', 'flask', 'spring', 'fastapi', 'mongodb',
  'postgresql', 'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git',
  'graphql', 'rest', 'api', 'microservices', 'tensorflow', 'pytorch', 'machine learning',
  'data science', 'agile', 'scrum', 'ci/cd', 'jenkins', 'terraform', 'linux', 'figma',
  'tailwind', 'webpack', 'vite', 'jest', 'cypress', 'selenium', 'blockchain', 'solidity',
];

const SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'collaboration', 'problem solving',
  'critical thinking', 'time management', 'adaptability', 'creativity', 'mentoring',
  'negotiation', 'presentation', 'analytical', 'detail oriented', 'self motivated',
  'interpersonal', 'conflict resolution', 'decision making', 'emotional intelligence',
];

const SECTION_PATTERNS = {
  experience: /^(experience|work experience|professional experience|employment|work history)/i,
  education: /^(education|academic|qualifications|degrees?)/i,
  skills: /^(skills|technical skills|core competencies|technologies|expertise)/i,
  projects: /^(projects|personal projects|key projects|portfolio)/i,
  certifications: /^(certifications?|licenses?|credentials?)/i,
  summary: /^(summary|profile|objective|about me|professional summary)/i,
};

function extractEmail(text) {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match ? match[0] : '';
}

function extractPhone(text) {
  const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0].trim() : '';
}

function extractName(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && line.length < 60 && !line.includes('@') && !/\d{3}/.test(line)) {
      if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(line)) return line;
      if (/^[A-Z][A-Z\s]{3,40}$/.test(line)) {
        return line.split(/\s+/).map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
      }
    }
  }
  return lines[0]?.slice(0, 50) || '';
}

function findSkillsInText(text, skillList) {
  const lower = text.toLowerCase();
  return skillList.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
  });
}

function extractSections(text) {
  const lines = text.split('\n');
  const sections = {};
  let current = 'header';
  sections[current] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let matched = false;
    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(trimmed) && trimmed.length < 50) {
        current = key;
        sections[current] = sections[current] || [];
        matched = true;
        break;
      }
    }
    if (!matched) {
      sections[current] = sections[current] || [];
      sections[current].push(trimmed);
    }
  }
  return sections;
}

function extractExperience(sections) {
  const expLines = sections.experience || [];
  const entries = [];
  let current = null;

  for (const line of expLines) {
    const dateMatch = line.match(/(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i);
    const titleMatch = line.match(/^(.+?)\s*(?:at|@|\||–|-)\s*(.+)$/i);

    if (dateMatch || (titleMatch && line.length < 120)) {
      if (current) entries.push(current);
      current = {
        title: titleMatch ? titleMatch[1].trim() : line,
        company: titleMatch ? titleMatch[2].trim() : '',
        dates: dateMatch ? line : '',
        bullets: [],
      };
    } else if (current && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
      current.bullets.push(line.replace(/^[•\-*]\s*/, ''));
    } else if (current && line.length > 10) {
      current.bullets.push(line);
    }
  }
  if (current) entries.push(current);
  return entries.slice(0, 10);
}

function extractEducation(sections) {
  const eduLines = sections.education || [];
  return eduLines.slice(0, 6).map((line) => ({
    text: line,
    degree: /bachelor|master|phd|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|mba|associate/i.test(line),
  }));
}

function extractProjects(sections) {
  const projLines = sections.projects || [];
  const projects = [];
  let current = null;

  for (const line of projLines) {
    if (line.length < 80 && !line.startsWith('•') && !line.startsWith('-')) {
      if (current) projects.push(current);
      current = { name: line, description: [] };
    } else if (current) {
      current.description.push(line.replace(/^[•\-*]\s*/, ''));
    }
  }
  if (current) projects.push(current);
  return projects.slice(0, 8);
}

function extractCertifications(sections) {
  return (sections.certifications || []).slice(0, 10);
}

function parseResume(text) {
  const normalized = (text || '').replace(/\r\n/g, '\n').trim();
  const sections = extractSections(normalized);
  const technicalSkills = findSkillsInText(normalized, TECH_SKILLS);
  const softSkills = findSkillsInText(normalized, SOFT_SKILLS);

  return {
    name: extractName(normalized),
    email: extractEmail(normalized),
    phone: extractPhone(normalized),
    skills: {
      technical: [...new Set(technicalSkills)],
      soft: [...new Set(softSkills)],
      all: [...new Set([...technicalSkills, ...softSkills])],
    },
    experience: extractExperience(sections),
    education: extractEducation(sections),
    certifications: extractCertifications(sections),
    projects: extractProjects(sections),
    sections: Object.keys(sections).filter((k) => k !== 'header' && sections[k]?.length),
    rawSections: sections,
  };
}

module.exports = { parseResume, TECH_SKILLS, SOFT_SKILLS };
