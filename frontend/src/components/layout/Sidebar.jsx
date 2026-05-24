import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, FileSearch, Lightbulb, History, Settings, LogOut,
  Sparkles, Menu, X, Moon, Sun,
} from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyzer', icon: FileSearch, label: 'Analyzer' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  })()

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const navContent = (
    <>
      <Link to="/dashboard" className="flex items-center gap-3 px-2 mb-8 group">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
          <Sparkles className="w-5 h-5 text-white" />
        </span>
        <div>
          <span className="font-semibold text-text-primary block">ResumeIQ</span>
          <span className="text-xs text-text-muted">AI Intelligence</span>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-border space-y-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="nav-link w-full"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl surface-muted mx-0 my-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-glow">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="nav-link w-full hover:!text-danger hover:!bg-danger/10"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl glass-card text-text-primary"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-border sidebar-panel p-4">
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'var(--overlay)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 sidebar-panel border-r border-border p-4 flex flex-col shadow-soft-lg">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="self-end p-2 rounded-lg nav-link !w-auto"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}
