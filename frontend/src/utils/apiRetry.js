/** Retryable statuses (Render cold start, gateway timeouts, maintenance) */
const RETRYABLE_STATUS = new Set([502, 503, 504, 429])

export function isRetryableError(err) {
  if (!err) return false
  if (!err.response) {
    return (
      err.code === 'ERR_NETWORK' ||
      err.message === 'Network Error' ||
      err.message?.includes('Network Error')
    )
  }
  return RETRYABLE_STATUS.has(err.response.status) || err.response?.data?.offline === true
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry API calls during cold starts / transient failures.
 * @param {() => Promise<T>} fn
 * @param {{ maxAttempts?: number, baseDelayMs?: number }} options
 */
export async function withApiRetry(fn, options = {}) {
  const maxAttempts = options.maxAttempts ?? (import.meta.env.PROD ? 5 : 3)
  const baseDelayMs = options.baseDelayMs ?? (import.meta.env.PROD ? 2500 : 1500)

  let lastError
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const isLast = attempt >= maxAttempts - 1
      if (!isRetryableError(err) || isLast) {
        throw err
      }
      await sleep(baseDelayMs * (attempt + 1))
    }
  }
  throw lastError
}
