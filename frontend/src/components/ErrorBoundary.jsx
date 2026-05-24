import { Component } from 'react'
import { Link } from 'react-router-dom'
import GlowButton from './ui/GlowButton'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="glass-card rounded-2xl p-8 max-w-md text-center">
            <h1 className="text-xl font-bold text-text-primary mb-2">Something went wrong</h1>
            <p className="text-text-secondary text-sm mb-6">{this.state.error?.message}</p>
            <GlowButton onClick={() => window.location.reload()}>Retry</GlowButton>
            <Link to="/" className="block mt-4 text-sm text-primary">Go home</Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
