import { useState, useEffect } from 'react'
import { Plus, ChevronDown, ChevronRight, Trash2, Edit2, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Sessions() {
  const { get, post, put, del } = useApi()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [sessionForm, setSessionForm] = useState({ name: '', is_current: false })
  const [termForm, setTermForm] = useState({ session_id: '', name: '', start_date: '', end_date: '', is_current: false })
  const [editTerm, setEditTerm] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await get('/sessions')
      setSessions(res?.data || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleCreateSession = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await post('/sessions', sessionForm)
      setSuccess('Session created.'); setModal(null); fetch()
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleSaveTerm = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (editTerm) await put(`/sessions?action=term&term_id=${editTerm}`, termForm)
      else          await post('/sessions?action=term', termForm)
      setSuccess(editTerm ? 'Term updated.' : 'Term created.'); setModal(null); fetch()
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      if (deleteTarget.type === 'term') await del(`/sessions?action=term&term_id=${deleteTarget.id}`)
      else                              await del(`/sessions?id=${deleteTarget.id}`)
      setSuccess('Deleted.'); setModal(null); fetch()
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sessions & Terms</h1>
            <p className="text-gray-500 text-sm">Manage academic sessions and terms</p>
          </div>
          <button onClick={() => { setSessionForm({name:'',is_current:false}); setModal('session') }}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Session
          </button>
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
        ) : sessions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">No sessions yet. Create your first academic session.</div>
        ) : (
          <div className="space-y-4">
            {sessions.map(sess => (
              <div key={sess.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded(p => ({...p, [sess.id]: !p[sess.id]}))}>
                  <div className="flex items-center gap-3">
                    {expanded[sess.id] ? <ChevronDown size={18} className="text-gray-400"/> : <ChevronRight size={18} className="text-gray-400"/>}
                    <span className="font-semibold text-gray-800">{sess.name}</span>
                    {sess.is_current ? <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Current</span> : null}
                    <span className="text-xs text-gray-400">{sess.terms?.length || 0} terms</span>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setTermForm({session_id: sess.id, name:'', start_date:'', end_date:'', is_current: false}); setEditTerm(null); setModal('term') }}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 flex items-center gap-1">
                      <Plus size={12}/> Add Term
                    </button>
                    <button onClick={() => { setDeleteTarget({type:'session', id: sess.id, name: sess.name}); setModal('delete') }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                  </div>
                </div>

                {expanded[sess.id] && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {!sess.terms?.length ? (
                      <p className="px-8 py-4 text-sm text-gray-400">No terms yet. Click "Add Term".</p>
                    ) : sess.terms.map(term => (
                      <div key={term.id} className="px-8 py-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">{term.name}</span>
                            {term.is_current ? <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Current Term</span> : null}
                          </div>
                          {term.start_date && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(term.start_date).toLocaleDateString()} — {term.end_date ? new Date(term.end_date).toLocaleDateString() : 'ongoing'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setTermForm({session_id: sess.id, name: term.name, start_date: term.start_date||'', end_date: term.end_date||'', is_current: !!term.is_current}); setEditTerm(term.id); setModal('term') }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15}/></button>
                          <button onClick={() => { setDeleteTarget({type:'term', id: term.id, name: term.name}); setModal('delete') }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Modal */}
      {modal === 'session' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create Session</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Session Name <span className="text-red-500">*</span></label>
                <input type="text" required value={sessionForm.name} onChange={e => setSessionForm({...sessionForm, name: e.target.value})}
                  placeholder="e.g. 2024/2025"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={sessionForm.is_current} onChange={e => setSessionForm({...sessionForm, is_current: e.target.checked})} className="w-4 h-4 accent-purple-600" />
                Mark as current session
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create Session'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Term Modal */}
      {modal === 'term' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{editTerm ? 'Edit Term' : 'Add Term'}</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleSaveTerm} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Term Name <span className="text-red-500">*</span></label>
                <select required value={termForm.name} onChange={e => setTermForm({...termForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Select Term --</option>
                  <option>First Term</option><option>Second Term</option><option>Third Term</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
                  <input type="date" value={termForm.start_date} onChange={e => setTermForm({...termForm, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
                  <input type="date" value={termForm.end_date} onChange={e => setTermForm({...termForm, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={termForm.is_current} onChange={e => setTermForm({...termForm, is_current: e.target.checked})} className="w-4 h-4 accent-purple-600" />
                Mark as current term
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Saving...' : (editTerm ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Confirm Delete</h2>
            <p className="text-gray-600 text-sm mb-5">Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
