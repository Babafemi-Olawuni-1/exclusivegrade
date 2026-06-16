import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Filter, Key } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

export default function Pins() {
  const { get, post, del, loading } = useApi()
  const [pins, setPins] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [singleModal, setSingleModal] = useState(false)
  const [bulkModal, setBulkModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const [singleForm, setSingleForm] = useState({ student_id:'', usage_limit:1, expiry_days:30 })
  const [bulkForm, setBulkForm] = useState({ class_id:'', usage_limit:1, expiry_days:30 })

  const fetchPins = useCallback(async () => {
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      const res = await get('/pins', params)
      setPins(res.pins || [])
    } catch { setError('Failed to load PINs.') }
  }, [filterStatus])

  useEffect(() => { fetchPins() }, [fetchPins])
  useEffect(() => {
    Promise.all([get('/students'), get('/classes')]).then(([s, c]) => {
      setStudents(s.students || [])
      setClasses(c.classes || [])
    }).catch(() => {})
  }, [])

  const handleSingle = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await post('/pins?action=single', singleForm)
      setSuccess(`PIN generated: ${res.pin_code}`)
      setSingleModal(false)
      fetchPins()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleBulk = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await post('/pins?action=bulk', bulkForm)
      setSuccess(`${res.count || 'Multiple'} PINs generated successfully.`)
      setBulkModal(false)
      fetchPins()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this PIN?')) return
    try {
      await del(`/pins?id=${id}`)
      setSuccess('PIN deactivated.')
      fetchPins()
    } catch (err) { setError(err.message) }
  }

  const statusBadge = (status) => {
    const map = { active:'success', used:'gray', expired:'error', inactive:'warning' }
    return <Badge variant={map[status] || 'gray'}>{status}</Badge>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">PIN Management</h1>
          <p className="text-sm text-gray-500">{pins.length} PINs generated</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSingleModal(true)}><Key className="w-4 h-4" /> Single PIN</Button>
          <Button size="sm" onClick={() => setBulkModal(true)}><Plus className="w-4 h-4" /> Bulk Generate</Button>
        </div>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filter */}
      <Select
        options={[{value:'',label:'All Statuses'},{value:'active',label:'Active'},{value:'used',label:'Used'},{value:'expired',label:'Expired'}]}
        value={filterStatus}
        onChange={e => setFilterStatus(e.target.value)}
        placeholder={null}
        className="w-48"
      />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : pins.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No PINs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>
                  {['PIN Code','Student','Usage','Expires','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {pins.map(p => (
                  <tr key={p.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#FF6B00]">{p.pin_code}</td>
                    <td className="px-4 py-3">{p.student_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.times_used}/{p.usage_limit}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(p.expiry_date)}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3">
                      {p.status === 'active' && (
                        <button onClick={() => handleDeactivate(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Single PIN Modal */}
      <Modal isOpen={singleModal} onClose={() => setSingleModal(false)} title="Generate Single PIN" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setSingleModal(false)}>Cancel</Button><Button form="single-form" type="submit" loading={submitting}>Generate PIN</Button></div>}
      >
        <form id="single-form" onSubmit={handleSingle} className="space-y-4">
          <Select label="Student" required options={students.map(s => ({ value: s.id, label: `${s.first_name} ${s.surname} (${s.admission_number})` }))} value={singleForm.student_id} onChange={e => setSingleForm({...singleForm, student_id: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Usage Limit" type="number" min="1" value={singleForm.usage_limit} onChange={e => setSingleForm({...singleForm, usage_limit: e.target.value})} />
            <Input label="Expires in (days)" type="number" min="1" value={singleForm.expiry_days} onChange={e => setSingleForm({...singleForm, expiry_days: e.target.value})} />
          </div>
        </form>
      </Modal>

      {/* Bulk PIN Modal */}
      <Modal isOpen={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Generate PINs" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setBulkModal(false)}>Cancel</Button><Button form="bulk-form" type="submit" loading={submitting}>Generate PINs</Button></div>}
      >
        <form id="bulk-form" onSubmit={handleBulk} className="space-y-4">
          <Select label="Class" required options={classes.map(c => ({ value: c.id, label: c.name }))} value={bulkForm.class_id} onChange={e => setBulkForm({...bulkForm, class_id: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Usage Limit" type="number" min="1" value={bulkForm.usage_limit} onChange={e => setBulkForm({...bulkForm, usage_limit: e.target.value})} />
            <Input label="Expires in (days)" type="number" min="1" value={bulkForm.expiry_days} onChange={e => setBulkForm({...bulkForm, expiry_days: e.target.value})} />
          </div>
          <Alert type="info" message="One PIN will be generated for each student in the selected class." />
        </form>
      </Modal>
    </div>
  )
}
