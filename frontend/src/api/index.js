import axios from 'axios'
import { API_URL } from '../config'

// Ensure baseURL ends with / so axios appends relative URLs correctly
// e.g. baseURL='/api/' + url='classes' = '/api/classes' (hits Vite proxy)
const baseURL = API_URL.endsWith('/') ? API_URL : API_URL + '/'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gg_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Normalize errors; auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || error.message || 'Request failed'
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
