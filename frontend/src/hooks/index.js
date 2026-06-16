import { useState, useCallback } from 'react'
import { useApi } from './useApi'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const api = useApi()

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/auth/login', { email, password })
      if (response.success) {
        localStorage.setItem('gg_token', response.data.token)
        localStorage.setItem('gg_user', JSON.stringify(response.data.user))
        if (response.data.school) {
          localStorage.setItem('gg_school', JSON.stringify(response.data.school))
        }
        return response.data
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [api])

  const register = useCallback(async (schoolData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/auth/register', schoolData)
      if (response.success) {
        return response.data
      } else {
        setError(response.message || 'Registration failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [api])

  const logout = useCallback(() => {
    localStorage.removeItem('gg_token')
    localStorage.removeItem('gg_user')
    localStorage.removeItem('gg_school')
  }, [])

  return { login, register, logout, loading, error }
}

export function useAsyncData(asyncFn, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [asyncFn])

  useCallback(() => {
    refetch()
  }, dependencies)

  return { data, loading, error, refetch }
}

export function usePagination(items, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return {
    paginatedItems,
    currentPage,
    totalPages,
    setCurrentPage,
  }
}
