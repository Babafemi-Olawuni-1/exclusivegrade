import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Calendar } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Alert from '../../components/common/Alert'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Sessions() {
  const { get, post, put, del, loading } = useApi()
  const [sessions, setSessions] = useState([])
  const [expanded, setExpanded] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Session modal
  const [sessionModal, setSessionModal] = useState(false)
  const [sessionForm, setSessionForm] = useState({ name: '', is_current: false })
  const [editSession, setEditSession] = useState(null)

  // Term modal
  const [termModal, setTermModal] = useState(false)
  const [termForm, setTermForm] = useState({ session_id:'', name:'', start_date:'', end_date:'', is_current: false })
  const [editTerm, setEditTerm] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetch = useCallback(async () => {
    try {
      const res = await get('/sessions')
      setSessions(res.sessions || [])
    } catch { setError('Failed to load sessions.') }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openAddSession = () => { setSessionForm({ name:'', is_current: false }); setEditSession(null); setSessionModal(true) }
  const openAddTerm = (sessionId) => {
    setTermForm({ session_id: sessionId, name:'', start_date:'', end_date:'', is_current: false })
    setEditTerm(null)
    setTermModal(true)
  }
  const openEditTerm = (term, sessionId) => {
    setTermForm({ session_id: sessionId, name: term.name, start_date: term.start_date || '', end_date: term.end_date || '', is_current: term.is_current })
    setEditTerm(term.id)
    setTermModal(true)
  }

  const handleSessionSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await post('/sessions', sessionForm)
      setSuccess('Session created.')
      setSessionModal(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleTermSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editTerm) await put(`/sessions?action=term&term_id=${editTerm}`, termForm)
      else          await post('/sessions?action=term', termForm)
      setSuccess(editTerm ? 'Term updated.' : 'Term created.')
      setTermModal(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      if (deleteTarget.type === 'term') {
        await del(`/sessions?action=term&term_id=${deleteTarget.id}`)
      } else {
        await del(`/sessions?id=${deleteTarget.id}`)
      }
      setSuccess('Deleted successfully.')
      setDeleteModal(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Sessions & Terms</h1>
          <p className="text-sm text-gray-500">{sessions.length} academic sessions</p>
        </div>
        <Button size="sm" onClick={openAddSession}><Plus className="w-4 h-4" /> Add Session</Button>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No sessions yet. Create your first academic session.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(sess => (
            <div key={sess.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* Session header */}
              <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#F5F5F5] transition-colors"
                onClick={() => setExpanded(prev => ({ ...prev, [sess.id]: !prev[sess.id] }))}
              >
                <div className="flex items-center gap-3">
                  {expanded[sess.id] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <div>
                    <span className="font-semibold">{sess.name}</span>
                    {sess.is_current && <Badge variant="success" className="ml-2">Current</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <Button size="xs" variant="ghost" onClick={() => openAddTerm(sess.id)}>
                    <Plus className="w-3 h-3" /> Add Term
                  </Button>
                  <button onClick={() => { setDeleteTarget({ type:'session', id: sess.id, name: sess.name }); setDeleteModal(true) }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Terms */}
              {expanded[sess.id] && (
                <div className="border-t border-[#E5E5E5] divide-y divide-[#E5E5E5]">
                  {sess.terms?.length === 0 ? (
                    <p className="px-8 py-4 text-sm text-gray-400">No terms yet. Click "Add Term" to create one.</p>
                  ) : sess.terms?.map(term => (
                    <div key={term.id} className="px-8 py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{term.name}</span>
                          {term.is_current && <Badge variant="orange">Current Term</Badge>}
                        </div>
                        {term.start_date && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(term.start_date).toLocaleDateString()} – {term.end_date ? new Date(term.end_date).toLocaleDateString() : 'ongoing'}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditTerm(term, sess.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setDeleteTarget({ type:'term', id: term.id, name: term.name }); setDeleteModal(true) }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Session Modal */}
      <Modal isOpen={sessionModal} onClose={() => setSessionModal(false)} title="Create Session" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setSessionModal(false)}>Cancel</Button><Button form="session-form" type="submit" loading={submitting}>Create Session</Button></div>}
      >
        <form id="session-form" onSubmit={handleSessionSubmit} className="space-y-4">
          <Input label="Session Name" required placeholder="e.g. 2024/2025" value={sessionForm.name} onChange={e => setSessionForm({...sessionForm, name: e.target.value})} />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={sessionForm.is_current} onChange={e => setSessionForm({...sessionForm, is_current: e.target.checked})} className="w-4 h-4 accent-[#FF6B00]" />
            Mark as current session
          </label>
        </form>
      </Modal>

      {/* Term Modal */}
      <Modal isOpen={termModal} onClose={() => setTermModal(false)} title={editTerm ? 'Edit Term' : 'Add Term'}
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setTermModal(false)}>Cancel</Button><Button form="term-form" type="submit" loading={submitting}>{editTerm ? 'Update' : 'Create'}</Button></div>}
      >
        <form id="term-form" onSubmit={handleTermSubmit} className="space-y-4">
          <Input label="Term Name" required placeholder="e.g. First Term" value={termForm.name} onChange={e => setTermForm({...termForm, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={termForm.start_date} onChange={e => setTermForm({...termForm, start_date: e.target.value})} />
            <Input label="End Date" type="date" value={termForm.end_date} onChange={e => setTermForm({...termForm, end_date: e.target.value})} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={termForm.is_current} onChange={e => setTermForm({...termForm, is_current: e.target.checked})} className="w-4 h-4 accent-[#FF6B00]" />
            Mark as current term
          </label>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Confirm Delete" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button><Button variant="danger" loading={submitting} onClick={handleDelete}>Delete</Button></div>}
      >
        <p className="text-sm text-gray-600">Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  )
}
