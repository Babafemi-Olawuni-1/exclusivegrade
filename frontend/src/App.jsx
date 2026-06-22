import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Public pages
import Landing  from './pages/Landing'
import Login    from './pages/Login'
import Register from './pages/Register'

// Static pages
import Help    from './pages/Help'
import Privacy from './pages/Privacy'
import Terms   from './pages/Terms'

// School public page
import SchoolPublic from './pages/SchoolPublic'

// Admin pages
import AdminDashboard    from './pages/admin/Dashboard'
import Students          from './pages/admin/Students'
import Teachers          from './pages/admin/Teachers'
import Classes           from './pages/admin/Classes'
import Subjects          from './pages/admin/Subjects'
import Results           from './pages/admin/Results'
import ResultTemplates   from './pages/admin/ResultTemplates'
import Cognitive         from './pages/admin/Cognitive'
import Attendance        from './pages/admin/Attendance'
import Sessions          from './pages/admin/Sessions'
import Pins              from './pages/admin/Pins'
import Wallet            from './pages/admin/Wallet'
import IDCards           from './pages/admin/IDCards'
import LessonNotes       from './pages/admin/LessonNotes'
import CBT               from './pages/admin/CBT'
import Settings          from './pages/admin/Settings'

// Teacher pages
import TeacherDashboard   from './pages/teacher/Dashboard'
import TeacherResults     from './pages/teacher/Results'
import TeacherLessons     from './pages/teacher/LessonNotes'
import TeacherProfile     from './pages/teacher/Profile'

// Super Admin pages
import SuperDashboard from './pages/super/Dashboard'
import SuperSchools   from './pages/super/Schools'
import SuperPayments  from './pages/super/Payments'
import SuperRevenue   from './pages/super/Revenue'

function PrivateRoute({ children, allowedRoles }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  // super_admin can access everything
  if (user?.role === 'super_admin') return children
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'teacher') return <Navigate to="/teacher" replace />
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help"     element={<Help />} />
          <Route path="/privacy"  element={<Privacy />} />
          <Route path="/terms"    element={<Terms />} />
          <Route path="/s/:slug"  element={<SchoolPublic />} />

          {/* Admin */}
          <Route path="/admin" element={<PrivateRoute allowedRoles={['school_admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/students"        element={<PrivateRoute allowedRoles={['school_admin']}><Students /></PrivateRoute>} />
          <Route path="/admin/teachers"        element={<PrivateRoute allowedRoles={['school_admin']}><Teachers /></PrivateRoute>} />
          <Route path="/admin/classes"         element={<PrivateRoute allowedRoles={['school_admin']}><Classes /></PrivateRoute>} />
          <Route path="/admin/subjects"        element={<PrivateRoute allowedRoles={['school_admin']}><Subjects /></PrivateRoute>} />
          <Route path="/admin/results"         element={<PrivateRoute allowedRoles={['school_admin']}><Results /></PrivateRoute>} />
          <Route path="/admin/result-templates"element={<PrivateRoute allowedRoles={['school_admin']}><ResultTemplates /></PrivateRoute>} />
          <Route path="/admin/cognitive"       element={<PrivateRoute allowedRoles={['school_admin']}><Cognitive /></PrivateRoute>} />
          <Route path="/admin/attendance"      element={<PrivateRoute allowedRoles={['school_admin']}><Attendance /></PrivateRoute>} />
          <Route path="/admin/sessions"        element={<PrivateRoute allowedRoles={['school_admin']}><Sessions /></PrivateRoute>} />
          <Route path="/admin/pins"            element={<PrivateRoute allowedRoles={['school_admin']}><Pins /></PrivateRoute>} />
          <Route path="/admin/wallet"          element={<PrivateRoute allowedRoles={['school_admin']}><Wallet /></PrivateRoute>} />
          <Route path="/admin/id-cards"        element={<PrivateRoute allowedRoles={['school_admin']}><IDCards /></PrivateRoute>} />
          <Route path="/admin/lesson-notes"    element={<PrivateRoute allowedRoles={['school_admin']}><LessonNotes /></PrivateRoute>} />
          <Route path="/admin/cbt"             element={<PrivateRoute allowedRoles={['school_admin']}><CBT /></PrivateRoute>} />
          <Route path="/admin/settings"        element={<PrivateRoute allowedRoles={['school_admin']}><Settings /></PrivateRoute>} />

          {/* Teacher */}
          <Route path="/teacher"               element={<PrivateRoute allowedRoles={['teacher']}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/teacher/results"       element={<PrivateRoute allowedRoles={['teacher']}><TeacherResults /></PrivateRoute>} />
          <Route path="/teacher/lesson-notes"  element={<PrivateRoute allowedRoles={['teacher']}><TeacherLessons /></PrivateRoute>} />
          <Route path="/teacher/profile"       element={<PrivateRoute allowedRoles={['teacher']}><TeacherProfile /></PrivateRoute>} />

          {/* Super Admin */}
          <Route path="/super"          element={<PrivateRoute allowedRoles={['super_admin']}><SuperDashboard /></PrivateRoute>} />
          <Route path="/super/schools"  element={<PrivateRoute allowedRoles={['super_admin']}><SuperSchools /></PrivateRoute>} />
          <Route path="/super/payments" element={<PrivateRoute allowedRoles={['super_admin']}><SuperPayments /></PrivateRoute>} />
          <Route path="/super/revenue"  element={<PrivateRoute allowedRoles={['super_admin']}><SuperRevenue /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
