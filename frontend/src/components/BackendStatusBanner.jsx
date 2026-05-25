import { RefreshCw, ServerCrash } from 'lucide-react'
import { useApiHealth } from '../context/ApiHealthContext'

export default function BackendStatusBanner() {
  const { online, checking, retry } = useApiHealth()

  if (!import.meta.env.DEV || online || checking) return null

  return (
    <div
      role="alert"
      className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-danger/30 bg-danger/10"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <ServerCrash className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-text-primary">Backend not reachable</p>
          <p className="text-sm text-text-secondary mt-1">
            From the project root, run{' '}
            <code className="px-1.5 py-0.5 rounded bg-black/20 text-primary text-xs font-mono">
              npm run dev
            </code>{' '}
            to start both servers. Or run{' '}
            <code className="px-1.5 py-0.5 rounded bg-black/20 text-primary text-xs font-mono">
              npm run dev --prefix backend
            </code>{' '}
            in a separate terminal.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={retry}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors shrink-0"
      >
        <RefreshCw className="w-4 h-4" />
        Retry connection
      </button>
    </div>
  )
}
