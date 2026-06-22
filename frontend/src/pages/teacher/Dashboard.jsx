import { useState, useEffect } from 'react'
import { BarChart2, BookOpen, FileText, Users, Link, ExternalLink } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { Link as RouterLink } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'

export default function TeacherDashboard() {
  const { get } = useApi()
  const { user, school } = useAuth()
  const [stats, setStats] = useState({ classes: 0, results: 0, notes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      get('/teacher/dashboard'),
      get('/results'),
      get('/lesson-notes'),
    ]).then(([d, r, n]) => {
      setStats({
        classes: d.value?.data?.assigned_classes || 0,
        results: r.value?.success ? (r.value.data?.length || 0) : 0,
        notes:   n.value?.success ? (n.value.data?.length || 0) : 0,
      })
    }).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
          <h1 className="text-xl font-bold mb-1">Hello, {user?.first_name || 'Teacher'} 👋</h1>
          <p className="text-purple-200 text-sm">{school?.name || 'Your School'}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Results Uploaded', value: stats.results, color: 'bg-purple-100 text-purple-600' },
            { title: 'Lesson Notes', value: stats.notes, color: 'bg-blue-100 text-blue-600' },
            { title: 'Assigned Classes', value: stats.classes || '—', color: 'bg-green-100 text-green-600' },
          ].map(({ title, value, color }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{loading ? '...' : value}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Upload Results', href: '/teacher/results', icon: BarChart2 },
              { label: 'Lesson Notes', href: '/teacher/lesson-notes', icon: BookOpen },
              { label: 'My Profile', href: '/teacher/profile', icon: Users },
            ].map(({ label, href, icon: Icon }) => (
              <RouterLink key={label} to={href} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Icon size={18} className="text-purple-600"/></div>
                <span className="text-xs font-semibold text-gray-700">{label}</span>
              </RouterLink>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
