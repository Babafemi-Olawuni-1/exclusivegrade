import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Users } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Classes() {
  const { get, post, put, del, loading } = useApi()
  const [classes, setClasses] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchClasses = useCallback(async () => {
    try {
      const res = await get('/classes')
      setClasses(res.classes || [])
    } catch { setError('Failed to load classes.') }
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const openAdd  = () => { setForm({ name:'', description:'' }); setEditing(null); setModalOpen(true) }
  const openEdit = (c) => { setForm({ name: c.name, description: c.description || '' }); setEditing(c.id); setModalOpen(true) }
  const openDel  = (c) => { setTarget(c); setDeleteModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editing) await put(`/classes?id=${editing}`, form)
      else         await post('/classes', form)
      setSuccess(editing ? 'Class updated.' : 'Class created.')
      setModalOpen(false)
      fetchClasses()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await del(`/classes?id=${target.id}`)
      setSuccess('Class deleted.')
      setDeleteModal(false)
      fetchClasses()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Classes</h1>
          <p className="text-sm text-gray-500">{classes.length} classes</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4" /> Add Class</Button>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-card text-gray-400">
              <p className="font-medium">No classes yet. Create your first class.</p>
            </div>
          ) : classes.map(c => (
            <div key={c.id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">{c.name}</h3>
                  {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => openDel(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Users className="w-3.5 h-3.5" />
                {c.student_count || 0} students
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Class' : 'Add Class'}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button form="class-form" type="submit" loading={submitting}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        }
      >
        <form id="class-form" onSubmit={handleSubmit} className="space-y-4">
          <Input label="Class Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. JSS 1A" />
          <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional" />
        </form>
      </Modal>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Class"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={submitting} onClick={handleDelete}>Delete</Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Delete class <strong>{target?.name}</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
