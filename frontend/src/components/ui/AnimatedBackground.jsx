import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function AnimatedBackground({ variant = 'default' }) {
  const { theme } = useTheme()
  return (
    <motion.div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Grid layer — synced with CSS grid-drift in dark mode */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Soft indigo / purple glow blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full blob-primary blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/4 -right-20 w-80 h-80 rounded-full blob-secondary blur-3xl"
        animate={{ x: [0, -35, 0], y: [0, 45, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 left-1/3 w-72 h-72 rounded-full blob-cyan blur-3xl"
        animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle arc curves — visible in dark mode */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: theme === 'dark' ? 1 : 0 }}
        aria-hidden
      >
        <div
          className="absolute top-[12%] left-[-8%] w-[55%] h-[45%] rounded-full border border-indigo-400/20"
          style={{ animation: 'glow-pulse 10s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-[8%] right-[-6%] w-[50%] h-[40%] rounded-full border border-violet-400/15"
          style={{ animation: 'glow-pulse 12s ease-in-out infinite 2s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,720px)] h-[min(70vh,520px)] rounded-[40%] border border-indigo-500/10" />
      </div>

      {variant === 'hero' && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/95" />
      )}
    </motion.div>
  )
}
