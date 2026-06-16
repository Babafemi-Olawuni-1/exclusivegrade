import { useState, useCallback } from 'react'
import api from '../api'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api({ method, url, data, ...config })
      return response.data
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Request failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const get    = useCallback((url, params) => request('GET', url, null, { params }), [request])
  const post   = useCallback((url, data, cfg) => request('POST', url, data, cfg), [request])
  const put    = useCallback((url, data) => request('PUT', url, data), [request])
  const del    = useCallback((url) => request('DELETE', url), [request])
  const patch  = useCallback((url, data) => request('PATCH', url, data), [request])

  return { get, post, put, del, patch, loading, error, setError }
}

export default useApi
