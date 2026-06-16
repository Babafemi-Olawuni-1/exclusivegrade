import { useState, useEffect, useCallback } from 'react'
import { Eye, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import Badge from '../../components/common/Badge'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Schools() {
  const { get, put, loading } = useApi()
  const [schools, setSchools] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [viewModal, setViewModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [editForm, setEditForm] = useState({ status:'', plan:'' })
  const [submitting, setSubmitting] = useState(false)

  const fetch = useCallback(async () => {
    try {
      const res = await get('/super?action=schools', { page, per_page: 20 })
      setSchools(res.schools || [])
      setTotal(res.total || 0)
    } catch { setError('Failed to load schools.') }
  }, [page])

  useEffect(() => { fetch() }, [fetch])

  const openEdit = (school) => {
    setSelected(school)
    setEditForm({ status: school.status, plan: school.plan })
    setEditModal(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await put(`/super?action=school&id=${selected.id}`, editForm)
      setSuccess('School updated.')
      setEditModal(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const statusBadge = (status) => {
    const map = { active:'success', suspended:'error', pending:'warning' }
    return <Badge variant={map[status]||'gray'}>{status}</Badge>
  }

  const planBadge = (plan) => {
    const map = { starter:'gray', pro:'orange', enterprise:'info' }
    return <Badge variant={map[plan]||'gray'}>{plan}</Badge>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Schools</h1>
          <p className="text-sm text-gray-500">{total} registered schools</p>
        </div>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>{['School','Email','Plan','Status','Students','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {schools.map(s => (
                  <tr key={s.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.email}</td>
                    <td className="px-4 py-3">{planBadge(s.plan)}</td>
                    <td className="px-4 py-3">{statusBadge(s.status)}</td>
                    <td className="px-4 py-3 text-gray-600">{s.student_count || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelected(s); setViewModal(true) }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-orange-50 text-[#FF6B00]"><TrendingUp className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={page} totalPages={Math.ceil(total/20)} onPageChange={setPage} totalItems={total} perPage={20} />
      </div>

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="School Details" size="lg">
        {selected && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[['Name',selected.name],['Email',selected.email],['Plan',selected.plan],['Status',selected.status],['Students',selected.student_count||0],['Teachers',selected.teacher_count||0],['Slug',selected.slug],['Balance',selected.wallet_balance||0]].map(([k,v]) => (
              <div key={k} className="bg-[#F5F5F5] rounded-xl p-3">
                <p className="text-xs text-gray-500">{k}</p>
                <p className="font-semibold mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Update School" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setEditModal(false)}>Cancel</Button><Button form="edit-school-form" type="submit" loading={submitting}>Update</Button></div>}
      >
        <form id="edit-school-form" onSubmit={handleEdit} className="space-y-4">
          <Select label="Status" options={[{value:'active',label:'Active'},{value:'suspended',label:'Suspended'},{value:'pending',label:'Pending'}]} value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value})} placeholder={null} />
          <Select label="Plan" options={[{value:'starter',label:'Starter (Free)'},{value:'pro',label:'Pro'},{value:'enterprise',label:'Enterprise'}]} value={editForm.plan} onChange={e=>setEditForm({...editForm,plan:e.target.value})} placeholder={null} />
        </form>
      </Modal>
    </div>
  )
}
