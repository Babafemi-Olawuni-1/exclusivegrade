import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('gg_token'))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gg_user')) } catch { return null }
  })
  const [school, setSchool] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gg_school')) } catch { return null }
  })

  const login = useCallback((data) => {
    localStorage.setItem('gg_token', data.token)
    localStorage.setItem('gg_user', JSON.stringify(data.user))
    if (data.school) localStorage.setItem('gg_school', JSON.stringify(data.school))
    setToken(data.token)
    setUser(data.user)
    if (data.school) setSchool(data.school)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('gg_token')
    localStorage.removeItem('gg_user')
    localStorage.removeItem('gg_school')
    setToken(null)
    setUser(null)
    setSchool(null)
  }, [])

  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('gg_user', JSON.stringify(updated))
    setUser(updated)
  }, [user])

  const updateSchool = useCallback((updates) => {
    const updated = { ...school, ...updates }
    localStorage.setItem('gg_school', JSON.stringify(updated))
    setSchool(updated)
  }, [school])

  const isAuthenticated = !!token && !!user
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const isTeacher = user?.role === 'teacher'
  const isSuper = user?.role === 'super_admin'

  return (
    <AuthContext.Provider value={{
      token, user, school,
      login, logout, updateUser, updateSchool,
      isAuthenticated, isAdmin, isTeacher, isSuper,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
