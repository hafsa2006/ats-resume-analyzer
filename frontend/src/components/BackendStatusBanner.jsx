import { Loader2, RefreshCw, Server } from 'lucide-react'
import { useApiHealth } from '../context/ApiHealthContext'
import { SERVER_WAKING_MSG, SERVER_UNAVAILABLE_MSG } from '../utils/parseApiError'

export default function BackendStatusBanner() {
  const { online, checking, retry } = useApiHealth()

  if (online && !checking) return null

  const isWaking = checking
  const message = isWaking ? SERVER_WAKING_MSG : SERVER_UNAVAILABLE_MSG

  return (
    <div
      role="status"
      className={`mb-6 flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border ${
        isWaking
          ? 'border-primary/25 bg-primary/5'
          : 'border-warning/30 bg-warning/10'
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {isWaking ? (
          <Loader2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 animate-spin" aria-hidden />
        ) : (
          <Server className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" aria-hidden />
        )}
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {isWaking ? 'Connecting to server' : 'Server temporarily unavailable'}
          </p>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      {!isWaking && (
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  )
}
