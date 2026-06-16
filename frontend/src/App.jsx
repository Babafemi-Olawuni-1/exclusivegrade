import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import SchoolLanding from './pages/SchoolLanding'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import UpdateProfile from './pages/auth/UpdateProfile'

// Admin Dashboard
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import StudentManagement from './pages/admin/Students'
import TeacherManagement from './pages/admin/Teachers'
import ResultsManagement from './pages/admin/Results'
import WalletManagement from './pages/admin/Wallet'
import PinManagement from './pages/admin/Pins'
import Announcements from './pages/admin/Announcements'
import Analytics from './pages/admin/Analytics'
import Settings from './pages/admin/Settings'

// Teacher Pages
import TeacherLayout from './pages/teacher/TeacherLayout'
import TeacherDashboard from './pages/teacher/Dashboard'
import ResultsUpload from './pages/teacher/ResultsUpload'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/school/:schoolId" element={<SchoolLanding />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/students" element={<StudentManagement />} />
                    <Route path="/teachers" element={<TeacherManagement />} />
                    <Route path="/results" element={<ResultsManagement />} />
                    <Route path="/wallet" element={<WalletManagement />} />
                    <Route path="/pins" element={<PinManagement />} />
                    <Route path="/announcements" element={<Announcements />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<UpdateProfile />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Super Admin Routes */}
          <Route
            path="/super/*"
            element={
              <ProtectedRoute requiredRole="super_admin">
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/students" element={<StudentManagement />} />
                    <Route path="/teachers" element={<TeacherManagement />} />
                    <Route path="/results" element={<ResultsManagement />} />
                    <Route path="/wallet" element={<WalletManagement />} />
                    <Route path="/pins" element={<PinManagement />} />
                    <Route path="/announcements" element={<Announcements />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<UpdateProfile />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Teacher Routes */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherLayout>
                  <Routes>
                    <Route path="/" element={<TeacherDashboard />} />
                    <Route path="/results-upload" element={<ResultsUpload />} />
                    <Route path="/profile" element={<UpdateProfile />} />
                  </Routes>
                </TeacherLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
