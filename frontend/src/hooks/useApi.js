import { useState, useCallback } from 'react'
import api from '../api'

/**
 * Backend always returns: { success: bool, message: string, data: any }
 * This hook returns res.data (the inner payload) on success.
 * For arrays returned directly, res is the array.
 * For paginated lists, res is { items, total, page, per_page }
 */
export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const request = useCallback(async (method, url, body = null, config = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api({ method, url, data: body, ...config })
      const payload  = response.data   // { success, message, data }

      if (payload?.success === false) {
        throw new Error(payload.message || 'Request failed')
      }

      // Return inner data if wrapped, else whole payload
      return payload?.data !== undefined ? payload.data : payload
    } catch (err) {
      const msg = err.message || 'Request failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const get   = useCallback((url, params)    => request('GET',    url, null, { params }), [request])
  const post  = useCallback((url, body, cfg) => request('POST',   url, body, cfg || {}), [request])
  const put   = useCallback((url, body)      => request('PUT',    url, body),             [request])
  const del   = useCallback((url)            => request('DELETE', url),                   [request])

  return { get, post, put, del, loading, error, setError }
}

export default useApi
