import { useState, useCallback } from 'react'
import api from '../api'

/**
 * Backend response shape: { success: bool, message: string, data: any }
 * useApi returns the full response object so pages can read res.data
 *
 * IMPORTANT: URLs are passed WITHOUT leading slash so axios uses baseURL correctly.
 * e.g.  get('classes')  not  get('/classes')
 * The helper strips leading slashes automatically.
 */
export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const request = useCallback(async (method, url, body = null, config = {}) => {
    setLoading(true)
    setError(null)
    try {
      // Strip leading slash — axios must resolve URLs relative to baseURL (/api)
      // e.g. baseURL='/api', url='classes' → '/api/classes' ✓
      // If we kept '/classes' axios would use it as an absolute path, bypassing /api
      const cleanUrl = url.replace(/^\/+/, '')
      const response = await api({ method, url: cleanUrl, data: body, ...config })
      return response.data  // { success, message, data }
    } catch (err) {
      const msg = err.message || 'Request failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const get   = useCallback((url, params)    => request('GET',    url, null, { params }), [request])
  const post  = useCallback((url, body, cfg) => request('POST',   url, body, cfg || {}),  [request])
  const put   = useCallback((url, body)      => request('PUT',    url, body),              [request])
  const del   = useCallback((url)            => request('DELETE', url),                    [request])

  return { get, post, put, del, loading, error, setError }
}

export default useApi
