import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Menu, X } from 'lucide-react'
import GlowButton from '../ui/GlowButton'

const navLinks = [
  { href: '#engine', label: 'Engine' },
  { href: '#features', label: 'Features' },
  { href: '#intelligence', label: 'Intelligence' },
  { href: '#recruiter', label: 'Recruiter view' },
  { href: '#roadmap', label: 'Roadmap' },
]

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const token = localStorage.getItem('token')

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card rounded-2xl px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </span>
          <span className="font-bold text-text-primary">ResumeIQ</span>
        </Link>

        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          {token ? (
            <GlowButton to="/dashboard">Dashboard</GlowButton>
          ) : (
            <>
              <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary">Login</Link>
              <GlowButton to="/signup">Get Started</GlowButton>
            </>
          )}
        </div>

        <button type="button" className="lg:hidden p-2 text-text-primary" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mt-2 glass-card rounded-2xl p-4 flex flex-col gap-3"
        >
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-sm text-text-secondary">
              {link.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
          <GlowButton to="/signup">Get Started</GlowButton>
        </motion.div>
      )}
    </motion.nav>
  )
}
