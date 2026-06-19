import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/layout/AdminLayout'
import {
  Users, UserCog, BookOpen, Key, Wallet, FileText,
  Globe, ExternalLink, Copy, CheckCircle, Clock,
  UserPlus, PlusCircle, CreditCard, FileCheck
} from 'lucide-react'

export default function Dashboard() {
  const { get } = useApi()
  const { user, school } = useAuth()
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    pins: 0,
    wallet: 0,
    results: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Get students
      let students = 0
      let recentStudents = []
      try {
        const studentsRes = await get('/students?per_page=5')
        if (studentsRes?.data) {
          students = studentsRes.data.total || 0
          recentStudents = studentsRes.data.items || []
        }
      } catch (e) {
        console.warn('Students fetch failed:', e)
      }

      // Get teachers
      let teachers = 0
      try {
        const teachersRes = await get('/teachers')
        teachers = teachersRes?.data?.total || 0
      } catch (e) {
        console.warn('Teachers fetch failed:', e)
      }

      // Get classes
      let classes = 0
      try {
        const classesRes = await get('/classes')
        classes = classesRes?.data?.length || 0
      } catch (e) {
        console.warn('Classes fetch failed:', e)
      }

      // Get pins
      let pins = 0
      let recentPins = []
      try {
        const pinsRes = await get('/pins?per_page=5')
        if (pinsRes?.data) {
          pins = pinsRes.data.length || 0
          recentPins = pinsRes.data || []
        }
      } catch (e) {
        console.warn('Pins fetch failed:', e)
      }

      // Get wallet
      let wallet = 0
      let recentTransactions = []
      try {
        const walletRes = await get('/wallet')
        if (walletRes?.data) {
          wallet = walletRes.data.balance || 0
          recentTransactions = walletRes.data.transactions || []
        }
      } catch (e) {
        console.warn('Wallet fetch failed:', e)
      }

      // Get results
      let results = 0
      let recentResults = []
      try {
        const resultsRes = await get('/results?per_page=5')
        if (resultsRes?.data) {
          results = resultsRes.data.length || 0
          recentResults = resultsRes.data || []
        }
      } catch (e) {
        console.warn('Results fetch failed:', e)
      }

      setStats({ students, teachers, classes, pins, wallet, results })

      // Build recent activity from ALL sources
      const activities = []

      // 1. Recent Students
      recentStudents.forEach((student) => {
        activities.push({
          id: `student-${student.id}`,
          icon: UserPlus,
          action: `Added student: ${student.first_name} ${student.last_name || ''}`,
          time: student.created_at || new Date().toISOString(),
          type: 'student',
          color: 'blue'
        })
      })

      // 2. Recent Pins
      recentPins.forEach((pin) => {
        const studentName = pin.student_name || pin.first_name || 'student'
        activities.push({
          id: `pin-${pin.id}`,
          icon: Key,
          action: `Generated PIN for ${studentName}`,
          time: pin.created_at || new Date().toISOString(),
          type: 'pin',
          color: 'orange'
        })
      })

      // 3. Recent Transactions
      recentTransactions.forEach((tx) => {
        const action = tx.type === 'topup' 
          ? `Wallet funded with ₦${parseFloat(tx.amount).toLocaleString()}`
          : tx.type === 'pin_purchase' 
            ? `Purchased PINs worth ₦${parseFloat(tx.amount).toLocaleString()}`
            : `${tx.type} of ₦${parseFloat(tx.amount).toLocaleString()}`
        activities.push({
          id: `tx-${tx.id}`,
          icon: tx.type === 'topup' ? CreditCard : Wallet,
          action: action,
          time: tx.created_at || new Date().toISOString(),
          type: 'transaction',
          color: 'green'
        })
      })

      // 4. Recent Results
      recentResults.forEach((result) => {
        const studentName = result.student_name || result.first_name || 'student'
        activities.push({
          id: `result-${result.id}`,
          icon: FileCheck,
          action: `Published result for ${studentName}`,
          time: result.published_at || result.created_at || new Date().toISOString(),
          type: 'result',
          color: 'teal'
        })
      })

      // Sort by time (most recent first)
      activities.sort((a, b) => {
        return new Date(b.time) - new Date(a.time)
      })

      // Take top 10
      setRecentActivity(activities.slice(0, 10))

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const schoolUrl = school?.slug ? `http://localhost:3000/s/${school.slug}` : '#'

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(schoolUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statCards = [
    { title: 'Students', value: stats.students, icon: Users, color: 'purple' },
    { title: 'Teachers', value: stats.teachers, icon: UserCog, color: 'blue' },
    { title: 'Classes', value: stats.classes, icon: BookOpen, color: 'green' },
    { title: 'PINs', value: stats.pins, icon: Key, color: 'orange' },
    { title: 'Wallet', value: `₦${stats.wallet.toLocaleString()}`, icon: Wallet, color: 'pink' },
    { title: 'Results', value: stats.results, icon: FileText, color: 'teal' },
  ]

  const getColorClasses = (color) => {
    const colors = {
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        hover: 'hover:bg-purple-50'
      },
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        hover: 'hover:bg-blue-50'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'text-green-600',
        hover: 'hover:bg-green-50'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        hover: 'hover:bg-orange-50'
      },
      pink: {
        bg: 'bg-pink-100',
        text: 'text-pink-700',
        border: 'border-pink-200',
        icon: 'text-pink-600',
        hover: 'hover:bg-pink-50'
      },
      teal: {
        bg: 'bg-teal-100',
        text: 'text-teal-700',
        border: 'border-teal-200',
        icon: 'text-teal-600',
        hover: 'hover:bg-teal-50'
      },
    }
    return colors[color]
  }

  const getActivityColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      green: 'bg-green-100 text-green-600',
      teal: 'bg-teal-100 text-teal-600',
    }
    return colors[color] || 'bg-purple-100 text-purple-600'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* School Landing Page Link */}
        <div className="bg-white border border-purple-200 shadow-sm rounded-2xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Your School Landing Page
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={schoolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm md:text-base truncate max-w-[200px] sm:max-w-[300px] text-gray-800 hover:text-purple-600 transition-colors duration-200"
                  >
                    {schoolUrl}
                  </a>
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded-lg transition-colors duration-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    title="Copy link"
                  >
                    {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                  <a
                    href={schoolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg transition-colors duration-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    title="Open in new tab"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full border bg-green-100 text-green-700 border-green-200">
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Welcome Section - Shows School Name */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Welcome, {user?.first_name || 'Admin'}!
          </h1>
          <p className="text-gray-600 mt-1">
            {school?.name || 'Your School'} Dashboard - Here's what's happening.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
          {statCards.map((stat, index) => {
            const colors = getColorClasses(stat.color)
            return (
              <div
                key={index}
                className={`bg-white border ${colors.border} shadow-sm rounded-2xl p-4 md:p-6 transition-all duration-300 ${colors.hover}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-lg md:text-2xl font-bold mt-1 text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-xl ${colors.bg} ${colors.icon}`}>
                    <stat.icon size={16} className="md:w-5 md:h-5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Recent Activity
          </h2>
          {loading ? (
            <div className="text-gray-500 text-sm">
              Loading...
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-gray-500 text-sm">
              No recent activity yet. Start by adding students, teachers, or generating PINs.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 border-gray-100 hover:border-purple-300 transition-all duration-200"
                >
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.color)}`}>
                    <activity.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {formatTimeAgo(activity.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}