function calculateAtsScore(matchedSkills, requiredSkillsCount) {
  if (!requiredSkillsCount || requiredSkillsCount === 0) return 100;
  const matched = Array.isArray(matchedSkills) ? matchedSkills.length : 0;
  return Math.min(100, Math.round((matched / requiredSkillsCount) * 100));
}

module.exports = { calculateAtsScore };
