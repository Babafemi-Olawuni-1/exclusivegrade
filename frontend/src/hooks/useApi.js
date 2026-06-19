import { API_BASE_URL } from '../config'

export function useApi() {
  const getToken = () => {
    return localStorage.getItem('gg_token')
  }

  const request = async (method, path, body = null) => {
    const token = getToken()
    
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
    }
    
    const options = {
      method: method,
      headers: headers
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    try {
      // Remove leading slash if present
      let cleanPath = path.startsWith('/') ? path.substring(1) : path
      
      // Path already includes query params like ?id=5
      const url = API_BASE_URL + cleanPath
      
      console.log('API Request:', method, url, body)
      
      const response = await fetch(url, options)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('API Response:', data)
      return data
    } catch (error) {
      console.error(`API Error ${method} ${path}:`, error)
      throw error
    }
  }

  const get = (path) => request('GET', path)
  const post = (path, body) => request('POST', path, body)
  const put = (path, body) => request('PUT', path, body)
  const del = (path) => request('DELETE', path)

  return { get, post, put, del }
}