import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  })()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setMobileOpen(false)
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const linkClass = 'px-4 py-2 rounded-lg text-text-secondary text-body transition-colors hover:text-text-primary hover:bg-white/5 block md:inline-block'
  const navLinks = token ? (
    <>
      <Link to="/dashboard" onClick={() => setMobileOpen(false)} className={linkClass}>Dashboard</Link>
      <Link to="/analyzer" onClick={() => setMobileOpen(false)} className={linkClass}>Analyze Resume</Link>
      <Link to="/dashboard" onClick={() => setMobileOpen(false)} className={linkClass}>History</Link>
    </>
  ) : (
    <>
      <Link to="/login" onClick={() => setMobileOpen(false)} className={linkClass}>Login</Link>
      <Link to="/signup" onClick={() => setMobileOpen(false)} className={linkClass}>Sign up</Link>
    </>
  )

  return (
    <nav className="sticky top-0 z-50 h-[72px] flex items-center justify-between px-6 md:px-8 bg-surface/80 border-b border-border backdrop-blur-nav">
      <Link
        to={token ? '/analyzer' : '/'}
        className="flex items-center gap-2 text-text-primary font-semibold text-card-title no-underline transition-opacity hover:opacity-90"
      >
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
          A
        </span>
        <span className="hidden sm:inline">ATS Resume Analyzer</span>
        <span className="sm:hidden">ATS</span>
      </Link>

      <div className="hidden md:flex items-center gap-1">
        {navLinks}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg text-text-primary hover:bg-white/5"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

      {token ? (
        <>
          <div
            className="hidden md:flex w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 items-center justify-center text-white text-caption font-semibold shrink-0"
            title={user?.name || 'User'}
          >
            {initials}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="hidden md:block px-4 py-2 rounded-lg border border-border text-text-secondary text-caption transition-all hover:text-text-primary hover:border-text-muted hover:bg-white/5"
          >
            Logout
          </button>
        </>
      ) : (
        <Link
          to="/signup"
          className="hidden md:inline-flex px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-caption font-medium transition-transform hover:scale-[1.02] hover:shadow-glow"
        >
          Get started
        </Link>
      )}
      </div>

      {mobileOpen && (
        <div className="absolute top-[72px] left-0 right-0 md:hidden bg-surface border-b border-border shadow-soft-lg py-4 px-6 flex flex-col gap-2 animate-fade-in">
          {navLinks}
          {token ? (
            <>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-white text-caption font-semibold my-2">
                {initials}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-text-secondary text-body text-left border-t border-border pt-4 mt-2 hover:text-text-primary hover:bg-white/5"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/signup" onClick={() => setMobileOpen(false)} className="px-4 py-2 font-medium text-primary">
              Get started
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
