import axios from 'axios'
import { API_URL } from '../config'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gg_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Unwrap the backend's { success, message, data } envelope
// so callers get the inner data directly
api.interceptors.response.use(
  (response) => {
    const body = response.data
    // Backend returns { success: true, message: '...', data: {...} }
    // We unwrap it so every caller gets the inner data merged with success/message
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject(new Error(body.message || 'Request failed'))
      }
      // Merge top-level fields with data fields so both res.token and res.data.token work
      response.data = { ...body, ...(body.data || {}) }
    }
    return response
  },
  (error) => {
    const msg = error.response?.data?.message || error.message || 'Request failed'
    // Auto-logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('gg_token')
      localStorage.removeItem('gg_user')
      localStorage.removeItem('gg_school')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(new Error(msg))
  }
)

export default api
