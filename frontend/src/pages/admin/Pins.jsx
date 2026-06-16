import { useState, useEffect } from 'react'
import { Plus, Trash2, Download, Search, Copy } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { downloadCSV } from '../../utils/helpers'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Modal from '../../components/Modal'
import Card from '../../components/Card'
import Alert from '../../components/Alert'
import Pagination from '../../components/Pagination'

export default function PinManagement() {
  const { get, post, del } = useApi()
  const [pins, setPins] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [showSingleModal, setShowSingleModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [singleFormData, setSingleFormData] = useState({
    student_id: '',
    usage_limit: '1',
  })
  const [bulkFormData, setBulkFormData] = useState({
    class_id: '',
    quantity: '50',
  })

  useEffect(() => {
    fetchPins()
    fetchStudents()
    fetchClasses()
  }, [])

  const fetchPins = async () => {
    try {
      setLoading(true)
      const response = await get('/pins')
      if (response.success) {
        setPins(response.data)
      } else {
        setError(response.message || 'Failed to load PINs')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await get('/students')
      if (response.success) {
        setStudents(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch students', err)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await get('/classes')
      if (response.success) {
        setClasses(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch classes', err)
    }
  }

  const handleGenerateSingle = async (e) => {
    e.preventDefault()
    try {
      const response = await post('/pins/generate-single', singleFormData)
      if (response.success) {
        setSuccess('PIN generated successfully')
        setShowSingleModal(false)
        setSingleFormData({ student_id: '', usage_limit: '1' })
        fetchPins()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGenerateBulk = async (e) => {
    e.preventDefault()
    try {
      const response = await post('/pins/generate-bulk', bulkFormData)
      if (response.success) {
        setSuccess(`${bulkFormData.quantity} PINs generated successfully`)
        setShowBulkModal(false)
        setBulkFormData({ class_id: '', quantity: '50' })
        fetchPins()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeletePin = async (pinId) => {
    if (!window.confirm('Are you sure you want to delete this PIN?')) return

    try {
      const response = await del(`/pins/${pinId}`)
      if (response.success) {
        setSuccess('PIN deleted')
        fetchPins()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCopyPin = (pinCode) => {
    navigator.clipboard.writeText(pinCode)
    setSuccess('PIN copied to clipboard')
  }

  const handleDownloadPins = () => {
    const csvData = filteredPins.map(pin => ({
      'PIN Code': pin.pin_code,
      'Student': `${pin.student?.first_name} ${pin.student?.last_name}`,
      'Admission No': pin.student?.admission_number,
      'Status': pin.status,
      'Usage': `${pin.usage_count}/${pin.usage_limit}`,
      'Expires': pin.expiry_date ? new Date(pin.expiry_date).toLocaleDateString() : 'No',
    }))
    downloadCSV(csvData, 'pins-export.csv')
  }

  const filteredPins = pins.filter(pin => {
    const matchesSearch =
      pin.pin_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pin.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pin.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || pin.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredPins.length / itemsPerPage)
  const paginatedPins = filteredPins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">PIN Management</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleDownloadPins}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Bulk PINs
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowSingleModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate PIN
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} dismissible />}

      {/* Filters */}
      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Search by PIN or student name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            icon={Search}
          />
          <Select
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Used', value: 'used' },
              { label: 'Expired', value: 'expired' },
            ]}
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </Card>

      {/* PINs Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading...</div>
        ) : paginatedPins.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">PIN Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Usage</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expiry</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPins.map((pin, idx) => (
                    <tr key={idx} className="table-row border-b">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-orange-600">{pin.pin_code}</code>
                          <button
                            onClick={() => handleCopyPin(pin.pin_code)}
                            className="text-gray-500 hover:text-orange-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        <p className="font-medium">{pin.student?.first_name} {pin.student?.last_name}</p>
                        <p className="text-sm text-gray-600">{pin.student?.admission_number}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          pin.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : pin.status === 'used'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pin.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {pin.usage_count} / {pin.usage_limit}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {pin.expiry_date
                          ? new Date(pin.expiry_date).toLocaleDateString()
                          : 'No expiry'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeletePin(pin.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-6 border-t flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-gray-600">No PINs generated yet</div>
        )}
      </Card>

      {/* Generate Single PIN Modal */}
      <Modal
        isOpen={showSingleModal}
        onClose={() => setShowSingleModal(false)}
        title="Generate Single PIN"
      >
        <form onSubmit={handleGenerateSingle} className="space-y-4">
          <Select
            label="Select Student *"
            value={singleFormData.student_id}
            onChange={(e) => setSingleFormData({ ...singleFormData, student_id: e.target.value })}
            options={students.map(s => ({
              label: `${s.first_name} ${s.last_name} (${s.admission_number})`,
              value: s.id,
            }))}
            required
          />
          <Select
            label="Usage Limit *"
            value={singleFormData.usage_limit}
            onChange={(e) => setSingleFormData({ ...singleFormData, usage_limit: e.target.value })}
            options={[
              { label: 'Unlimited', value: '0' },
              { label: '1 time', value: '1' },
              { label: '2 times', value: '2' },
              { label: '5 times', value: '5' },
            ]}
            required
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Generate PIN
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowSingleModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generate Bulk PINs Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Generate Bulk PINs"
      >
        <form onSubmit={handleGenerateBulk} className="space-y-4">
          <Select
            label="Select Class *"
            value={bulkFormData.class_id}
            onChange={(e) => setBulkFormData({ ...bulkFormData, class_id: e.target.value })}
            options={classes.map(c => ({
              label: c.name,
              value: c.id,
            }))}
            required
          />
          <Input
            label="Quantity *"
            type="number"
            value={bulkFormData.quantity}
            onChange={(e) => setBulkFormData({ ...bulkFormData, quantity: e.target.value })}
            min="1"
            required
          />
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="text-gray-700">This will generate one PIN per student in the selected class.</p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Generate {bulkFormData.quantity} PINs
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowBulkModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
