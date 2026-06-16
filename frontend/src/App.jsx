import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/common/PrivateRoute'
import AdminLayout from './components/layout/AdminLayout'

// Public pages
import Landing    from './pages/Landing'
import Login      from './pages/Login'
import Register   from './pages/Register'
import SchoolPage from './pages/SchoolPage'

// Admin pages
import AdminDashboard   from './pages/admin/Dashboard'
import Students         from './pages/admin/Students'
import Teachers         from './pages/admin/Teachers'
import Classes          from './pages/admin/Classes'
import Subjects         from './pages/admin/Subjects'
import ResultTemplates  from './pages/admin/ResultTemplates'
import Results          from './pages/admin/Results'
import Cognitive        from './pages/admin/Cognitive'
import Attendance       from './pages/admin/Attendance'
import Sessions         from './pages/admin/Sessions'
import Pins             from './pages/admin/Pins'
import Wallet           from './pages/admin/Wallet'
import IDCards          from './pages/admin/IDCards'
import LessonNotes      from './pages/admin/LessonNotes'
import CBT              from './pages/admin/CBT'
import Settings         from './pages/admin/Settings'

// Teacher pages
import TeacherDashboard  from './pages/teacher/Dashboard'
import ResultsUpload     from './pages/teacher/ResultsUpload'
import TeacherLessonNotes from './pages/teacher/LessonNotes'
import TeacherProfile    from './pages/teacher/Profile'

// Super Admin pages
import SuperDashboard from './pages/super/Dashboard'
import Schools        from './pages/super/Schools'
import Payments       from './pages/super/Payments'
import Revenue        from './pages/super/Revenue'

function AdminRoutes() {
  return (
    <PrivateRoute requiredRole="admin">
      <AdminLayout>
        <Routes>
          <Route index             element={<AdminDashboard />} />
          <Route path="students"   element={<Students />} />
          <Route path="teachers"   element={<Teachers />} />
          <Route path="classes"    element={<Classes />} />
          <Route path="subjects"   element={<Subjects />} />
          <Route path="result-templates" element={<ResultTemplates />} />
          <Route path="results"    element={<Results />} />
          <Route path="cognitive"  element={<Cognitive />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="sessions"   element={<Sessions />} />
          <Route path="pins"       element={<Pins />} />
          <Route path="wallet"     element={<Wallet />} />
          <Route path="id-cards"   element={<IDCards />} />
          <Route path="lesson-notes" element={<LessonNotes />} />
          <Route path="cbt"        element={<CBT />} />
          <Route path="settings"   element={<Settings />} />
          <Route path="*"          element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </PrivateRoute>
  )
}

function TeacherRoutes() {
  return (
    <PrivateRoute requiredRole="teacher">
      <AdminLayout>
        <Routes>
          <Route index                  element={<TeacherDashboard />} />
          <Route path="results-upload"  element={<ResultsUpload />} />
          <Route path="lesson-notes"    element={<TeacherLessonNotes />} />
          <Route path="profile"         element={<TeacherProfile />} />
          <Route path="*"               element={<Navigate to="/teacher" replace />} />
        </Routes>
      </AdminLayout>
    </PrivateRoute>
  )
}

function SuperRoutes() {
  return (
    <PrivateRoute requiredRole="super_admin">
      <AdminLayout>
        <Routes>
          <Route index           element={<SuperDashboard />} />
          <Route path="schools"  element={<Schools />} />
          <Route path="payments" element={<Payments />} />
          <Route path="revenue"  element={<Revenue />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*"        element={<Navigate to="/super" replace />} />
        </Routes>
      </AdminLayout>
    </PrivateRoute>
  )
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"               element={<Landing />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/school/:slug"   element={<SchoolPage />} />

          {/* Legacy auth paths */}
          <Route path="/auth/login"    element={<Navigate to="/login" replace />} />
          <Route path="/auth/register" element={<Navigate to="/register" replace />} />

          {/* Admin */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Teacher */}
          <Route path="/teacher/*" element={<TeacherRoutes />} />

          {/* Super Admin */}
          <Route path="/super/*" element={<SuperRoutes />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
