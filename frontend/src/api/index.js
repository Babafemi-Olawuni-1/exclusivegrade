import axios from 'axios'
import { API_URL } from '../config'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gg_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response: backend always returns { success, message, data }
// We pass response.data straight through — pages read res.data.xxx
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.message ||
      'Request failed'

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
