import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('gg_token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('gg_user')
    return stored ? JSON.parse(stored) : null
  })
  const [school, setSchool] = useState(() => {
    const stored = localStorage.getItem('gg_school')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = (data) => {
    localStorage.setItem('gg_token', data.token)
    localStorage.setItem('gg_user', JSON.stringify(data.user))
    if (data.school) localStorage.setItem('gg_school', JSON.stringify(data.school))
    setToken(data.token)
    setUser(data.user)
    if (data.school) setSchool(data.school)
  }

  const logout = () => {
    localStorage.removeItem('gg_token')
    localStorage.removeItem('gg_user')
    localStorage.removeItem('gg_school')
    setToken(null)
    setUser(null)
    setSchool(null)
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('gg_user', JSON.stringify(updated))
    setUser(updated)
  }

  const isAuthenticated = !!token && !!user
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const isTeacher = user?.role === 'teacher'
  const isSuper = user?.role === 'super_admin'

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        school,
        loading,
        setLoading,
        login,
        logout,
        updateUser,
        isAuthenticated,
        isAdmin,
        isTeacher,
        isSuper,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
} 
