import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

export const checkApiHealth = () =>
  api.get('/health', { timeout: 5000 }).then((res) => res.data)

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

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((res) => res.data)

export const signup = (name, email, password) =>
  api.post('/auth/signup', { name, email, password }).then((res) => res.data)

export const uploadAndAnalyze = (formData) =>
  api.post('/analysis/run', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }).then((res) => res.data)

export const getHistory = () =>
  api.get('/analysis/history').then((res) => res.data)

export const getAnalysisById = (id) =>
  api.get(`/analysis/${id}`).then((res) => res.data)

export const getDashboardStats = () =>
  api.get('/analysis/stats').then((res) => res.data)

export const getProfile = () =>
  api.get('/user/profile').then((res) => res.data)

export const updateProfile = (data) =>
  api.put('/user/profile', data).then((res) => res.data)

export const updatePreferences = (data) =>
  api.put('/user/preferences', data).then((res) => res.data)

export default api
