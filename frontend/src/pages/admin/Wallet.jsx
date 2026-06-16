import { useState, useEffect } from 'react'
import { CreditCard, Plus, TrendingUp } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { formatCurrency, formatDateTime } from '../../utils/helpers'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'

export default function WalletManagement() {
  const { get, post } = useApi()
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [showFundModal, setShowFundModal] = useState(false)
  const [fundAmount, setFundAmount] = useState('')
  const [fundingLoading, setFundingLoading] = useState(false)

  useEffect(() => {
    fetchWallet()
    fetchTransactions()
  }, [])

  const fetchWallet = async () => {
    try {
      const response = await get('/wallet')
      if (response.success) {
        setWallet(response.data)
      } else {
        setError(response.message || 'Failed to load wallet')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await get('/wallet/transactions')
      if (response.success) {
        setTransactions(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err)
    }
  }

  const handleFund = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setFundingLoading(true)
    try {
      const response = await post('/wallet/fund', {
        amount: parseFloat(fundAmount),
      })

      if (response.success) {
        // Redirect to Paystack payment
        if (response.data.payment_url) {
          window.location.href = response.data.payment_url
        }
        setSuccess('Funding initiated')
        setShowFundModal(false)
        setFundAmount('')
        fetchWallet()
        fetchTransactions()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setFundingLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading wallet...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
        <p className="text-gray-600 mt-2">Manage your wallet balance and PIN credits</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} dismissible />}

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(wallet?.balance || 0)}</p>
            </div>
            <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">PIN Rate</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(wallet?.pin_rate || 0)}</p>
              <p className="text-xs text-gray-500 mt-2">per PIN</p>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-2">PINs Available</p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.floor((wallet?.balance || 0) / (wallet?.pin_rate || 1))}
              </p>
              <p className="text-xs text-gray-500 mt-2">with current balance</p>
            </div>
            <div className="bg-green-100 text-green-600 p-3 rounded-lg">
              <Plus className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Fund Wallet Section */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Add Funds</h3>
            <p className="text-sm text-gray-600 mt-1">Top up your wallet to generate PINs</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowFundModal(true)}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Fund Wallet
          </Button>
        </div>
      </Card>

      {/* Pricing Info */}
      <Card className="bg-blue-50">
        <h3 className="font-bold text-gray-900 mb-4">PIN Pricing with Bulk Discounts</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Plan: Starter</p>
            <p className="text-lg font-bold text-gray-900">₦100/PIN</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Plan: Pro</p>
            <p className="text-lg font-bold text-orange-600">₦80/PIN</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">100+ PINs</p>
            <p className="text-lg font-bold text-green-600">5% off</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">500+ PINs</p>
            <p className="text-lg font-bold text-green-600">10% off</p>
          </div>
        </div>
      </Card>

      {/* Transaction History */}
      <Card>
        <h2 className="text-xl font-bold mb-6 text-gray-900">Transaction History</h2>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trans, idx) => (
                  <tr key={idx} className="table-row border-b">
                    <td className="px-6 py-4 text-gray-900">{formatDateTime(trans.created_at)}</td>
                    <td className="px-6 py-4 text-gray-900">{trans.description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        trans.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trans.type === 'credit' ? '+' : '-'} {trans.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(trans.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        trans.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : trans.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trans.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">No transactions yet</div>
        )}
      </Card>

      {/* Fund Modal */}
      <Modal isOpen={showFundModal} onClose={() => setShowFundModal(false)} title="Fund Wallet">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              min="1000"
              step="100"
            />
            <p className="text-xs text-gray-500 mt-2">Minimum amount: ₦1,000</p>
          </div>

          {fundAmount && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">With {formatCurrency(fundAmount)} you can generate:</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {Math.floor(parseFloat(fundAmount) / (wallet?.pin_rate || 100))} PINs
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="primary"
              onClick={handleFund}
              loading={fundingLoading}
              disabled={fundingLoading}
              className="flex-1"
            >
              Proceed to Payment
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowFundModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
