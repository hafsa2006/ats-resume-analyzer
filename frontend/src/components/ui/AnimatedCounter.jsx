import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export default function AnimatedCounter({ value, suffix = '', duration = 1.5 }) {
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (v) => Math.round(v))
  const [shown, setShown] = useState(0)

  useEffect(() => {
    spring.set(value)
    return display.on('change', (v) => setShown(v))
  }, [value, spring, display])

  return (
    <motion.span className="tabular-nums">
      {shown}{suffix}
    </motion.span>
  )
}
