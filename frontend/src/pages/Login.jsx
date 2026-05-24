import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { login } from '../services/api'
import PremiumBackground from '../components/ui/PremiumBackground'
import GlassCard from '../components/ui/GlassCard'
import GlowButton from '../components/ui/GlowButton'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.request ? 'Cannot reach server. Please start the backend.' : err?.message) ||
        'Login failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative">
      <PremiumBackground parallax={false} />
      <GlassCard className="w-full max-w-md p-8" hover={false}>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors">
          ← Back to home
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome back</h1>
        <p className="text-text-secondary mb-8">Sign in to your ResumeIQ account</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm py-3 px-4">{error}</div>}
          <label className="block">
            <span className="text-sm font-medium text-text-primary">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field mt-1 h-11 px-4" placeholder="you@example.com" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-primary">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field mt-1 h-11 px-4" placeholder="••••••••" />
          </label>
          <GlowButton type="submit" disabled={loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in'}
          </GlowButton>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </GlassCard>
    </div>
  )
}
