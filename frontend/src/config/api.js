/**
 * Backend origin for API requests (no trailing slash, no /api suffix).
 * Production (Vercel): VITE_API_URL=https://your-app.onrender.com
 * Local dev: set VITE_API_URL in .env.local, or leave unset to use Vite /api proxy
 */
export const API_URL = import.meta.env.VITE_API_URL ?? ''

function resolveApiBaseUrl() {
  const raw = API_URL.trim()
  if (!raw) return '/api'

  const withoutTrailingSlash = raw.replace(/\/+$/, '')
  // Support VITE_API_URL with or without /api suffix
  if (withoutTrailingSlash.endsWith('/api')) {
    return withoutTrailingSlash
  }
  return `${withoutTrailingSlash}/api`
}

/** Base path for axios: ${API_URL}/api */
export const API_BASE_URL = resolveApiBaseUrl()

/**
 * Build a full API URL for fetch requests.
 * @param {string} path - e.g. "/auth/login" or "analysis/run"
 */
export function getApiUrl(path = '') {
  const segment = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${segment}`
}
