import { useState, useEffect } from 'react'
import { Save, Send } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function TeacherResults() {
  const { get, post } = useApi()
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [sessions, setSessions] = useState([])
  const [students, setStudents] = useState([])
  const [template, setTemplate] = useState(null)
  const [filters, setFilters] = useState({ class_id: '', subject_id: '', term_id: '' })
  const [scores, setScores] = useState({})
  const [teacherComment, setTeacherComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const allTerms = sessions.flatMap(s => (s.terms||[]).map(t => ({...t, session_name: s.name})))

  useEffect(() => {
    Promise.allSettled([get('/classes'), get('/subjects'), get('/sessions')]).then(([c,s,sess]) => {
      if (c.value?.success) setClasses(c.value.data || [])
      if (s.value?.success) setSubjects(s.value.data || [])
      if (sess.value?.success) setSessions(sess.value.data || [])
    })
  }, [])

  useEffect(() => {
    if (!filters.class_id) return
    setLoading(true)
    Promise.allSettled([
      get('/students', { class_id: filters.class_id, per_page: 200 }),
      get('/result-templates'),
    ]).then(([s, tr]) => {
      const list = s.value?.success ? (s.value.data?.items || []) : []
      setStudents(list)
      const tpl = tr.value?.success ? (tr.value.data?.find(t => t.class_id == filters.class_id) || tr.value.data?.[0] || null) : null
      setTemplate(tpl)
      const init = {}
      list.forEach(st => { init[st.id] = {}; tpl?.components?.forEach(c => { init[st.id][c.name] = '' }) })
      setScores(init)
    }).catch(()=>{}).finally(()=>setLoading(false))
  }, [filters.class_id])

  const setScore = (studentId, compName, val) => setScores(p => ({...p, [studentId]: {...(p[studentId]||{}), [compName]: val}}))

  const handleSave = async (action = 'save') => {
    if (!filters.class_id || !filters.subject_id || !filters.term_id) { setError('Select class, subject, and term.'); return }
    setSaving(true)
    setError('')
    try {
      const results = students.map(s => ({
        student_id: s.id,
        subject_id: filters.subject_id,
        ca1:  Number(scores[s.id]?.['CA1'] || scores[s.id]?.['ca1'] || 0),
        ca2:  Number(scores[s.id]?.['CA2'] || scores[s.id]?.['ca2'] || 0),
        exam: Number(scores[s.id]?.['Exam'] || scores[s.id]?.['exam'] || 0),
        ...(template?.components ? { components: template.components.map(c => ({ name: c.name, score: Number(scores[s.id]?.[c.name] || 0) })) } : {})
      }))
      let res
      if (action === 'submit') res = await post('/results?action=submit', { term_id: filters.term_id, teacher_comment: teacherComment, results })
      else                     res = await post('/results', { term_id: filters.term_id, teacher_comment: teacherComment, results })
      if (res.success) setSuccess(action === 'submit' ? 'Results submitted for admin review!' : 'Results saved as draft.')
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const filteredSubjects = filters.class_id ? subjects.filter(s => s.class_id == filters.class_id) : subjects

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Upload Results</h1>
            <p className="text-gray-500 text-sm">Enter student scores for review</p>
          </div>
          {students.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => handleSave('save')} disabled={saving} className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 text-sm flex items-center gap-2 disabled:opacity-50"><Save size={16}/> Save Draft</button>
              <button onClick={() => handleSave('submit')} disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm flex items-center gap-2 disabled:opacity-50"><Send size={16}/> Submit</button>
            </div>
          )}
        </div>

        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm grid grid-cols-3 gap-4">
          {[
            ['Class', 'class_id', classes, c => c.name],
            ['Subject', 'subject_id', filteredSubjects, s => s.name],
            ['Term', 'term_id', allTerms, t => `${t.name} (${t.session_name})`],
          ].map(([label, key, opts, getName]) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
              <select value={filters[key]} onChange={e => setFilters({...filters, [key]: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select {label}</option>
                {opts.map(o => <option key={o.id} value={o.id}>{getName(o)}</option>)}
              </select>
            </div>
          ))}
        </div>

        {!filters.class_id ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">Select a class, subject, and term to start entering scores.</div>
        ) : loading ? (
          <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"/>
        ) : students.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">No students in this class.</div>
        ) : (
          <>
            {!template && <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl text-sm">No result template assigned to this class. Contact the admin.</div>}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Student</th>
                      {template?.components?.map(c => <th key={c.name} className="px-3 py-3 text-center">{c.name} <span className="text-gray-400 text-xs">/{c.max_score}</span></th>)}
                      <th className="px-4 py-3 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((s, i) => {
                      const total = template?.components?.reduce((sum, c) => sum + Number(scores[s.id]?.[c.name] || 0), 0) || 0
                      return (
                        <tr key={s.id} className={i%2===0?'bg-white':'bg-gray-50'}>
                          <td className="px-4 py-2 font-medium text-gray-800">
                            {s.first_name} {s.surname || s.last_name}
                            <span className="block text-xs text-gray-400">{s.admission_number}</span>
                          </td>
                          {template?.components?.map(c => (
                            <td key={c.name} className="px-3 py-2">
                              <input type="number" min="0" max={c.max_score} step="0.5"
                                value={scores[s.id]?.[c.name] || ''}
                                onChange={e => setScore(s.id, c.name, e.target.value)}
                                className="w-16 text-center px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 mx-auto block" />
                            </td>
                          ))}
                          <td className="px-4 py-2 text-center font-bold text-purple-700">{total}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Teacher's General Comment</label>
              <textarea rows={3} value={teacherComment} onChange={e => setTeacherComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="e.g. A hardworking class..." />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
