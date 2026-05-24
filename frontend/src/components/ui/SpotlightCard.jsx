import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function SpotlightCard({
  children,
  className = '',
  hover = true,
  as: Component = motion.div,
  ...props
}) {
  const ref = useRef(null)
  const [spot, setSpot] = useState({ x: 50, y: 50, opacity: 0 })

  const onMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 1,
    })
  }, [])

  const onLeave = useCallback(() => {
    setSpot((s) => ({ ...s, opacity: 0 }))
  }, [])

  return (
    <Component
      ref={ref}
      className={`spotlight-card glass-card rounded-2xl relative overflow-hidden ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={hover ? { y: -5, scale: 1.008, transition: { duration: 0.25 } } : undefined}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      <div
        className="spotlight-layer pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: spot.opacity,
          background: `radial-gradient(520px circle at ${spot.x}% ${spot.y}%, rgba(99, 102, 241, 0.14), transparent 42%)`,
        }}
      />
      <div className="relative z-[1]">{children}</div>
    </Component>
  )
}
