import { PDF_PARSE_MESSAGE } from '../components/PdfParseErrorAlert'

export const BACKEND_OFFLINE_MSG =
  'Cannot reach the API server. Open a second terminal and run: cd backend && npm run dev'

export function isNetworkError(err) {
  return (
    !err?.response &&
    (err?.code === 'ERR_NETWORK' ||
      err?.message === 'Network Error' ||
      err?.message?.includes('Network Error'))
  )
}

export function isBackendOffline(err) {
  return (
    isNetworkError(err) ||
    err?.response?.status === 503 ||
    err?.response?.data?.offline === true
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

export function getApiErrorMessage(err, fallback = 'Something went wrong.') {
  if (isPdfParseError(err)) {
    return err.response?.data?.message || PDF_PARSE_MESSAGE
  }
  if (isDbUnavailable(err)) {
    return err.response?.data?.message || 'Database is temporarily unavailable. Please try again.'
  }
  if (isBackendOffline(err)) {
    return err.response?.data?.message || BACKEND_OFFLINE_MSG
  }
  if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
    return 'Request timed out. The server may still be processing — try again or restart the backend.'
  }
  return err?.response?.data?.message || err?.message || fallback
}
