import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Copy, Eye, EyeOff } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Alert from '../../components/common/Alert'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const EMPTY = { first_name: '', last_name: '', email: '' }

export default function Teachers() {
  const { get, post, put, del, loading } = useApi()

  const [teachers, setTeachers] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [credModal, setCredModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [credentials, setCredentials] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await get('/teachers')
      setTeachers(res.teachers || [])
    } catch { setError('Failed to load teachers.') }
  }, [])

  useEffect(() => { fetchTeachers() }, [fetchTeachers])

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModalOpen(true) }
  const openEdit = (t) => { setForm({ first_name: t.first_name, last_name: t.last_name, email: t.email }); setEditing(t.id); setModalOpen(true) }
  const openDel  = (t) => { setTarget(t); setDeleteModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editing) {
        await put(`/teachers?id=${editing}`, form)
        setSuccess('Teacher updated.')
        setModalOpen(false)
        fetchTeachers()
      } else {
        const res = await post('/teachers', form)
        setModalOpen(false)
        setCredentials({ username: res.username, password: res.default_password, name: `${form.first_name} ${form.last_name}` })
        setCredModal(true)
        fetchTeachers()
      }
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await del(`/teachers?id=${target.id}`)
      setSuccess('Teacher deactivated.')
      setDeleteModal(false)
      fetchTeachers()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
  }

  const set = k => e => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Teachers</h1>
          <p className="text-sm text-gray-500">{teachers.length} teachers registered</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4" /> Add Teacher</Button>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">No teachers yet.</p>
            <p className="text-sm mt-1">Add your first teacher to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>
                  {['Name','Email','Username','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {teachers.map(t => (
                  <tr key={t.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-3 font-medium">{t.first_name} {t.last_name}</td>
                    <td className="px-4 py-3 text-gray-600">{t.email}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{t.username}</td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status === 'active' ? 'success' : 'gray'}>
                        {t.status || 'active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openDel(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Teacher' : 'Add Teacher'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button form="teacher-form" type="submit" loading={submitting}>
              {editing ? 'Update' : 'Add'} Teacher
            </Button>
          </div>
        }
      >
        <form id="teacher-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required value={form.first_name} onChange={set('first_name')} />
            <Input label="Last Name"  required value={form.last_name}  onChange={set('last_name')} />
          </div>
          <Input label="Email Address" type="email" required value={form.email} onChange={set('email')} />
          {!editing && (
            <Alert type="info" message="A username and default password will be auto-generated and shown to you after creation." />
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Deactivate Teacher"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={submitting} onClick={handleDelete}>Deactivate</Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Deactivate <strong>{target?.first_name} {target?.last_name}</strong>? They won't be able to log in.
        </p>
      </Modal>

      {/* Credentials Modal */}
      <Modal
        isOpen={credModal}
        onClose={() => setCredModal(false)}
        title="Teacher Credentials"
        size="sm"
        footer={
          <Button fullWidth onClick={() => setCredModal(false)}>Done</Button>
        }
      >
        <Alert type="success" message={`${credentials?.name} has been added successfully.`} className="mb-5" />
        <p className="text-sm text-gray-600 mb-4">
          Share these login credentials with the teacher. The password can be changed after first login.
        </p>
        <div className="space-y-3">
          <div className="bg-[#F5F5F5] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Username</p>
              <p className="font-mono font-bold">{credentials?.username}</p>
            </div>
            <button onClick={() => copyToClipboard(credentials?.username)} className="p-1.5 rounded-lg hover:bg-[#E5E5E5]">
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="bg-[#F5F5F5] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Default Password</p>
              <p className="font-mono font-bold">{showPwd ? credentials?.password : '••••••••'}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowPwd(!showPwd)} className="p-1.5 rounded-lg hover:bg-[#E5E5E5]">
                {showPwd ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
              </button>
              <button onClick={() => copyToClipboard(credentials?.password)} className="p-1.5 rounded-lg hover:bg-[#E5E5E5]">
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
