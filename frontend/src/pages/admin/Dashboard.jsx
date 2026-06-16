import { useState, useEffect } from 'react'
import { Users, BookOpen, FileText, Wallet, Loader } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { formatCurrency } from '../../utils/helpers'
import Card from '../../components/Card'
import Alert from '../../components/Alert'

export default function AdminDashboard() {
  const { get } = useApi()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get('/dashboard/stats')
        if (response.success) {
          setStats(response.data)
        } else {
          setError('Failed to load dashboard data')
        }

        const activityResponse = await get('/dashboard/recent-activity')
        if (activityResponse.success) {
          setRecentActivity(activityResponse.data)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [get])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.total_students || 0,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Teachers',
      value: stats?.total_teachers || 0,
      icon: BookOpen,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Wallet Balance',
      value: formatCurrency(stats?.wallet_balance || 0),
      icon: Wallet,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'PINs Generated',
      value: stats?.pins_generated || 0,
      icon: FileText,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your school's overview.</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible />}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-bold mb-6 text-gray-900">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No recent activity</p>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold mb-6 text-gray-900">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Add Student</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Add Teacher</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Review Results</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center">
            <Wallet className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Fund Wallet</p>
          </button>
        </div>
      </Card>
    </div>
  )
}
