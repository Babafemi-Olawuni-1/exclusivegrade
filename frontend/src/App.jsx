import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Help from './pages/Help'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import AdminDashboard from './pages/admin/Dashboard'
import Students from './pages/admin/Students'
import Teachers from './pages/admin/Teachers'
import Classes from './pages/admin/Classes'
import Subjects from './pages/admin/Subjects'

function PrivateRoute({ children, allowedRoles }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help" element={<Help />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['school_admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/students" element={
            <PrivateRoute allowedRoles={['school_admin']}>
              <Students />
            </PrivateRoute>
          } />
          <Route path="/admin/teachers" element={
            <PrivateRoute allowedRoles={['school_admin']}>
              <Teachers />
            </PrivateRoute>
          } />
          <Route path="/admin/classes" element={
            <PrivateRoute allowedRoles={['school_admin']}>
              <Classes />
            </PrivateRoute>
          } />
          <Route path="/admin/subjects" element={
            <PrivateRoute allowedRoles={['school_admin']}>
              <Subjects />
            </PrivateRoute>
          } />
          <Route path="/teacher/*" element={
            <PrivateRoute allowedRoles={['teacher']}>
              <div className="min-h-screen bg-[#0B1120] text-white p-8">Teacher Dashboard - Coming Soon</div>
            </PrivateRoute>
          } />
          <Route path="/super/*" element={
            <PrivateRoute allowedRoles={['super_admin']}>
              <div className="min-h-screen bg-[#0B1120] text-white p-8">Super Admin Dashboard - Coming Soon</div>
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App