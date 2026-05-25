import { FileDown } from 'lucide-react'
import GlassCard from './ui/GlassCard'
import ScoreRing from './ui/ScoreRing'

export default function AtsScoreCard({ atsScore, compatibilityPercent, onExport }) {
  const compat = compatibilityPercent ?? atsScore

  return (
    <GlassCard className="ats-score-card lg:col-span-1" hover>
      <div className="ats-score-stack">
        <div className="ats-score-ring-box" aria-label={`ATS score ${atsScore} percent`}>
          <ScoreRing score={atsScore} />
        </div>

        <div className="ats-score-meta">
          <p className="ats-score-title">ATS Score</p>
          <p className="ats-score-compat">
            <span className="ats-score-compat-label">Compatibility</span>
            <span className="ats-score-compat-value">{compat}%</span>
          </p>
        </div>

        {onExport && (
          <button type="button" onClick={onExport} className="ats-score-export">
            <FileDown className="w-4 h-4" aria-hidden />
            Export PDF Report
          </button>
        )}
      </div>
    </GlassCard>
  )
}
