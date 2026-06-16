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
    
    const response = await fetch(API_BASE_URL + path, options)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Request failed')
    }
    
    return data
  }

  const get = (path) => request('GET', path)
  const post = (path, body) => request('POST', path, body)
  const put = (path, body) => request('PUT', path, body)
  const del = (path) => request('DELETE', path)

  return { get, post, put, del }
}