import { useState, useEffect } from 'react'
import { Save, CheckSquare, XSquare, Clock } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Button from '../../components/forms/Button'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Attendance() {
  const { get, post, loading } = useApi()
  const [classes, setClasses] = useState([])
  const [sessions, setSessions] = useState([])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [filters, setFilters] = useState({ class_id:'', term_id:'' })
  const [terms, setTerms] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([get('/classes'), get('/sessions')]).then(([c, s]) => {
      setClasses(c.classes || [])
      setSessions(s.sessions || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const allTerms = sessions.flatMap(s => s.terms?.map(t => ({ ...t, session_name: s.name })) || [])
    setTerms(allTerms)
  }, [sessions])

  useEffect(() => {
    if (!filters.class_id) return
    get('/students', { class_id: filters.class_id, per_page: 200 }).then(r => {
      const studentList = r.students || []
      setStudents(studentList)
      // Load existing attendance
      if (filters.term_id) {
        get('/attendance', { class_id: filters.class_id, term_id: filters.term_id }).then(ar => {
          const rec = {}
          ar.attendance?.forEach(a => { rec[a.student_id] = { status: a.status, days_present: a.days_present, days_absent: a.days_absent, days_late: a.days_late } })
          setAttendance(rec)
        }).catch(() => {})
      } else {
        setAttendance({})
      }
    }).catch(() => {})
  }, [filters.class_id, filters.term_id])

  const setStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), status } }))
  }

  const setDays = (studentId, field, val) => {
    setAttendance(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [field]: Number(val) } }))
  }

  const handleSave = async () => {
    if (!filters.class_id || !filters.term_id) { setError('Select a class and term.'); return }
    setSubmitting(true)
    setError('')
    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: attendance[s.id]?.status || 'present',
        days_present: attendance[s.id]?.days_present || 0,
        days_absent: attendance[s.id]?.days_absent || 0,
        days_late: attendance[s.id]?.days_late || 0,
      }))
      await post('/attendance', { class_id: filters.class_id, term_id: filters.term_id, attendance: records })
      setSuccess('Attendance saved successfully.')
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const markAll = (status) => {
    const updated = {}
    students.forEach(s => { updated[s.id] = { ...(attendance[s.id] || {}), status } })
    setAttendance(updated)
  }

  const statusColors = {
    present: 'bg-green-100 text-green-700 border-green-200',
    absent:  'bg-red-100 text-red-700 border-red-200',
    late:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Attendance</h1>
          <p className="text-sm text-gray-500">Mark and manage attendance records</p>
        </div>
        {students.length > 0 && (
          <Button size="sm" onClick={handleSave} loading={submitting}>
            <Save className="w-4 h-4" /> Save Attendance
          </Button>
        )}
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Class"
          options={classes.map(c => ({ value: c.id, label: c.name }))}
          value={filters.class_id}
          onChange={e => setFilters({...filters, class_id: e.target.value})}
          placeholder="Select Class"
        />
        <Select
          label="Term"
          options={terms.map(t => ({ value: t.id, label: `${t.name} (${t.session_name})` }))}
          value={filters.term_id}
          onChange={e => setFilters({...filters, term_id: e.target.value})}
          placeholder="Select Term"
        />
      </div>

      {/* Quick mark buttons */}
      {students.length > 0 && (
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 self-center">Mark all as:</span>
          <Button size="xs" variant="ghost" onClick={() => markAll('present')} className="text-green-600 border border-green-200">
            <CheckSquare className="w-3 h-3" /> Present
          </Button>
          <Button size="xs" variant="ghost" onClick={() => markAll('absent')} className="text-red-600 border border-red-200">
            <XSquare className="w-3 h-3" /> Absent
          </Button>
          <Button size="xs" variant="ghost" onClick={() => markAll('late')} className="text-yellow-600 border border-yellow-200">
            <Clock className="w-3 h-3" /> Late
          </Button>
        </div>
      )}

      {/* Student list */}
      {!filters.class_id ? (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center text-gray-400">
          <p className="font-medium">Select a class to view students.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-16 text-center text-gray-400">
          <p className="font-medium">No students in this class.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>
                  {['#','Student','Status','Days Present','Days Absent','Days Late'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {students.map((s, i) => {
                  const rec = attendance[s.id] || {}
                  return (
                    <tr key={s.id} className="hover:bg-[#F5F5F5] transition-colors">
                      <td className="px-4 py-2.5 text-gray-400">{i+1}</td>
                      <td className="px-4 py-2.5 font-medium">{s.first_name} {s.surname}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          {['present','absent','late'].map(status => (
                            <button
                              key={status}
                              onClick={() => setStatus(s.id, status)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all capitalize ${rec.status === status ? statusColors[status] : 'bg-white text-gray-400 border-[#E5E5E5] hover:bg-[#F5F5F5]'}`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" min="0" value={rec.days_present || ''} onChange={e => setDays(s.id,'days_present',e.target.value)}
                          className="w-16 px-2 py-1 border border-[#E5E5E5] rounded-lg text-sm text-center focus:outline-none focus:border-[#FF6B00]" />
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" min="0" value={rec.days_absent || ''} onChange={e => setDays(s.id,'days_absent',e.target.value)}
                          className="w-16 px-2 py-1 border border-[#E5E5E5] rounded-lg text-sm text-center focus:outline-none focus:border-[#FF6B00]" />
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" min="0" value={rec.days_late || ''} onChange={e => setDays(s.id,'days_late',e.target.value)}
                          className="w-16 px-2 py-1 border border-[#E5E5E5] rounded-lg text-sm text-center focus:outline-none focus:border-[#FF6B00]" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
