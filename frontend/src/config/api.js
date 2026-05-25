/**
 * Backend API origin (no trailing slash).
 * Set VITE_API_URL in .env / .env.production or Vercel project settings.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? ''

/** Fallback when production build runs without VITE_API_URL (e.g. missing Vercel env) */
const PRODUCTION_API_ORIGIN = 'https://ats-resume-backend-k5ru.onrender.com'

function getApiOrigin() {
  const fromEnv = API_URL.trim()
  if (fromEnv) return fromEnv.replace(/\/+$/, '')

  if (import.meta.env.PROD) {
    return PRODUCTION_API_ORIGIN
  }

  return ''
}

function resolveApiBaseUrl() {
  const origin = getApiOrigin()
  if (!origin) return '/api'

  if (origin.endsWith('/api')) {
    return origin
  }
  return `${origin}/api`
}

/** Axios base URL → ${API_URL}/api */
export const API_BASE_URL = resolveApiBaseUrl()

/**
 * Full URL for fetch: `${API_URL}/api/...`
 * @param {string} path - e.g. "/auth/login"
 */
export function getApiUrl(path = '') {
  const segment = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${segment}`
}
