import { PDF_PARSE_MESSAGE } from '../components/PdfParseErrorAlert'
import { isRetryableError } from './apiRetry'

/** User-facing copy — safe for production */
export const SERVER_WAKING_MSG =
  'Server is waking up. Please wait a few seconds and try again.'

export const SERVER_UNAVAILABLE_MSG =
  'Unable to reach the server right now. Please wait a moment and try again.'

export const SERVER_TIMEOUT_MSG =
  'This is taking longer than usual. The server may be starting up — please try again in a moment.'

export const DB_UNAVAILABLE_MSG =
  'Our database is reconnecting. Please wait a few seconds and try again.'

export const GENERIC_ERROR_MSG = 'Something went wrong. Please try again.'

export const NOT_FOUND_MSG =
  'The requested resource was not found. Please refresh the page and try again.'

/** Shown only in local development (never in production builds) */
export function getDevBackendHint() {
  if (!import.meta.env.DEV) return null
  return 'Local tip: run npm run dev from the project root to start both servers.'
}

export function isNetworkError(err) {
  return (
    !err?.response &&
    (err?.code === 'ERR_NETWORK' ||
      err?.message === 'Network Error' ||
      err?.message?.includes('Network Error'))
  )
}

export function isServerUnavailable(err) {
  return isRetryableError(err) || isNetworkError(err)
}

/** @deprecated use isServerUnavailable */
export const isBackendOffline = isServerUnavailable

export function isColdStartError(err) {
  return (
    isServerUnavailable(err) ||
    err?.code === 'ECONNABORTED' ||
    err?.response?.status === 502 ||
    err?.response?.status === 503
  )
}

export function isPdfParseError(err) {
  return (
    err?.response?.status === 422 &&
    (err?.response?.data?.code === 'PDF_PARSE_FAILED' ||
      err?.response?.data?.message?.includes('Unable to process this PDF'))
  )
}

export function isDbUnavailable(err) {
  return err?.response?.data?.code === 'DB_UNAVAILABLE'
}

function sanitizeTechnicalMessage(message) {
  if (!message || typeof message !== 'string') return null
  const lower = message.toLowerCase()
  if (
    lower.includes('network error') ||
    lower.includes('econnrefused') ||
    lower.includes('npm run') ||
    lower.includes('vite_api') ||
    lower.includes('localhost') ||
    lower.includes('backend unavailable') ||
    lower.includes('status code')
  ) {
    return null
  }
  return message
}

export function getServerStatusMessage({ checking = false, online = true } = {}) {
  if (checking || !online) return SERVER_WAKING_MSG
  return null
}

export function getApiErrorMessage(err, fallback = GENERIC_ERROR_MSG) {
  if (isPdfParseError(err)) {
    return err.response?.data?.message || PDF_PARSE_MESSAGE
  }

  if (isDbUnavailable(err)) {
    return err.response?.data?.message || DB_UNAVAILABLE_MSG
  }

  if (err?.response?.status === 404) {
    return sanitizeTechnicalMessage(err.response?.data?.message) || NOT_FOUND_MSG
  }

  if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
    return SERVER_TIMEOUT_MSG
  }

  if (isColdStartError(err)) {
    const apiMsg = sanitizeTechnicalMessage(err.response?.data?.message)
    return apiMsg || SERVER_WAKING_MSG
  }

  if (isServerUnavailable(err)) {
    const apiMsg = sanitizeTechnicalMessage(err.response?.data?.message)
    return apiMsg || SERVER_UNAVAILABLE_MSG
  }

  const apiMsg = sanitizeTechnicalMessage(err?.response?.data?.message)
  if (apiMsg) return apiMsg

  const devHint = getDevBackendHint()
  if (import.meta.env.DEV && devHint) {
    return `${fallback} ${devHint}`
  }

  return fallback
}
