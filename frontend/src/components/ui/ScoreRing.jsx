import { motion, useSpring, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function ScoreRing({ score, size = 160, label = 'ATS Score' }) {
  const num = Math.min(100, Math.max(0, Number(score) || 0))
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2
  const [display, setDisplay] = useState(0)

  const springScore = useSpring(0, { stiffness: 60, damping: 18 })
  useEffect(() => {
    springScore.set(num)
    const ctrl = animate(0, num, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => ctrl.stop()
  }, [num, springScore])

  const dashOffset = useTransform(springScore, (v) => circumference - (v / 100) * circumference)

  const strokeColor = num >= 80 ? '#22c55e' : num >= 60 ? '#f59e0b' : '#ef4444'
  const glowColor = num >= 80 ? 'rgba(34, 197, 94, 0.35)' : num >= 60 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(239, 68, 68, 0.35)'

  return (
    <motion.div
      className="relative flex flex-col items-center score-ring-wrap"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
    >
      <div
        className="absolute rounded-full score-ring-glow pointer-events-none"
        style={{
          width: size + 24,
          height: size + 24,
          boxShadow: `0 0 48px ${glowColor}, 0 0 80px rgba(99, 102, 241, 0.15)`,
        }}
      />
      <svg width={size} height={size} className="relative -rotate-90" aria-hidden>
        <defs>
          <linearGradient id={`score-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor={strokeColor} />
          </linearGradient>
        </defs>
        <circle cx={center} cy={center} r={radius} fill="none" className="score-track" strokeWidth={stroke} />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#score-gradient-${size})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div
        className="absolute rounded-full bg-card border-4 border-border flex items-center justify-center score-ring-inner"
        style={{ width: size * 0.72, height: size * 0.72 }}
      >
        <span className="text-4xl font-bold text-heading tabular-nums">{display}</span>
        <span className="text-lg text-text-secondary ml-0.5 font-medium">%</span>
      </div>
      {label && <p className="mt-4 text-sm text-label relative z-[1]">{label}</p>}
    </motion.div>
  )
}
