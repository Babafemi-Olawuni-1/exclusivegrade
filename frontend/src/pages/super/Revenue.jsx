import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCurrency } from '../../utils/helpers'

export default function Revenue() {
  const { get, loading } = useApi()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    get('/super?action=revenue')
      .then(r => setData(r))
      .catch(() => setError('Failed to load revenue data.'))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1A1A1A]">Revenue Report</h1>

      {error && <Alert type="error" message={error} />}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Total Revenue', formatCurrency(data?.total_revenue||0)],
          ['This Month',    formatCurrency(data?.this_month||0)],
          ['Last Month',    formatCurrency(data?.last_month||0)],
          ['Active Plans',  data?.active_plans||'—'],
        ].map(([label, val]) => (
          <div key={label} className="bg-white rounded-2xl shadow-card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold text-[#1A1A1A] mt-1">{val}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      {data?.monthly?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-semibold mb-4">Monthly Revenue (Last 12 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily:'Sora' }} />
              <YAxis tick={{ fontSize: 11, fontFamily:'Sora' }} tickFormatter={v => '₦'+v.toLocaleString()} />
              <Tooltip formatter={(val) => [formatCurrency(val), 'Revenue']} />
              <Bar dataKey="revenue" fill="#FF6B00" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* By school */}
      {data?.by_school?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E5E5]">
            <h3 className="font-semibold">Revenue by School</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>{['School','Plan','Total Revenue','Last Payment'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {data.by_school.map((s,i) => (
                  <tr key={i} className="hover:bg-[#F5F5F5]">
                    <td className="px-4 py-3 font-medium">{s.school_name}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{s.plan}</td>
                    <td className="px-4 py-3 font-bold text-[#FF6B00]">{formatCurrency(s.total)}</td>
                    <td className="px-4 py-3 text-gray-500">{s.last_payment ? new Date(s.last_payment).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
