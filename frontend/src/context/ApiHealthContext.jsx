import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { checkApiHealth } from '../services/api'

const ApiHealthContext = createContext({
  online: true,
  checking: false,
  retry: () => {},
})

const MAX_RETRIES = import.meta.env.PROD ? 8 : 5
const RETRY_DELAY_MS = import.meta.env.PROD ? 3000 : 1500
const POLL_MS = import.meta.env.PROD ? 45000 : 20000

export function ApiHealthProvider({ children }) {
  const [online, setOnline] = useState(false)
  const [checking, setChecking] = useState(true)

  const runCheck = useCallback(async () => {
    setChecking(true)
    for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
      try {
        await checkApiHealth()
        setOnline(true)
        setChecking(false)
        return true
      } catch {
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
        }
      }
    }
    setOnline(false)
    setChecking(false)
    return false
  }, [])

  useEffect(() => {
    runCheck()
    const interval = setInterval(runCheck, POLL_MS)
    return () => clearInterval(interval)
  }, [runCheck])

  return (
    <ApiHealthContext.Provider value={{ online, checking, retry: runCheck }}>
      {children}
    </ApiHealthContext.Provider>
  )
}

export function useApiHealth() {
  return useContext(ApiHealthContext)
}
