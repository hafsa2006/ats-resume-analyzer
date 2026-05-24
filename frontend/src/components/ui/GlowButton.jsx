import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function GlowButton({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}) {
  const base =
    'relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed btn-premium'

  const variants = {
    primary: 'btn-glow-primary',
    outline: 'btn-outline',
    ghost: 'text-text-secondary hover:text-text-primary nav-link !px-4 !py-2',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  const inner = (
    <>
      {variant === 'primary' && (
        <span className="absolute inset-0 rounded-xl btn-bloom opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
      <span className="relative z-[1]">{children}</span>
    </>
  )

  const motionProps = {
    whileHover: disabled ? undefined : { scale: 1.03, y: -1 },
    whileTap: disabled ? undefined : { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 22 },
  }

  if (to) {
    return (
      <motion.div {...motionProps}>
        <Link to={to} className={classes}>{inner}</Link>
      </motion.div>
    )
  }

  if (href) {
    return (
      <motion.a href={href} className={classes} {...motionProps}>
        {inner}
      </motion.a>
    )
  }

  return (
    <motion.button type={type} onClick={onClick} disabled={disabled} className={classes} {...motionProps}>
      {inner}
    </motion.button>
  )
}
