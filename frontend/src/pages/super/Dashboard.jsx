import { useState, useEffect } from 'react'
import { Building2, Users, DollarSign, TrendingUp, BarChart2 } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Alert from '../../components/common/Alert'
import { formatCurrency } from '../../utils/helpers'

function StatCard({ title, value, icon: Icon, color }) {
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
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export default function SuperDashboard() {
  const { get, loading } = useApi()
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([
      get('/super?action=stats'),
      get('/super?action=revenue'),
    ]).then(([s, r]) => {
      if (s.value) setStats(s.value)
      if (r.value) setRevenue(r.value.monthly || [])
    }).catch(() => setError('Failed to load stats.'))
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold mb-1">Super Admin Dashboard</h1>
        <p className="text-gray-300 text-sm">Platform overview and metrics</p>
      </div>

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Schools"    value={stats?.total_schools}                    icon={Building2}  color="orange" />
            <StatCard title="Active Schools"   value={stats?.active_schools}                   icon={TrendingUp} color="green" />
            <StatCard title="Total Users"      value={stats?.total_users}                      icon={Users}      color="blue" />
            <StatCard title="Total Revenue"    value={formatCurrency(stats?.total_revenue||0)} icon={DollarSign} color="purple" />
          </div>

          {/* Revenue chart */}
          {revenue.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-semibold mb-4">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenue}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="revenue" fill="#FF6B00" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
