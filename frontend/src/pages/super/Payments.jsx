import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Button from '../../components/forms/Button'
import Alert from '../../components/common/Alert'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCurrency, formatDate } from '../../utils/helpers'

export default function Payments() {
  const { get, post, loading } = useApi()
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(null)

  const fetch = useCallback(async () => {
    try {
      const res = await get('/super?action=payments')
      setPayments(res.payments || [])
    } catch { setError('Failed to load payments.') }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleAction = async (paymentId, action) => {
    setSubmitting(paymentId)
    setError('')
    try {
      await post(`/super?action=${action}-payment`, { payment_id: paymentId })
      setSuccess(`Payment ${action}d successfully.`)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(null) }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A1A]">Payment Requests</h1>
        <p className="text-sm text-gray-500">Review and approve manual payment requests</p>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No pending payments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>{['School','Amount','Date','Screenshot','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-3 font-medium">{p.school_name}</td>
                    <td className="px-4 py-3 font-bold text-[#FF6B00]">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      {p.screenshot_url ? (
                        <a href={p.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">View</a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status==='pending'?'warning':p.status==='approved'?'success':'error'}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="xs" variant="success" loading={submitting===p.id} onClick={() => handleAction(p.id,'approve')}>
                            <CheckCircle className="w-3 h-3" /> Approve
                          </Button>
                          <Button size="xs" variant="danger" loading={submitting===p.id} onClick={() => handleAction(p.id,'reject')}>
                            <XCircle className="w-3 h-3" /> Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
