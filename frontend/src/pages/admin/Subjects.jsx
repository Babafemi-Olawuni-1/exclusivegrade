import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Copy } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Subjects() {
  const { get, post, put, del, loading } = useApi()
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [classFilter, setClassFilter] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [copyModal, setCopyModal] = useState(false)
  const [form, setForm] = useState({ name: '', class_id: '' })
  const [copyForm, setCopyForm] = useState({ source_class_id: '', destination_class_id: '' })
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchSubjects = useCallback(async () => {
    try {
      const params = {}
      if (classFilter) params.class_id = classFilter
      const res = await get('/subjects', params)
      setSubjects(res.subjects || [])
    } catch { setError('Failed to load subjects.') }
  }, [classFilter])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])
  useEffect(() => {
    get('/classes').then(r => setClasses(r.classes || [])).catch(() => {})
  }, [])

  const openAdd  = () => { setForm({ name:'', class_id: classFilter || '' }); setEditing(null); setModalOpen(true) }
  const openEdit = (s) => { setForm({ name: s.name, class_id: s.class_id }); setEditing(s.id); setModalOpen(true) }
  const openDel  = (s) => { setTarget(s); setDeleteModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editing) await put(`/subjects?id=${editing}`, form)
      else         await post('/subjects', form)
      setSuccess(editing ? 'Subject updated.' : 'Subject added.')
      setModalOpen(false)
      fetchSubjects()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await del(`/subjects?id=${target.id}`)
      setSuccess('Subject deleted.')
      setDeleteModal(false)
      fetchSubjects()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleCopy = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await post('/subjects?action=copy', copyForm)
      setSuccess('Subjects copied successfully.')
      setCopyModal(false)
      fetchSubjects()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Subjects</h1>
          <p className="text-sm text-gray-500">{subjects.length} subjects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCopyModal(true)}><Copy className="w-4 h-4" /> Copy Subjects</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4" /> Add Subject</Button>
        </div>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Class filter */}
      <Select
        options={[{ value:'', label:'All Classes' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
        value={classFilter}
        onChange={e => setClassFilter(e.target.value)}
        placeholder={null}
        className="w-48"
      />

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="font-medium">No subjects found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>
                  {['Subject Name','Class','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {subjects.map(s => (
                  <tr key={s.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.class_name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openDel(s)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'} size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button form="subject-form" type="submit" loading={submitting}>{editing ? 'Update' : 'Add'}</Button></div>}
      >
        <form id="subject-form" onSubmit={handleSubmit} className="space-y-4">
          <Input label="Subject Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <Select label="Class" required options={classes.map(c => ({ value: c.id, label: c.name }))} value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})} />
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Subject" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button><Button variant="danger" loading={submitting} onClick={handleDelete}>Delete</Button></div>}
      >
        <p className="text-sm text-gray-600">Delete <strong>{target?.name}</strong>? This cannot be undone.</p>
      </Modal>

      {/* Copy Modal */}
      <Modal isOpen={copyModal} onClose={() => setCopyModal(false)} title="Copy Subjects Between Classes"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setCopyModal(false)}>Cancel</Button><Button form="copy-form" type="submit" loading={submitting}>Copy Subjects</Button></div>}
      >
        <form id="copy-form" onSubmit={handleCopy} className="space-y-4">
          <Alert type="info" message="All subjects from the source class will be copied to the destination class." />
          <Select label="Source Class" required options={classes.map(c => ({ value: c.id, label: c.name }))} value={copyForm.source_class_id} onChange={e => setCopyForm({...copyForm, source_class_id: e.target.value})} />
          <Select label="Destination Class" required options={classes.map(c => ({ value: c.id, label: c.name }))} value={copyForm.destination_class_id} onChange={e => setCopyForm({...copyForm, destination_class_id: e.target.value})} />
        </form>
      </Modal>
    </div>
  )
}
