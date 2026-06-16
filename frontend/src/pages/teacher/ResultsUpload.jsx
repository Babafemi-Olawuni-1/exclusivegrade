import { useState, useEffect } from 'react'
import { Save, Send } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Button from '../../components/forms/Button'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ResultsUpload() {
  const { get, post, loading } = useApi()
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [sessions, setSessions] = useState([])
  const [terms, setTerms] = useState([])
  const [students, setStudents] = useState([])
  const [template, setTemplate] = useState(null)
  const [filters, setFilters] = useState({ class_id:'', subject_id:'', term_id:'' })
  const [scores, setScores] = useState({})   // { studentId: { componentName: score } }
  const [comments, setComments] = useState({}) // { studentId: comment }
  const [teacherComment, setTeacherComment] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitAction, setSubmitAction] = useState('save')

  useEffect(() => {
    Promise.all([get('/classes'), get('/subjects'), get('/sessions')]).then(([c, s, sess]) => {
      setClasses(c.classes || [])
      setSubjects(s.subjects || [])
      setSessions(sess.sessions || [])
      setTerms(sess.sessions?.flatMap(s => s.terms?.map(t => ({ ...t, session_name: s.name })) || []) || [])
    }).catch(() => {})
  }, [])

  // Load students and template when class + subject chosen
  useEffect(() => {
    if (!filters.class_id) return
    Promise.all([
      get('/students', { class_id: filters.class_id, per_page: 200 }),
      get('/result-templates'),
    ]).then(([s, tr]) => {
      setStudents(s.students || [])
      // Find template assigned to this class
      const tpl = tr.templates?.find(t => t.class_id == filters.class_id) || tr.templates?.[0] || null
      setTemplate(tpl)
      // Initialize scores grid
      const initScores = {}
      s.students?.forEach(st => {
        initScores[st.id] = {}
        tpl?.components?.forEach(c => { initScores[st.id][c.name] = '' })
      })
      setScores(initScores)
      setComments({})
    }).catch(() => {})
  }, [filters.class_id])

  const setScore = (studentId, componentName, val) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [componentName]: val }
    }))
  }

  const handleSave = async (action = 'save') => {
    if (!filters.class_id || !filters.subject_id || !filters.term_id) {
      setError('Please select class, subject, and term.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const results = students.map(s => ({
        student_id: s.id,
        subject_id: filters.subject_id,
        components: template?.components?.map(c => ({ name: c.name, score: Number(scores[s.id]?.[c.name] || 0) })) || [],
        comment: comments[s.id] || '',
      }))

      if (action === 'submit') {
        await post('/results?action=submit', { term_id: filters.term_id, teacher_comment: teacherComment, results })
        setSuccess('Results submitted for admin review!')
      } else {
        await post('/results', { term_id: filters.term_id, teacher_comment: teacherComment, results })
        setSuccess('Results saved as draft.')
      }
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const filteredSubjects = filters.class_id
    ? subjects.filter(s => s.class_id == filters.class_id)
    : subjects

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Upload Results</h1>
          <p className="text-sm text-gray-500">Enter student scores for review</p>
        </div>
        {students.length > 0 && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" loading={submitting && submitAction === 'save'} onClick={() => { setSubmitAction('save'); handleSave('save') }}>
              <Save className="w-4 h-4" /> Save Draft
            </Button>
            <Button size="sm" loading={submitting && submitAction === 'submit'} onClick={() => { setSubmitAction('submit'); handleSave('submit') }}>
              <Send className="w-4 h-4" /> Submit for Review
            </Button>
          </div>
        )}
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4 grid grid-cols-3 gap-4">
        <Select label="Class" options={classes.map(c=>({value:c.id,label:c.name}))} value={filters.class_id} onChange={e=>setFilters({...filters,class_id:e.target.value})} placeholder="Select Class" />
        <Select label="Subject" options={filteredSubjects.map(s=>({value:s.id,label:s.name}))} value={filters.subject_id} onChange={e=>setFilters({...filters,subject_id:e.target.value})} placeholder="Select Subject" />
        <Select label="Term" options={terms.map(t=>({value:t.id,label:`${t.name} (${t.session_name})`}))} value={filters.term_id} onChange={e=>setFilters({...filters,term_id:e.target.value})} placeholder="Select Term" />
      </div>

      {/* Scores grid */}
      {!filters.class_id ? (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center text-gray-400">
          <p className="font-medium">Select a class, subject, and term to start entering scores.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center text-gray-400">
          <p className="font-medium">No students in this class.</p>
        </div>
      ) : (
        <>
          {!template && (
            <Alert type="warning" message="No result template assigned to this class. Contact the admin." />
          )}

          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#1A1A1A] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Student</th>
                    {template?.components?.map(c => (
                      <th key={c.name} className="px-3 py-3 text-center text-xs font-semibold uppercase">
                        {c.name} <span className="opacity-60">/{c.max_score}</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {students.map((s, i) => {
                    const studentScores = scores[s.id] || {}
                    const total = template?.components?.reduce((sum, c) => sum + Number(studentScores[c.name] || 0), 0) || 0
                    return (
                      <tr key={s.id} className={i%2===0?'bg-white':'bg-[#F5F5F5]'}>
                        <td className="px-4 py-2 font-medium whitespace-nowrap">
                          {s.first_name} {s.surname}
                          <span className="block text-xs text-gray-400">{s.admission_number}</span>
                        </td>
                        {template?.components?.map(c => (
                          <td key={c.name} className="px-3 py-2">
                            <input
                              type="number" min="0" max={c.max_score} step="0.5"
                              value={studentScores[c.name] || ''}
                              onChange={e => setScore(s.id, c.name, e.target.value)}
                              className="w-16 text-center px-2 py-1.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2 text-center font-bold text-[#FF6B00]">{total}</td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={comments[s.id] || ''}
                            onChange={e => setComments(prev => ({ ...prev, [s.id]: e.target.value }))}
                            placeholder="Optional..."
                            className="w-full px-2 py-1.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#FF6B00]"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teacher comment */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <label className="text-sm font-medium text-[#333333] block mb-2">Class Teacher's General Comment</label>
            <textarea rows={3} value={teacherComment} onChange={e=>setTeacherComment(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00] resize-none"
              placeholder="e.g. A hardworking and dedicated student..." />
          </div>
        </>
      )}
    </div>
  )
}
