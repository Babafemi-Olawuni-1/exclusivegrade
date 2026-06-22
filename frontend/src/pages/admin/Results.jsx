import { useState, useEffect } from 'react'
import { Eye, CheckCircle, RotateCcw, Filter, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Results() {
  const { get, post } = useApi()
  const [results, setResults] = useState([])
  const [classes, setClasses] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ class_id: '', term_id: '', status: '' })
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [actionForm, setActionForm] = useState({ admin_comment: '', next_term_begins: '', feedback: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const allTerms = sessions.flatMap(s => (s.terms || []).map(t => ({ ...t, session_name: s.name })))

  useEffect(() => { fetchData() }, [filters])
  useEffect(() => {
    Promise.allSettled([get('/classes'), get('/sessions')]).then(([c, s]) => {
      setClasses(c.value?.data || [])
      setSessions(s.value?.data || [])
    })
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.class_id) params.class_id = filters.class_id
      if (filters.term_id)  params.term_id  = filters.term_id
      if (filters.status)   params.status   = filters.status
      const res = await get('/results', params)
      setResults(res?.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleAction = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { result_ids: [selected.id] }
      if (modal === 'publish') {
        payload.admin_comment    = actionForm.admin_comment
        payload.next_term_begins = actionForm.next_term_begins
      } else {
        payload.feedback = actionForm.feedback
      }
      await post(`/results?action=${modal}`, payload)
      setSuccess(`Result ${modal === 'publish' ? 'published' : 'returned'} successfully.`)
      setModal(null); fetchData()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const statusBadge = (status) => {
    const map = {
      draft:     'bg-gray-100 text-gray-600',
      submitted: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      returned:  'bg-red-100 text-red-700',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || map.draft}`}>{status}</span>
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Results</h1>
          <p className="text-gray-500 text-sm">Review, publish, or return student results</p>
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700"><Filter size={16} /> Filters</div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <select value={filters.class_id} onChange={e => setFilters({...filters, class_id: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filters.term_id} onChange={e => setFilters({...filters, term_id: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">All Terms</option>
              {allTerms.map(t => <option key={t.id} value={t.id}>{t.name} ({t.session_name})</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="published">Published</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Student','Class','Subject','Term','CA1','CA2','Exam','Total','Grade','Status','Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan="11" className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : results.length === 0 ? (
                  <tr><td colSpan="11" className="py-10 text-center text-gray-400">No results found. Adjust filters or ask teachers to upload results.</td></tr>
                ) : results.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-800 whitespace-nowrap">{r.first_name} {r.last_name}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{r.class_name}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{r.subject_name}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{r.term_name}</td>
                    <td className="px-3 py-3 text-center">{r.ca1 ?? '—'}</td>
                    <td className="px-3 py-3 text-center">{r.ca2 ?? '—'}</td>
                    <td className="px-3 py-3 text-center">{r.exam ?? '—'}</td>
                    <td className="px-3 py-3 text-center font-bold text-purple-700">{r.total ?? '—'}</td>
                    <td className="px-3 py-3 text-center font-bold">{r.grade || '—'}</td>
                    <td className="px-3 py-3">{statusBadge(r.status)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelected(r); setModal('view') }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="View"><Eye size={15} /></button>
                        {r.status === 'submitted' && <>
                          <button onClick={() => { setSelected(r); setActionForm({admin_comment:'',next_term_begins:'',feedback:''}); setModal('publish') }} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Publish"><CheckCircle size={15} /></button>
                          <button onClick={() => { setSelected(r); setActionForm({admin_comment:'',next_term_begins:'',feedback:''}); setModal('return') }} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Return"><RotateCcw size={15} /></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Result Details</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-4">
              {[['Student', `${selected.first_name} ${selected.last_name}`],['Subject',selected.subject_name],['Class',selected.class_name],['Term',selected.term_name],['CA1',selected.ca1],['CA2',selected.ca2],['Exam',selected.exam],['Total',selected.total],['Grade',selected.grade],['Status',selected.status]].map(([k,v]) => (
                <div key={k}><p className="text-xs text-gray-400">{k}</p><p className="font-semibold">{v ?? '—'}</p></div>
              ))}
            </div>
            {selected.teacher_comment && <div className="mt-4 bg-blue-50 rounded-xl p-3 text-sm text-blue-700"><p className="font-semibold mb-1">Teacher Comment</p><p className="italic">"{selected.teacher_comment}"</p></div>}
            <button onClick={() => setModal(null)} className="w-full mt-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Publish / Return Modal */}
      {(modal === 'publish' || modal === 'return') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{modal === 'publish' ? 'Publish Result' : 'Return to Teacher'}</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400" /></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleAction} className="space-y-4">
              {modal === 'publish' ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Principal's Comment (optional)</label>
                    <textarea rows={3} value={actionForm.admin_comment} onChange={e => setActionForm({...actionForm, admin_comment: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Next Term Begins</label>
                    <input type="date" value={actionForm.next_term_begins} onChange={e => setActionForm({...actionForm, next_term_begins: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Feedback to Teacher <span className="text-red-500">*</span></label>
                  <textarea required rows={3} value={actionForm.feedback} onChange={e => setActionForm({...actionForm, feedback: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Reason for returning..." />
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className={`flex-1 py-2 rounded-xl text-white text-sm disabled:opacity-50 ${modal === 'publish' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>
                  {saving ? 'Processing...' : modal === 'publish' ? 'Publish' : 'Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
