import { useState, useCallback } from 'react'
import api from '../api'

// Backend response shape: { success: bool, message: string, data: any }
// useApi always returns res.data (the inner payload)
// so callers do:  const res = await get('/classes')  → res is the `data` value
// For list endpoints that return an array directly, res is that array
// For paginated endpoints, res is { items, total, page, ... }

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const request = useCallback(async (method, url, body = null, config = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api({ method, url, data: body, ...config })
      const payload = response.data  // { success, message, data }
      if (payload && payload.success === false) {
        throw new Error(payload.message || 'Request failed')
      }
      // Return the inner `data` field if it exists, otherwise the whole payload
      return payload?.data !== undefined ? payload.data : payload
    } catch (err) {
      const msg = err.message || 'Request failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const get   = useCallback((url, params)       => request('GET',    url, null, { params }), [request])
  const post  = useCallback((url, body, cfg)    => request('POST',   url, body, cfg || {}), [request])
  const put   = useCallback((url, body)         => request('PUT',    url, body),             [request])
  const del   = useCallback((url)               => request('DELETE', url),                   [request])
  const patch = useCallback((url, body)         => request('PATCH',  url, body),             [request])

  return { get, post, put, del, patch, loading, error, setError }
}

export default useApi
