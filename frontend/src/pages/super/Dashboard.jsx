import { useState, useEffect } from 'react'
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function SuperDashboard() {
  const { get } = useApi()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get('/super?action=stats')
      .then(r => { if (r.success) setStats(r.data) })
      .catch(()=>{})
      .finally(()=>setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
          <h1 className="text-xl font-bold mb-1">Super Admin Dashboard</h1>
          <p className="text-purple-200 text-sm">Platform overview and metrics</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Schools',   value: stats?.total_schools,                    icon: Building2,  color: 'bg-purple-100 text-purple-600' },
              { title: 'Active Schools',  value: stats?.active_schools,                   icon: TrendingUp, color: 'bg-green-100 text-green-600' },
              { title: 'Total Users',     value: stats?.total_users,                      icon: Users,      color: 'bg-blue-100 text-blue-600' },
              { title: 'Total Revenue',   value: `₦${(stats?.total_revenue||0).toLocaleString()}`, icon: DollarSign, color: 'bg-pink-100 text-pink-600' },
            ].map(({ title, value, icon: Icon, color }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value ?? '—'}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={18}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
