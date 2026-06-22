import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, X, Cpu } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function LessonNotes() {
  const { get, post, put, del } = useApi()
  const [notes, setNotes] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ topic: '', content: '', class_id: '', subject_id: '' })
  const [aiForm, setAiForm] = useState({ topic: '', class: '', subject: '', class_id: '', subject_id: '' })
  const [aiLoading, setAiLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await get('/lesson-notes')
      if (res.success) setNotes(res.data || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetch()
    Promise.allSettled([get('/classes'), get('/subjects')]).then(([c,s]) => {
      if (c.value?.success) setClasses(c.value.data || [])
      if (s.value?.success) setSubjects(s.value.data || [])
    })
  }, [])

  const openAdd  = () => { setForm({topic:'',content:'',class_id:'',subject_id:''}); setEditing(null); setModal('form') }
  const openEdit = (n) => { setForm({topic:n.topic,content:n.content,class_id:n.class_id||'',subject_id:n.subject_id||''}); setEditing(n.id); setModal('form') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let res
      if (editing) res = await put(`/lesson-notes?id=${editing}`, form)
      else         res = await post('/lesson-notes', form)
      if (res.success) { setSuccess(editing ? 'Note updated.' : 'Note created.'); setModal(null); fetch() }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      const res = await del(`/lesson-notes?id=${target.id}`)
      if (res.success) { setSuccess('Note deleted.'); setModal(null); fetch() }
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleAI = async (e) => {
    e.preventDefault()
    setAiLoading(true)
    setError('')
    try {
      const res = await post('/lesson-notes/ai', aiForm)
      if (res.success) {
        setForm({ topic: aiForm.topic, content: res.data?.content || res.data || '', class_id: aiForm.class_id, subject_id: aiForm.subject_id })
        setEditing(null)
        setModal('form')
        setSuccess('AI note generated! Review and save.')
      } else setError(res.message || 'AI generation failed. Ensure OpenAI key is configured.')
    } catch(err) { setError(err.message || 'AI generation failed.') }
    finally { setAiLoading(false) }
  }

  const getClassName    = id => classes.find(c=>c.id==id)?.name || '—'
  const getSubjectName  = id => subjects.find(s=>s.id==id)?.name || '—'

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lesson Notes</h1>
            <p className="text-gray-500 text-sm">{notes.length} notes</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setAiForm({topic:'',class:'',subject:'',class_id:'',subject_id:''}); setModal('ai') }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm flex items-center gap-2"><Cpu size={16}/> AI Generate</button>
            <button onClick={openAdd} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm flex items-center gap-2"><Plus size={16}/> Add Note</button>
          </div>
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-12 bg-gray-100 rounded animate-pulse"/>)}</div>
          ) : notes.length === 0 ? (
            <div className="py-12 text-center text-gray-400">No lesson notes yet. Add one or generate with AI.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notes.map(n => (
                <div key={n.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{n.topic}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{getClassName(n.class_id)} · {getSubjectName(n.subject_id)} · {new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setTarget(n); setModal('view') }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><Eye size={15}/></button>
                    <button onClick={() => openEdit(n)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15}/></button>
                    <button onClick={() => { setTarget(n); setModal('delete') }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal === 'form' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{editing ? 'Edit Note' : 'Add Lesson Note'}</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Topic <span className="text-red-500">*</span></label>
                <input required type="text" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Class</label>
                  <select value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">-- None --</option>
                    {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
                  <select value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">-- None --</option>
                    {subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Content <span className="text-red-500">*</span></label>
                <textarea required rows={10} value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Saving...' : (editing ? 'Update' : 'Save Note')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && target && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{target.topic}</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            <p className="text-xs text-gray-400 mb-4">{getClassName(target.class_id)} · {getSubjectName(target.subject_id)} · {new Date(target.created_at).toLocaleDateString()}</p>
            <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{target.content}</div>
            <button onClick={() => setModal(null)} className="w-full mt-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Delete Note</h2>
            <p className="text-gray-600 text-sm mb-5">Delete <strong>{target?.topic}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {modal === 'ai' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Generate with AI</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-700">
              Requires OpenAI API key configured in the backend .env file.
            </div>
            <form onSubmit={handleAI} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Topic <span className="text-red-500">*</span></label>
                <input required type="text" value={aiForm.topic} onChange={e => setAiForm({...aiForm, topic: e.target.value})}
                  placeholder="e.g. Photosynthesis"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Class Level <span className="text-red-500">*</span></label>
                  <input required type="text" value={aiForm.class} onChange={e => setAiForm({...aiForm, class: e.target.value})}
                    placeholder="e.g. JSS 2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Subject <span className="text-red-500">*</span></label>
                  <input required type="text" value={aiForm.subject} onChange={e => setAiForm({...aiForm, subject: e.target.value})}
                    placeholder="e.g. Biology"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={aiLoading} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Cpu size={14}/> {aiLoading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
