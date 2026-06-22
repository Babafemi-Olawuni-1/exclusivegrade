import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

const EMPTY = { subject:'', class_level:'', question:'', options:['','','',''], correct_answer:'', explanation:'', is_premium: false }

export default function CBT() {
  const { get, post, put, del } = useApi()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filters, setFilters] = useState({ subject: '', class_level: '' })

  const fetch = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.subject)     params.subject     = filters.subject
      if (filters.class_level) params.class_level = filters.class_level
      const res = await get('/cbt?action=questions', params)
      if (res.success) setQuestions(res.data || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [filters])

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal('form') }
  const openEdit = (q) => {
    setForm({ subject: q.subject, class_level: q.class_level, question: q.question, options: q.options||['','','',''], correct_answer: q.correct_answer, explanation: q.explanation||'', is_premium: !!q.is_premium })
    setEditing(q.id)
    setModal('form')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let res
      if (editing) res = await put(`/cbt?action=questions&id=${editing}`, form)
      else         res = await post('/cbt?action=questions', form)
      if (res.success) { setSuccess(editing ? 'Updated.' : 'Added.'); setModal(null); fetch() }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      const res = await del(`/cbt?action=questions&id=${target.id}`)
      if (res.success) { setSuccess('Deleted.'); setModal(null); fetch() }
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const updateOption = (i, v) => { const o=[...form.options]; o[i]=v; setForm({...form, options: o}) }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">CBT Question Bank</h1>
            <p className="text-gray-500 text-sm">{questions.length} questions</p>
          </div>
          <button onClick={openAdd} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm flex items-center gap-2"><Plus size={16}/> Add Question</button>
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        <div className="flex gap-3">
          <input type="text" placeholder="Filter by subject..." value={filters.subject} onChange={e => setFilters({...filters, subject: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-48" />
          <input type="text" placeholder="Filter by class level..." value={filters.class_level} onChange={e => setFilters({...filters, class_level: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 w-48" />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['#','Question','Subject','Class','Type','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? [...Array(5)].map((_,i)=><tr key={i}><td colSpan="6"><div className="h-4 bg-gray-100 rounded animate-pulse m-4"/></td></tr>)
                : questions.length === 0 ? <tr><td colSpan="6" className="py-10 text-center text-gray-400">No questions. Add your first question.</td></tr>
                : questions.map((q,i) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i+1}</td>
                    <td className="px-4 py-3 max-w-xs"><p className="truncate font-medium text-gray-800">{q.question}</p></td>
                    <td className="px-4 py-3 text-gray-600">{q.subject}</td>
                    <td className="px-4 py-3 text-gray-600">{q.class_level}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${q.is_premium?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-600'}`}>{q.is_premium?'Premium':'Free'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(q)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15}/></button>
                        <button onClick={() => { setTarget(q); setModal('delete') }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal === 'form' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{editing ? 'Edit Question' : 'Add Question'}</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Subject <span className="text-red-500">*</span></label>
                  <input required type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Class Level <span className="text-red-500">*</span></label>
                  <input required type="text" value={form.class_level} onChange={e => setForm({...form, class_level: e.target.value})} placeholder="e.g. JSS 1"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Question <span className="text-red-500">*</span></label>
                <textarea required rows={3} value={form.question} onChange={e => setForm({...form, question: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Options</label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {String.fromCharCode(65+i)}
                      </span>
                      <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65+i)}`}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Correct Answer <span className="text-red-500">*</span></label>
                <select required value={form.correct_answer} onChange={e => setForm({...form, correct_answer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Select Correct Answer --</option>
                  {form.options.filter(Boolean).map((o,i)=><option key={i} value={o}>{String.fromCharCode(65+i)}: {o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Explanation (optional)</label>
                <input type="text" value={form.explanation} onChange={e => setForm({...form, explanation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_premium} onChange={e => setForm({...form, is_premium: e.target.checked})} className="w-4 h-4 accent-purple-600"/>
                Mark as Premium Question
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Saving...' : (editing ? 'Update' : 'Add')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Delete Question</h2>
            <p className="text-gray-600 text-sm mb-5">Delete this question permanently?</p>
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
