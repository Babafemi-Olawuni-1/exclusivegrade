// Dev:  VITE_API_URL=/api  (proxied by Vite to XAMPP, no CORS)
// Prod: VITE_API_URL=https://yourdomain.com/backend/api
export const API_URL  = import.meta.env.VITE_API_URL  || '/api'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ExclusiveGrades'
export const APP_ENV  = import.meta.env.VITE_APP_ENV  || 'development'

export default { API_URL, APP_NAME, APP_ENV }
