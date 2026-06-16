// In development: VITE_API_URL=/api  (proxied by Vite to XAMPP, solves CORS)
// In production:  VITE_API_URL=https://yourdomain.com/backend/api
const API_URL  = import.meta.env.VITE_API_URL  || '/api'
const APP_NAME = import.meta.env.VITE_APP_NAME || 'ExclusiveGrades'
const APP_ENV  = import.meta.env.VITE_APP_ENV  || 'development'

export { API_URL, APP_NAME, APP_ENV }
export default { API_URL, APP_NAME, APP_ENV }
