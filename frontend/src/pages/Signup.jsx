import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { signup } from '../services/api'
import { getApiErrorMessage } from '../utils/parseApiError'
import PremiumBackground from '../components/ui/PremiumBackground'
import GlassCard from '../components/ui/GlassCard'
import GlowButton from '../components/ui/GlowButton'

export default function Signup() {
  const [name, setName] = useState('')
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
      const data = await signup(name, email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate(from, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Signup failed. Please try again.'))
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
        <h1 className="text-2xl font-bold text-text-primary mb-2">Create your account</h1>
        <p className="text-text-secondary mb-8">Start analyzing resumes with ResumeIQ</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm py-3 px-4" role="alert">
              {error}
              {error.includes('already registered') && (
                <span className="block mt-2">
                  <Link to="/login" className="underline font-medium">Log in here</Link>
                </span>
              )}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-text-primary">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="input-field mt-1 h-11 px-4"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text-primary">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="input-field mt-1 h-11 px-4"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text-primary">Password (min 6 characters)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="input-field mt-1 h-11 px-4"
              placeholder="••••••••"
            />
          </label>

          <GlowButton type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating account…
              </>
            ) : (
              'Create account'
            )}
          </GlowButton>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}
