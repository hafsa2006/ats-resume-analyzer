/** Demo dashboard payload when DB is unavailable or MOCK_DASHBOARD is enabled */
function getMockDashboardStats() {
  const now = Date.now();
  return {
    totalAnalyses: 12,
    avgScore: 78,
    bestScore: 92,
    scoreTrend: [
      { name: 'Run 1', score: 68, date: new Date(now - 9 * 86400000).toISOString() },
      { name: 'Run 2', score: 72, date: new Date(now - 8 * 86400000).toISOString() },
      { name: 'Run 3', score: 75, date: new Date(now - 6 * 86400000).toISOString() },
      { name: 'Run 4', score: 71, date: new Date(now - 5 * 86400000).toISOString() },
      { name: 'Run 5', score: 79, date: new Date(now - 4 * 86400000).toISOString() },
      { name: 'Run 6', score: 82, date: new Date(now - 3 * 86400000).toISOString() },
      { name: 'Run 7', score: 85, date: new Date(now - 2 * 86400000).toISOString() },
      { name: 'Run 8', score: 88, date: new Date(now - 86400000).toISOString() },
      { name: 'Run 9', score: 90, date: new Date(now - 43200000).toISOString() },
      { name: 'Run 10', score: 92, date: new Date(now).toISOString() },
    ],
    topSkills: [
      { skill: 'JavaScript', count: 9 },
      { skill: 'React', count: 8 },
      { skill: 'Node.js', count: 7 },
      { skill: 'TypeScript', count: 6 },
      { skill: 'Python', count: 5 },
      { skill: 'SQL', count: 4 },
      { skill: 'Git', count: 4 },
      { skill: 'REST APIs', count: 3 },
    ],
    recentActivity: [
      {
        id: 'mock-1',
        type: 'analysis',
        score: 92,
        fileName: 'Software_Engineer_Resume.pdf',
        createdAt: new Date(now).toISOString(),
      },
      {
        id: 'mock-2',
        type: 'analysis',
        score: 88,
        fileName: 'Full_Stack_CV.docx',
        createdAt: new Date(now - 86400000).toISOString(),
      },
      {
        id: 'mock-3',
        type: 'analysis',
        score: 85,
        fileName: 'ATS_Optimized_Resume.pdf',
        createdAt: new Date(now - 2 * 86400000).toISOString(),
      },
    ],
    mock: true,
  };
}

module.exports = { getMockDashboardStats };
