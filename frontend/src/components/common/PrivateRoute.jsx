import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole) {
    const role = user?.role
    // 'admin' route accepts both 'admin' and 'school_admin'
    const adminRoles = ['admin', 'school_admin', 'super_admin']

    if (requiredRole === 'admin' && adminRoles.includes(role)) return children
    if (requiredRole === 'super_admin' && role === 'super_admin') return children
    if (requiredRole === 'teacher' && role === 'teacher') return children

    // Wrong role — redirect to correct dashboard
    if (role === 'super_admin')           return <Navigate to="/super" replace />
    if (role === 'admin' || role === 'school_admin') return <Navigate to="/admin" replace />
    if (role === 'teacher')               return <Navigate to="/teacher" replace />
    return <Navigate to="/" replace />
  }

  return children
}
