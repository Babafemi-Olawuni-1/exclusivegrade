import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useApi } from '../../hooks/useApi'
import Card from '../../components/Card'
import Alert from '../../components/Alert'

export default function Analytics() {
  const { get } = useApi()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await get('/analytics')
      if (response.success) {
        setAnalyticsData(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading analytics...</div>
  }

  if (error) {
    return <Alert type="error" message={error} onClose={() => setError(null)} />
  }

  // Sample data for charts
  const enrollmentData = [
    { month: 'Jan', students: 45, teachers: 5 },
    { month: 'Feb', students: 52, teachers: 6 },
    { month: 'Mar', students: 48, teachers: 6 },
    { month: 'Apr', students: 61, teachers: 7 },
    { month: 'May', students: 55, teachers: 7 },
    { month: 'Jun', students: 67, teachers: 8 },
  ]

  const pinUsageData = [
    { date: 'Week 1', used: 120, unused: 45 },
    { date: 'Week 2', used: 145, unused: 32 },
    { date: 'Week 3', used: 98, unused: 78 },
    { date: 'Week 4', used: 156, unused: 28 },
  ]

  const performanceData = [
    { grade: 'A', count: 28 },
    { grade: 'B', count: 35 },
    { grade: 'C', count: 22 },
    { grade: 'D', count: 12 },
    { grade: 'F', count: 3 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <p className="text-gray-600 text-sm mb-2">Avg Performance</p>
          <p className="text-3xl font-bold text-orange-600">78.5%</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm mb-2">PIN Utilization</p>
          <p className="text-3xl font-bold text-blue-600">87%</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm mb-2">Attendance Rate</p>
          <p className="text-3xl font-bold text-green-600">92%</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm mb-2">Active Sessions</p>
          <p className="text-3xl font-bold text-purple-600">1,240</p>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <h2 className="text-xl font-bold mb-6 text-gray-900">Enrollment Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={enrollmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="students" stroke="#ff8c42" name="Students" />
            <Line type="monotone" dataKey="teachers" stroke="#667eea" name="Teachers" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-6 text-gray-900">PIN Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pinUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="used" stackId="a" fill="#10b981" name="Used" />
              <Bar dataKey="unused" stackId="a" fill="#e5e7eb" name="Unused" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-6 text-gray-900">Performance Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="grade" />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <h2 className="text-xl font-bold mb-6 text-gray-900">Summary</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm mb-2">Total Results Submitted</p>
            <p className="text-2xl font-bold text-gray-900">245</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-2">Approved Results</p>
            <p className="text-2xl font-bold text-green-600">240</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-2">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600">5</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
