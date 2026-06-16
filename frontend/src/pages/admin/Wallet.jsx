import { useState, useEffect } from 'react'
import { Wallet as WalletIcon, Plus, Upload, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Alert from '../../components/common/Alert'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCurrency, formatDate } from '../../utils/helpers'

export default function Wallet() {
  const { get, post, loading } = useApi()
  const [walletData, setWalletData] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fundModal, setFundModal] = useState(false)
  const [manualModal, setManualModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fundForm, setFundForm] = useState({ amount: '' })
  const [manualForm, setManualForm] = useState({ amount: '', screenshot_url: '' })

  useEffect(() => {
    get('/wallet').then(r => setWalletData(r)).catch(() => setError('Failed to load wallet.'))
  }, [])

  const handleFund = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await post('/wallet?action=fund', fundForm)
      if (res.payment_url) {
        window.open(res.payment_url, '_blank')
      }
      setSuccess('Redirecting to payment...')
      setFundModal(false)
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleManual = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await post('/wallet?action=manual-request', manualForm)
      setSuccess('Manual payment request submitted. Admin will review and approve.')
      setManualModal(false)
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const typeIcon = (type) => type === 'credit'
    ? <ArrowDownLeft className="w-4 h-4 text-green-600" />
    : <ArrowUpRight className="w-4 h-4 text-red-500" />

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-[#1A1A1A]">Wallet</h1>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <>
          {/* Balance card */}
          <div className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Available Balance</p>
                <p className="text-4xl font-bold">{formatCurrency(walletData?.balance || 0)}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#FF6B00]/20 flex items-center justify-center">
                <WalletIcon className="w-7 h-7 text-[#FF6B00]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button size="sm" onClick={() => setFundModal(true)}>
                <Plus className="w-4 h-4" /> Fund Wallet
              </Button>
              <Button variant="ghost" size="sm" className="text-white border border-white/30 hover:bg-white/10" onClick={() => setManualModal(true)}>
                <Upload className="w-4 h-4" /> Manual Payment
              </Button>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E5E5]">
              <h2 className="font-semibold">Transaction History</h2>
            </div>
            {!walletData?.transactions?.length ? (
              <p className="text-center py-12 text-gray-400 text-sm">No transactions yet.</p>
            ) : (
              <div className="divide-y divide-[#E5E5E5]">
                {walletData.transactions.map(tx => (
                  <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {typeIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description || tx.type}</p>
                        <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <Badge variant={tx.status === 'success' ? 'success' : 'warning'} className="text-xs">{tx.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Fund Modal */}
      <Modal isOpen={fundModal} onClose={() => setFundModal(false)} title="Fund Wallet" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setFundModal(false)}>Cancel</Button><Button form="fund-form" type="submit" loading={submitting}>Proceed to Payment</Button></div>}
      >
        <form id="fund-form" onSubmit={handleFund} className="space-y-4">
          <Input label="Amount (₦)" type="number" min="100" required value={fundForm.amount} onChange={e => setFundForm({amount: e.target.value})} placeholder="e.g. 5000" />
          <Alert type="info" message="You will be redirected to Paystack to complete payment." />
        </form>
      </Modal>

      {/* Manual Payment Modal */}
      <Modal isOpen={manualModal} onClose={() => setManualModal(false)} title="Request Manual Payment" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setManualModal(false)}>Cancel</Button><Button form="manual-form" type="submit" loading={submitting}>Submit Request</Button></div>}
      >
        <form id="manual-form" onSubmit={handleManual} className="space-y-4">
          <Input label="Amount (₦)" type="number" min="100" required value={manualForm.amount} onChange={e => setManualForm({...manualForm, amount: e.target.value})} />
          <Input label="Payment Screenshot URL" type="url" value={manualForm.screenshot_url} onChange={e => setManualForm({...manualForm, screenshot_url: e.target.value})} placeholder="https://..." />
          <Alert type="info" message="Upload proof of payment. The super admin will review and approve your request." />
        </form>
      </Modal>
    </div>
  )
}
