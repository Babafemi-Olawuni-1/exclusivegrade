import { useState, useEffect } from 'react'
import { BarChart2, BookOpen, FileText, Users } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Alert from '../../components/common/Alert'

export default function TeacherDashboard() {
  const { get, loading } = useApi()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    get('/teacher/dashboard')
      .then(r => setStats(r))
      .catch(() => setError('Failed to load dashboard.'))
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold mb-1">
          Hello, {user?.first_name || 'Teacher'} 👋
        </h1>
        <p className="text-gray-300 text-sm">Here's your teaching overview</p>
      </div>

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title:'Assigned Classes', value: stats?.assigned_classes || '—', icon: Users, color:'orange' },
              { title:'Subjects',         value: stats?.subjects || '—',         icon: BookOpen, color:'blue' },
              { title:'Results Uploaded', value: stats?.results_uploaded || '—', icon: FileText, color:'green' },
              { title:'Lesson Notes',     value: stats?.lesson_notes || '—',     icon: BarChart2, color:'purple' },
            ].map(({ title, value, icon: Icon, color }) => (
              <div key={title} className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label:'Upload Results',  href:'/teacher/results-upload', icon: BarChart2 },
                { label:'Lesson Notes',    href:'/teacher/lesson-notes',   icon: BookOpen },
                { label:'My Profile',      href:'/teacher/profile',        icon: Users },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={label} to={href}
                  className="bg-white rounded-xl p-4 shadow-card hover:shadow-card-lg transition-shadow flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
