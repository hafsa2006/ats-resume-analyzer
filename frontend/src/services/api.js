import axios from 'axios'
import { API_URL, API_BASE_URL, getApiUrl } from '../config/api'

export { API_URL, API_BASE_URL, getApiUrl }
import { withApiRetry } from '../utils/apiRetry'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: import.meta.env.PROD ? 45000 : 30000,
})

export const checkApiHealth = () =>
  withApiRetry(
    () => api.get('/health', { timeout: 15000 }).then((res) => res.data),
    { maxAttempts: import.meta.env.PROD ? 6 : 4, baseDelayMs: 2000 }
  )

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(err)
  }
)

function call(fn) {
  return withApiRetry(fn, {
    maxAttempts: import.meta.env.PROD ? 4 : 2,
    baseDelayMs: import.meta.env.PROD ? 3000 : 1500,
  })
}

export const login = (email, password) =>
  call(() => api.post('/auth/login', { email, password }).then((res) => res.data))

export const signup = (name, email, password) =>
  call(() => api.post('/auth/signup', { name, email, password }).then((res) => res.data))

export const uploadAndAnalyze = (formData) =>
  withApiRetry(
    () =>
      api
        .post('/analysis/run', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        })
        .then((res) => res.data),
    { maxAttempts: import.meta.env.PROD ? 3 : 2, baseDelayMs: 4000 }
  )

export const getHistory = () =>
  call(() => api.get('/analysis/history').then((res) => res.data))

export const getAnalysisById = (id) =>
  call(() => api.get(`/analysis/${id}`).then((res) => res.data))

export const getDashboardStats = () =>
  call(() => api.get('/analysis/stats').then((res) => res.data))

export const getProfile = () =>
  call(() => api.get('/user/profile').then((res) => res.data))

export const updateProfile = (data) =>
  call(() => api.put('/user/profile', data).then((res) => res.data))

export const updatePreferences = (data) =>
  call(() => api.put('/user/preferences', data).then((res) => res.data))

export default api
