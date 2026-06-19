import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gg_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [school, setSchool] = useState(() => {
    try {
      const saved = localStorage.getItem('gg_school')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('gg_token') || null)

  const login = (data) => {
    if (!data) return

    const tokenValue = data.token
    const userValue = data.user
    const schoolValue = data.school

    if (tokenValue) {
      localStorage.setItem('gg_token', tokenValue)
      setToken(tokenValue)
    }

    if (userValue) {
      localStorage.setItem('gg_user', JSON.stringify(userValue))
      setUser(userValue)
    }

    if (schoolValue) {
      localStorage.setItem('gg_school', JSON.stringify(schoolValue))
      setSchool(schoolValue)
    }
  }

  const logout = () => {
    localStorage.removeItem('gg_token')
    localStorage.removeItem('gg_user')
    localStorage.removeItem('gg_school')
    setToken(null)
    setUser(null)
    setSchool(null)
  }

  return (
    <AuthContext.Provider value={{ user, school, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}