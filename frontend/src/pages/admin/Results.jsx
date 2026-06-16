import { useState, useEffect, useCallback } from 'react'
import { Eye, CheckCircle, RotateCcw, Filter } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Select from '../../components/forms/Select'
import Input from '../../components/forms/Input'
import Alert from '../../components/common/Alert'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { getGrade, gradeColor } from '../../utils/helpers'

export default function Results() {
  const { get, post, loading } = useApi()
  const [results, setResults] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [sessions, setSessions] = useState([])
  const [terms, setTerms] = useState([])
  const [filters, setFilters] = useState({ class_id:'', subject_id:'', term_id:'', status:'' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [actionModal, setActionModal] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [actionType, setActionType] = useState('')
  const [actionData, setActionData] = useState({ admin_comment:'', next_term_begins:'', feedback:'' })

  const fetchResults = useCallback(async () => {
    try {
      const res = await get('/results', filters)
      setResults(res.results || [])
    } catch { setError('Failed to load results.') }
  }, [filters])

  useEffect(() => { fetchResults() }, [fetchResults])
  useEffect(() => {
    Promise.all([get('/classes'), get('/subjects'), get('/sessions')]).then(([c, s, sess]) => {
      setClasses(c.classes || [])
      setSubjects(s.subjects || [])
      setSessions(sess.sessions || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (filters.session_id) {
      const sess = sessions.find(s => s.id == filters.session_id)
      setTerms(sess?.terms || [])
    }
  }, [filters.session_id, sessions])

  const openAction = (type, result) => {
    setActionType(type)
    setSelectedResult(result)
    setActionData({ admin_comment:'', next_term_begins:'', feedback:'' })
    setActionModal(true)
  }

  const handleAction = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = { result_ids: [selectedResult.id] }
      if (actionType === 'publish') {
        payload.admin_comment = actionData.admin_comment
        payload.next_term_begins = actionData.next_term_begins
      } else {
        payload.feedback = actionData.feedback
      }
      await post(`/results?action=${actionType}`, payload)
      setSuccess(`Result ${actionType === 'publish' ? 'published' : 'returned to teacher'} successfully.`)
      setActionModal(false)
      fetchResults()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const statusBadge = (status) => {
    const map = { draft:'gray', submitted:'warning', published:'success', returned:'error' }
    return <Badge variant={map[status] || 'gray'}>{status}</Badge>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Results Management</h1>
          <p className="text-sm text-gray-500">{results.length} result records</p>
        </div>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            placeholder="All Classes"
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            value={filters.class_id}
            onChange={e => setFilters({...filters, class_id: e.target.value})}
          />
          <Select
            placeholder="All Subjects"
            options={subjects.map(s => ({ value: s.id, label: s.name }))}
            value={filters.subject_id}
            onChange={e => setFilters({...filters, subject_id: e.target.value})}
          />
          <Select
            placeholder="All Terms"
            options={sessions.flatMap(s => s.terms?.map(t => ({ value: t.id, label: `${t.name} (${s.name})` })) || [])}
            value={filters.term_id}
            onChange={e => setFilters({...filters, term_id: e.target.value})}
          />
          <Select
            placeholder="All Statuses"
            options={[{value:'draft',label:'Draft'},{value:'submitted',label:'Submitted'},{value:'published',label:'Published'},{value:'returned',label:'Returned'}]}
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="font-medium">No results found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>
                  {['Student','Class','Subject','Term','Total','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {results.map(r => (
                  <tr key={r.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-3 font-medium">{r.student_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.class_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.subject_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.term_name || '—'}</td>
                    <td className={`px-4 py-3 font-bold ${gradeColor(r.total)}`}>{r.total ?? '—'}</td>
                    <td className="px-4 py-3">{statusBadge(r.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedResult(r); setViewModal(true) }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {r.status === 'submitted' && (
                          <>
                            <button onClick={() => openAction('publish', r)}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Publish">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openAction('return', r)}
                              className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600" title="Return">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Result Details" size="lg">
        {selectedResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-[#F5F5F5] rounded-xl p-4 text-sm">
              <div><span className="text-gray-500">Student:</span> <strong>{selectedResult.student_name}</strong></div>
              <div><span className="text-gray-500">Subject:</span> <strong>{selectedResult.subject_name}</strong></div>
              <div><span className="text-gray-500">Class:</span> <strong>{selectedResult.class_name}</strong></div>
              <div><span className="text-gray-500">Total:</span> <strong className={gradeColor(selectedResult.total)}>{selectedResult.total} ({getGrade(selectedResult.total)})</strong></div>
            </div>
            {selectedResult.components?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3">Score Breakdown</h4>
                <div className="space-y-2">
                  {selectedResult.components.map((c,i) => (
                    <div key={i} className="flex justify-between items-center text-sm bg-[#F5F5F5] rounded-lg px-4 py-2">
                      <span>{c.name}</span>
                      <span className="font-bold">{c.score ?? '—'} / {c.max_score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedResult.teacher_comment && (
              <div className="bg-blue-50 rounded-xl p-4 text-sm">
                <p className="font-semibold text-blue-800 mb-1">Teacher's Comment</p>
                <p className="text-blue-700 italic">"{selectedResult.teacher_comment}"</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={actionModal}
        onClose={() => setActionModal(false)}
        title={actionType === 'publish' ? 'Publish Result' : 'Return to Teacher'}
        size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setActionModal(false)}>Cancel</Button><Button variant={actionType === 'publish' ? 'success' : 'warning'} loading={submitting} form="action-form" type="submit">{actionType === 'publish' ? 'Publish' : 'Return'}</Button></div>}
      >
        <form id="action-form" onSubmit={handleAction} className="space-y-4">
          {actionType === 'publish' ? (
            <>
              <Input label="Principal's Comment" value={actionData.admin_comment} onChange={e => setActionData({...actionData, admin_comment: e.target.value})} placeholder="Optional comment..." />
              <Input label="Next Term Begins" type="date" value={actionData.next_term_begins} onChange={e => setActionData({...actionData, next_term_begins: e.target.value})} />
            </>
          ) : (
            <Input label="Feedback to Teacher" required value={actionData.feedback} onChange={e => setActionData({...actionData, feedback: e.target.value})} placeholder="Reason for returning..." />
          )}
        </form>
      </Modal>
    </div>
  )
}
