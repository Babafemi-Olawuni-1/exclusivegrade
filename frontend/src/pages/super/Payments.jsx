import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function SuperPayments() {
  const { get, post } = useApi()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await get('/super?action=payments')
      if (res.success) setPayments(res.data || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleAction = async (paymentId, action) => {
    setSubmitting(paymentId)
    setError('')
    try {
      const res = await post(`/super?action=${action}-payment`, { payment_id: paymentId })
      if (res.success) { setSuccess(`Payment ${action}d.`); fetch() }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSubmitting(null) }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Requests</h1>
          <p className="text-gray-500 text-sm">Review and approve manual payment requests</p>
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['School','Amount','Date','Screenshot','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? [...Array(3)].map((_,i)=><tr key={i}><td colSpan="6"><div className="h-4 bg-gray-100 rounded animate-pulse m-4"/></td></tr>)
                : payments.length === 0 ? <tr><td colSpan="6" className="py-10 text-center text-gray-400">No pending payments.</td></tr>
                : payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.school_name}</td>
                    <td className="px-4 py-3 font-bold text-purple-700">₦{parseFloat(p.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {p.screenshot_url ? <a href={p.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View</a> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status==='pending'?'bg-yellow-100 text-yellow-700':p.status==='approved'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(p.id,'approve')} disabled={submitting===p.id}
                            className="px-2.5 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 disabled:opacity-50 flex items-center gap-1">
                            <CheckCircle size={12}/> Approve
                          </button>
                          <button onClick={() => handleAction(p.id,'reject')} disabled={submitting===p.id}
                            className="px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 disabled:opacity-50 flex items-center gap-1">
                            <XCircle size={12}/> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
