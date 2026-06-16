import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Allow super_admin access to admin routes
    if (requiredRole === 'admin' && user?.role === 'super_admin') {
      return children
    }
    // Redirect to appropriate dashboard
    if (user?.role === 'super_admin') return <Navigate to="/super" replace />
    if (user?.role === 'admin') return <Navigate to="/admin" replace />
    if (user?.role === 'teacher') return <Navigate to="/teacher" replace />
    return <Navigate to="/" replace />
  }

  return children
}
