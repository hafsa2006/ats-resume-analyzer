import { motion, useSpring, useTransform, animate } from 'framer-motion'
import { useEffect, useState, useId } from 'react'

const VIEW = 220
const STROKE = 11
const RADIUS = (VIEW - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const CENTER = VIEW / 2
const INNER_SIZE = VIEW * 0.58

function scoreAccent(num) {
  if (num >= 80) return { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.45)' }
  if (num >= 60) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' }
  return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' }
}

export default function ScoreRing({ score, showLabel = false, label = 'ATS Score' }) {
  const uid = useId().replace(/:/g, '')
  const gradientId = `score-grad-${uid}`
  const glowId = `score-glow-${uid}`

  const num = Math.min(100, Math.max(0, Number(score) || 0))
  const { stroke: accentStroke, glow: accentGlow } = scoreAccent(num)
  const [display, setDisplay] = useState(0)

  const springScore = useSpring(0, { stiffness: 55, damping: 20 })
  useEffect(() => {
    springScore.set(num)
    const ctrl = animate(0, num, {
      duration: 1.35,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => ctrl.stop()
  }, [num, springScore])

  const dashOffset = useTransform(springScore, (v) => CIRCUMFERENCE - (v / 100) * CIRCUMFERENCE)

  return (
    <motion.div
      className="score-ring-root group w-full h-full"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative w-full h-full aspect-square">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="w-full h-full block -rotate-90"
          aria-hidden
          role="img"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="55%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor={accentStroke} />
            </linearGradient>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            className="score-track"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            filter={`url(#${glowId})`}
            className="score-ring-progress"
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="score-ring-inner rounded-full flex items-center justify-center border border-border/80"
            style={{ width: `${(INNER_SIZE / VIEW) * 100}%`, height: `${(INNER_SIZE / VIEW) * 100}%` }}
          >
            <div className="flex items-baseline justify-center leading-none tabular-nums">
              <span className="text-[2.75rem] md:text-[3.25rem] font-bold text-heading tracking-tight">
                {display}
              </span>
              <span className="text-lg md:text-xl font-semibold text-text-secondary ml-0.5">%</span>
            </div>
          </div>
        </div>
      </div>

      {showLabel && (
        <p className="mt-4 text-center text-sm font-medium text-label tracking-wide">{label}</p>
      )}
    </motion.div>
  )
}
