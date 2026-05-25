import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function resolveDevProxyTarget(env, mode) {
  if (env.VITE_DEV_PROXY_TARGET) {
    return env.VITE_DEV_PROXY_TARGET.replace(/\/api\/?$/, '').replace(/\/$/, '')
  }

  const apiOrigin = (env.VITE_API_URL || '')
    .trim()
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '')

  if (apiOrigin) return apiOrigin

  // Local dev: proxy /api → backend when VITE_API_URL is not set
  if (mode === 'development') {
    return 'http://127.0.0.1:5000'
  }

  return null
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = resolveDevProxyTarget(env, mode)

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: proxyTarget
        ? {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
              timeout: 120000,
              configure: (proxy) => {
                proxy.on('error', (err, _req, res) => {
                  if (res && !res.headersSent) {
                    res.writeHead(503, { 'Content-Type': 'application/json' })
                    res.end(
                      JSON.stringify({
                        message: 'Backend unavailable. Start the backend: cd backend && npm run dev',
                        offline: true,
                      })
                    )
                  }
                  console.warn('[vite proxy]', err.code || err.message)
                })
              },
            },
          }
        : undefined,
    },
  }
})
