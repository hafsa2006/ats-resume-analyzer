import { motion } from 'framer-motion'
import {
  CheckCircle2, XCircle, Lightbulb, TrendingUp, AlertTriangle,
  Target, Brain, MessageSquare, Briefcase,
} from 'lucide-react'
import AtsScoreCard from './AtsScoreCard'
import GlassCard from './ui/GlassCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { getChartTheme, ChartGradients } from '../utils/chartTheme'

const BREAKDOWN_LABELS = {
  keywordMatch: 'Keyword Match',
  skills: 'Skills',
  experience: 'Experience',
  formatting: 'Formatting',
  projects: 'Projects',
}

const BREAKDOWN_COLORS = ['#6366F1', '#8B5CF6', '#22C55E', '#F59E0B', '#06B6D4']

export default function ATSResult({
  atsScore,
  scoreBreakdown = {},
  matchedSkills = [],
  missingSkills = [],
  recommendedKeywords = [],
  suggestions = [],
  parsedResume = {},
  insights = {},
  aiEnhancements = {},
  onExport,
}) {
  const breakdownData = Object.entries(scoreBreakdown).map(([key, value], i) => ({
    name: BREAKDOWN_LABELS[key] || key,
    score: value || 0,
    fill: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length],
  }))

  const { theme } = useTheme()
  const chart = getChartTheme(theme)
  const heatmap = insights?.recruiterHeatmap || []
  const keywordDensity = insights?.keywordDensity || []
  const issues = insights?.issues || {}

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <AtsScoreCard
          atsScore={atsScore}
          compatibilityPercent={insights?.compatibilityPercent}
          onExport={onExport}
        />

        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Score Breakdown
          </h3>
          {breakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={breakdownData} layout="vertical" margin={{ left: 20 }}>
                <ChartGradients />
                <CartesianGrid stroke={chart.grid} strokeDasharray="4 6" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={chart.tick} axisLine={{ stroke: chart.grid }} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={chart.tick} axisLine={{ stroke: chart.grid }} tickLine={false} />
                <Tooltip {...chart.tooltip} />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} animationDuration={900} animationEasing="ease-out">
                  {breakdownData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <motion.div className="space-y-3">
              {Object.entries(BREAKDOWN_LABELS).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">{label}</span>
                    <span className="text-text-primary">{scoreBreakdown[key] ?? '—'}%</span>
                  </div>
                  <div className="h-2 progress-track">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${scoreBreakdown[key] || 0}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Matched Skills ({matchedSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.length ? matchedSkills.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-success/15 text-success text-xs font-medium border border-success/20">{s}</span>
            )) : <p className="text-sm text-text-muted">None identified</p>}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-danger" />
            Missing Skills ({missingSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length ? missingSkills.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-danger/15 text-danger text-xs font-medium border border-danger/20">{s}</span>
            )) : <p className="text-sm text-text-muted">Great match!</p>}
          </div>
        </GlassCard>
      </div>

      {recommendedKeywords.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Recommended Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {recommendedKeywords.map((kw, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs border border-primary/20">{kw}</span>
            ))}
          </div>
        </GlassCard>
      )}

      {(issues.weakVerbs?.length > 0 || issues.missingSections?.length > 0 || issues.keywordStuffing) && (
        <GlassCard className="p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            ATS Issues Detected
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            {issues.weakVerbs?.length > 0 && <li>Weak action verbs: {issues.weakVerbs.join(', ')}</li>}
            {issues.missingMetrics > 0 && <li>{issues.missingMetrics} bullet points lack quantified metrics</li>}
            {issues.missingSections?.length > 0 && <li>Missing sections: {issues.missingSections.join(', ')}</li>}
            {issues.keywordStuffing && <li>Possible keyword stuffing detected</li>}
            {(issues.formattingIssues || []).map((issue, i) => <li key={i}>{issue}</li>)}
          </ul>
        </GlassCard>
      )}

      {heatmap.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Recruiter Attention Heatmap</h3>
          <div className="space-y-2">
            {heatmap.slice(0, 8).map((row) => (
              <div key={row.line} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-6">{row.line}</span>
                <div className="flex-1 h-6 progress-track relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded bg-primary/40"
                    initial={{ width: 0 }}
                    animate={{ width: `${row.attention}%` }}
                    transition={{ duration: 0.8 }}
                  />
                  <span className="absolute inset-0 flex items-center px-2 text-xs text-text-secondary truncate">{row.text}</span>
                </div>
                <span className="text-xs text-primary w-10">{row.attention}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {keywordDensity.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Keyword Density</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {keywordDensity.map((kd) => (
              <motion.div key={kd.keyword} className="flex justify-between items-center p-3 rounded-lg surface-subtle">
                <span className="text-sm text-text-primary">{kd.keyword}</span>
                <span className="text-xs text-text-muted">{kd.count}x ({kd.density}%)</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {parsedResume?.name && (
        <GlassCard className="p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Parsed Resume Profile
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-text-muted">Name:</span> <span className="text-text-primary">{parsedResume.name}</span></div>
            {parsedResume.email && <div><span className="text-text-muted">Email:</span> {parsedResume.email}</div>}
            {parsedResume.phone && <div><span className="text-text-muted">Phone:</span> {parsedResume.phone}</div>}
            <div><span className="text-text-muted">Experience:</span> {parsedResume.experience?.length || 0} entries</div>
            <div><span className="text-text-muted">Projects:</span> {parsedResume.projects?.length || 0}</div>
          </div>
        </GlassCard>
      )}

      {suggestions.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            AI Suggestions
          </h3>
          <ul className="space-y-3">
            {suggestions.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-secondary">
                <span className="text-primary">•</span>{s}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {aiEnhancements?.enhancedBullets?.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-secondary" />
            Stronger Bullet Suggestions
          </h3>
          <div className="space-y-4">
            {aiEnhancements.enhancedBullets.map((b, i) => (
              <div key={i} className="p-4 rounded-xl surface-subtle">
                <p className="text-xs text-text-muted mb-1">{b.role}</p>
                <p className="text-sm text-danger/80 line-through mb-2">{b.original}</p>
                <p className="text-sm text-success">{b.improved}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {aiEnhancements?.interviewQuestions?.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Interview Questions
          </h3>
          <div className="space-y-3">
            {aiEnhancements.interviewQuestions.map((q, i) => (
              <div key={i} className="p-3 rounded-lg surface-subtle">
                <span className="text-xs text-primary font-medium">{q.skill}</span>
                <p className="text-sm text-text-secondary mt-1">{q.question}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {aiEnhancements?.summaryImprovement && (
        <GlassCard className="p-6">
          <h3 className="font-semibold text-text-primary mb-3">Improved Summary</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{aiEnhancements.summaryImprovement}</p>
        </GlassCard>
      )}
    </div>
  )
}
