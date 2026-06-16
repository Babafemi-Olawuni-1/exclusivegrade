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

// Normalize responses and handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gg_token')
      localStorage.removeItem('gg_user')
      localStorage.removeItem('gg_school')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
