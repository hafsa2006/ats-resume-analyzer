import { jsPDF } from 'jspdf'

export function exportAnalysisPdf(analysis) {
  const doc = new jsPDF()
  let y = 20

  doc.setFontSize(18)
  doc.text('ResumeIQ — ATS Analysis Report', 20, y)
  y += 12

  doc.setFontSize(12)
  doc.text(`ATS Score: ${analysis.atsScore}%`, 20, y)
  y += 8
  doc.text(`Date: ${analysis.createdAt ? new Date(analysis.createdAt).toLocaleString() : new Date().toLocaleString()}`, 20, y)
  y += 12

  if (analysis.scoreBreakdown) {
    doc.text('Score Breakdown:', 20, y)
    y += 7
    Object.entries(analysis.scoreBreakdown).forEach(([key, val]) => {
      doc.text(`  ${key}: ${val}%`, 20, y)
      y += 6
    })
    y += 6
  }

  doc.text(`Matched Skills: ${(analysis.matchedSkills || []).join(', ') || 'None'}`, 20, y)
  y += 8
  doc.text(`Missing Skills: ${(analysis.missingSkills || []).join(', ') || 'None'}`, 20, y)
  y += 12

  if (analysis.suggestions?.length) {
    doc.text('Suggestions:', 20, y)
    y += 7
    analysis.suggestions.forEach((s) => {
      const lines = doc.splitTextToSize(`• ${s}`, 170)
      doc.text(lines, 20, y)
      y += lines.length * 6 + 2
    })
  }

  doc.save(`ats-report-${analysis.analysisId || Date.now()}.pdf`)
}
