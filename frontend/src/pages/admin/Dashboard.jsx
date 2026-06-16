import { useState, useEffect } from 'react'
import { Users, GraduationCap, FileText, Wallet, TrendingUp, Key, School, Bell } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Alert from '../../components/common/Alert'

function StatCard({ title, value, icon: Icon, color, sub }) {
  const colors = {
    orange: 'bg-[#FF6B00]/10 text-[#FF6B00]',
    green:  'bg-green-100 text-green-600',
    blue:   'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color] || colors.orange}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { get, loading } = useApi()
  const { school, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch from multiple endpoints in parallel
        const [studentsRes, teachersRes, resultsRes, walletRes, pinsRes, announcementsRes] = await Promise.allSettled([
          get('/students', { per_page: 1 }),
          get('/teachers'),
          get('/results'),
          get('/wallet'),
          get('/pins'),
          get('/announcements'),
        ])
        setStats({
          students:      studentsRes.value?.total || studentsRes.value?.students?.length || 0,
          teachers:      teachersRes.value?.teachers?.length || 0,
          results:       resultsRes.value?.results?.length || 0,
          balance:       walletRes.value?.balance || 0,
          pins:          pinsRes.value?.pins?.length || 0,
          announcements: announcementsRes.value?.announcements?.length || 0,
        })
      } catch {
        setError('Failed to load dashboard stats.')
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold mb-1">
          Welcome back, {user?.first_name || 'Admin'} 👋
        </h1>
        <p className="text-gray-300 text-sm">
          {school?.name} — Here's what's happening today
        </p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Stats grid */}
      {loading && !stats ? (
        <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <StatCard title="Total Students"    value={stats?.students}            icon={Users}          color="orange" />
          <StatCard title="Teachers"          value={stats?.teachers}            icon={GraduationCap}  color="blue" />
          <StatCard title="Result Records"    value={stats?.results}             icon={FileText}       color="green" />
          <StatCard title="Wallet Balance"    value={formatCurrency(stats?.balance || 0)} icon={Wallet} color="purple" />
          <StatCard title="Active PINs"       value={stats?.pins}                icon={Key}            color="orange" />
          <StatCard title="Announcements"     value={stats?.announcements}       icon={Bell}           color="blue" />
        </div>
      )}

      {/* Plan notice */}
      {school?.plan === 'starter' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">You're on the Free Plan</p>
              <p className="text-sm text-yellow-700 mt-1">
                Limited to 10 students and 2 teachers. Upgrade to Pro for 200 students, AI lesson notes, ID cards, and more.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Student',    href: '/admin/students',  icon: Users },
            { label: 'Add Teacher',    href: '/admin/teachers',  icon: GraduationCap },
            { label: 'View Results',   href: '/admin/results',   icon: FileText },
            { label: 'Generate PINs',  href: '/admin/pins',      icon: Key },
          ].map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              className="bg-white rounded-xl p-4 shadow-card hover:shadow-card-lg transition-shadow flex flex-col items-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
