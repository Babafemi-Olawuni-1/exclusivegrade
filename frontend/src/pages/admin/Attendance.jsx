import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Attendance() {
  const { get, post } = useApi()
  const [classes, setClasses] = useState([])
  const [sessions, setSessions] = useState([])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [filters, setFilters] = useState({ class_id: '', term_id: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const allTerms = sessions.flatMap(s => (s.terms||[]).map(t => ({...t, session_name: s.name})))

  useEffect(() => {
    Promise.allSettled([get('/classes'), get('/sessions')]).then(([c,s]) => {
      if (c.value?.success) setClasses(c.value.data || [])
      if (s.value?.success) setSessions(s.value.data || [])
    })
  }, [])

  useEffect(() => {
    if (!filters.class_id) return
    setLoading(true)
    get('/students', { class_id: filters.class_id, per_page: 200 }).then(r => {
      const list = r.success ? (r.data?.items || []) : []
      setStudents(list)
      if (filters.term_id) {
        get('/attendance', { class_id: filters.class_id, term_id: filters.term_id }).then(ar => {
          const rec = {}
          if (ar.success) ar.data?.forEach(a => { rec[a.student_id] = { days_present: a.days_present, days_absent: a.days_absent, days_late: a.days_late } })
          setAttendance(rec)
        }).catch(()=>{}).finally(()=>setLoading(false))
      } else { setAttendance({}); setLoading(false) }
    }).catch(()=>setLoading(false))
  }, [filters.class_id, filters.term_id])

  const setDays = (studentId, field, val) => setAttendance(p => ({ ...p, [studentId]: { ...(p[studentId]||{}), [field]: Number(val)||0 } }))

  const handleSave = async () => {
    if (!filters.class_id || !filters.term_id) { setError('Select a class and term.'); return }
    setSaving(true)
    setError('')
    try {
      const records = students.map(s => ({
        student_id: s.id,
        days_present: attendance[s.id]?.days_present || 0,
        days_absent:  attendance[s.id]?.days_absent  || 0,
        days_late:    attendance[s.id]?.days_late    || 0,
      }))
      const res = await post('/attendance', { class_id: filters.class_id, term_id: filters.term_id, attendance: records })
      if (res.success) setSuccess('Attendance saved.')
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
            <p className="text-gray-500 text-sm">Record student attendance per term</p>
          </div>
          {students.length > 0 && (
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm flex items-center gap-2 disabled:opacity-50">
              <Save size={16}/> {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          )}
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Class <span className="text-red-500">*</span></label>
            <select value={filters.class_id} onChange={e => setFilters({...filters, class_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Select Class</option>
              {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Term <span className="text-red-500">*</span></label>
            <select value={filters.term_id} onChange={e => setFilters({...filters, term_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Select Term</option>
              {allTerms.map(t=><option key={t.id} value={t.id}>{t.name} ({t.session_name})</option>)}
            </select>
          </div>
        </div>

        {!filters.class_id ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">Select a class to view students.</div>
        ) : loading ? (
          <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"/>
        ) : students.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">No students in this class.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Days Present</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Days Absent</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Days Late</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s, i) => {
                    const rec = attendance[s.id] || {}
                    return (
                      <tr key={s.id} className={i%2===0?'bg-white':'bg-gray-50'}>
                        <td className="px-4 py-2.5 text-gray-400">{i+1}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{s.first_name} {s.surname || s.last_name}</td>
                        {['days_present','days_absent','days_late'].map(field => (
                          <td key={field} className="px-4 py-2.5">
                            <input type="number" min="0" value={rec[field] || ''}
                              onChange={e => setDays(s.id, field, e.target.value)}
                              className="w-16 text-center px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 mx-auto block" />
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
