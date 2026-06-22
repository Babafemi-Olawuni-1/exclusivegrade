import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function SuperRevenue() {
  const { get } = useApi()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get('/super?action=revenue')
      .then(r => { if (r.success) setData(r.data) })
      .catch(()=>{})
      .finally(()=>setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Revenue Report</h1>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ['Total Revenue',  `₦${(data?.total_revenue||0).toLocaleString()}`],
                ['This Month',     `₦${(data?.this_month||0).toLocaleString()}`],
                ['Last Month',     `₦${(data?.last_month||0).toLocaleString()}`],
                ['Active Plans',   data?.active_plans || '—'],
              ].map(([l,v]) => (
                <div key={l} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{l}</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">{v}</p>
                </div>
              ))}
            </div>

            {data?.by_school?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-200"><h3 className="font-semibold text-gray-800">Revenue by School</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>{['School','Plan','Total Revenue','Last Payment'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.by_school.map((s,i)=>(
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{s.school_name}</td>
                          <td className="px-4 py-3 text-gray-600 capitalize">{s.plan}</td>
                          <td className="px-4 py-3 font-bold text-purple-700">₦{parseFloat(s.total||0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-gray-400">{s.last_payment ? new Date(s.last_payment).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
