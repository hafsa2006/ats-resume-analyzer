import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'

function NeuralMesh() {
  const lines = []
  for (let i = 0; i < 12; i++) {
    const y = 8 + i * 7
    lines.push(
      <line
        key={`h-${i}`}
        x1="0"
        y1={`${y}%`}
        x2="100%"
        y2={`${y + 3}%`}
        className="neural-line"
      />
    )
  }
  for (let i = 0; i < 10; i++) {
    const x = 10 + i * 9
    lines.push(
      <line
        key={`v-${i}`}
        x1={`${x}%`}
        y1="0"
        x2={`${x - 2}%`}
        y2="100%"
        className="neural-line"
      />
    )
  }
  return (
    <svg className="absolute inset-0 w-full h-full neural-mesh" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="neural-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.15)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0.08)" />
        </linearGradient>
      </defs>
      {lines}
      {[...Array(24)].map((_, i) => (
        <circle
          key={`n-${i}`}
          cx={`${12 + (i * 17) % 76}%`}
          cy={`${15 + (i * 23) % 70}%`}
          r="1.2"
          className="neural-node"
        />
      ))}
    </svg>
  )
}

export default function PremiumBackground({ variant = 'default', parallax = true }) {
  const { theme } = useTheme()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 40, damping: 28 })
  const sy = useSpring(my, { stiffness: 40, damping: 28 })

  useEffect(() => {
    if (!parallax) return
    const onMove = (e) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      mx.set((e.clientX - cx) / cx * 12)
      my.set((e.clientY - cy) / cy * 12)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [parallax, mx, my])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div className="absolute inset-0 grid-bg-premium" style={{ x: sx, y: sy }} />
      <NeuralMesh />
      <motion.div
        className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full glow-orb glow-orb-indigo"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        style={{ x: sx, y: sy }}
      />
      <motion.div
        className="absolute top-1/4 -right-32 w-96 h-96 rounded-full glow-orb glow-orb-violet"
        animate={{ x: [0, -25, 0], y: [0, 35, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full glow-orb glow-orb-blue"
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      {theme === 'dark' && (
        <>
          <div className="absolute top-[15%] left-[-5%] w-[50%] h-[42%] rounded-full border border-indigo-400/15 arc-ring" />
          <div className="absolute bottom-[10%] right-[-4%] w-[45%] h-[38%] rounded-full border border-violet-400/12 arc-ring arc-ring-delay" />
        </>
      )}
      {variant === 'hero' && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/25 to-background/95" />
      )}
    </div>
  )
}
