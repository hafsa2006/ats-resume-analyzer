/** Client-side demo stats when the API is unreachable */
export function getMockDashboardStats() {
  const now = Date.now()
  return {
    totalAnalyses: 12,
    avgScore: 78,
    bestScore: 92,
    scoreTrend: [
      { name: 'Run 1', score: 68 },
      { name: 'Run 2', score: 72 },
      { name: 'Run 3', score: 75 },
      { name: 'Run 4', score: 71 },
      { name: 'Run 5', score: 79 },
      { name: 'Run 6', score: 82 },
      { name: 'Run 7', score: 85 },
      { name: 'Run 8', score: 88 },
      { name: 'Run 9', score: 90 },
      { name: 'Run 10', score: 92 },
    ],
    topSkills: [
      { skill: 'JavaScript', count: 9 },
      { skill: 'React', count: 8 },
      { skill: 'Node.js', count: 7 },
      { skill: 'TypeScript', count: 6 },
      { skill: 'Python', count: 5 },
      { skill: 'SQL', count: 4 },
    ],
    recentActivity: [
      { id: 'mock-1', score: 92, fileName: 'Software_Engineer_Resume.pdf', createdAt: new Date(now).toISOString() },
      { id: 'mock-2', score: 88, fileName: 'Full_Stack_CV.docx', createdAt: new Date(now - 86400000).toISOString() },
      { id: 'mock-3', score: 85, fileName: 'ATS_Optimized_Resume.pdf', createdAt: new Date(now - 2 * 86400000).toISOString() },
    ],
    mock: true,
  }
}

export function isNetworkError(err) {
  return !err?.response && (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error')
}
