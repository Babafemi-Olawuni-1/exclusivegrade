import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gg_user')) } catch { return null }
  })
  const [school, setSchool] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gg_school')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('gg_token') || null)

  // data = { token, user, school }
  const login = useCallback((data) => {
    if (!data) return
    if (data.token) {
      localStorage.setItem('gg_token', data.token)
      setToken(data.token)
    }
    if (data.user) {
      localStorage.setItem('gg_user', JSON.stringify(data.user))
      setUser(data.user)
    }
    if (data.school) {
      localStorage.setItem('gg_school', JSON.stringify(data.school))
      setSchool(data.school)
    }
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

  const isAuthenticated = !!token
  const isAdmin   = user?.role === 'school_admin' || user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isSuper   = user?.role === 'super_admin'

  return (
    <AuthContext.Provider value={{
      user, school, token,
      login, logout, updateUser,
      isAuthenticated, isAdmin, isTeacher, isSuper,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
