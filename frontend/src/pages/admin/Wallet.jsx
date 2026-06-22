import { useState, useEffect } from 'react'
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Wallet() {
  const { get, post } = useApi()
  const [walletData, setWalletData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fundForm, setFundForm] = useState({ amount: '' })
  const [manualForm, setManualForm] = useState({ amount: '', screenshot_url: '' })

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await get('/wallet')
      setWalletData(res?.data || null)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleFund = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await post('/wallet?action=fund', fundForm)
      if (res?.data?.payment_url) window.open(res.data.payment_url, '_blank')
      setSuccess('Redirecting to Paystack payment...'); setModal(null)
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleManual = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await post('/wallet?action=manual-request', manualForm)
      setSuccess('Manual payment request submitted. Admin will review and approve.')
      setModal(null)
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const typeIcon = (type) => type === 'topup'
    ? <ArrowDownLeft size={16} className="text-green-600"/>
    : <ArrowUpRight size={16} className="text-red-500"/>

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Wallet</h1>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        {loading ? (
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse"/>
        ) : (
          <>
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-purple-200 text-sm mb-1">Available Balance</p>
                  <p className="text-4xl font-bold">₦{(walletData?.balance || 0).toLocaleString()}</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <WalletIcon size={28}/>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setFundForm({amount:''}); setModal('fund') }}
                  className="px-4 py-2 bg-white text-purple-700 rounded-xl text-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
                  <Plus size={16}/> Fund Wallet
                </button>
                <button onClick={() => { setManualForm({amount:'',screenshot_url:''}); setModal('manual') }}
                  className="px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/30 border border-white/30">
                  Manual Payment
                </button>
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Transaction History</h2>
              </div>
              {!walletData?.transactions?.length ? (
                <p className="text-center py-12 text-gray-400 text-sm">No transactions yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {walletData.transactions.map(tx => (
                    <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'topup' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {typeIcon(tx.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{tx.description || tx.type?.replace('_',' ')}</p>
                          <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${tx.type === 'topup' ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.type === 'topup' ? '+' : '-'}₦{parseFloat(tx.amount).toLocaleString()}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Fund Modal */}
      {modal === 'fund' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Fund Wallet</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleFund} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (₦) <span className="text-red-500">*</span></label>
                <input type="number" required min="1000" value={fundForm.amount} onChange={e => setFundForm({amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Minimum ₦1,000" />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                You will be redirected to Paystack to complete payment securely.
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Processing...' : 'Pay via Paystack'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {modal === 'manual' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Manual Payment Request</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleManual} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (₦) <span className="text-red-500">*</span></label>
                <input type="number" required min="1000" value={manualForm.amount} onChange={e => setManualForm({...manualForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Screenshot URL</label>
                <input type="url" value={manualForm.screenshot_url} onChange={e => setManualForm({...manualForm, screenshot_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://..." />
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
                The super admin will review and approve your request within 24 hours.
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
