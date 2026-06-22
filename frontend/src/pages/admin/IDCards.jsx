import { useState, useEffect } from 'react'
import { CreditCard, Download } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'
import { API_URL } from '../../config'

export default function IDCards() {
  const { get } = useApi()
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [template, setTemplate] = useState('default')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(null)

  useEffect(() => {
    get('/classes').then(r => { if (r.success) setClasses(r.data || []) }).catch(()=>{})
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    setLoading(true)
    get('/students', { class_id: selectedClass, per_page: 200 })
      .then(r => { if (r.success) setStudents(r.data?.items || []) })
      .catch(()=>{})
      .finally(()=>setLoading(false))
  }, [selectedClass])

  const generateCard = (studentId) => {
    setGenerating(studentId)
    const url = `${API_URL}/id-cards?action=generate&id=${studentId}&template=${template}`
    window.open(url, '_blank')
    setTimeout(() => setGenerating(null), 1500)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ID Cards</h1>
          <p className="text-gray-500 text-sm">Generate student identity cards</p>
        </div>

        {/* Settings */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Card Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select Class</option>
                {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Template</label>
              <select value={template} onChange={e => setTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="default">Default</option>
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
              </select>
            </div>
          </div>
        </div>

        {selectedClass && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Students ({students.length})</h3>
            </div>
            {loading ? (
              <div className="p-8"><div className="h-20 bg-gray-100 rounded animate-pulse"/></div>
            ) : students.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No students in this class.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {students.map(s => (
                  <div key={s.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {s.photo_url ? (
                        <img src={s.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-sm">
                          {(s.surname || s.first_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm text-gray-800">{s.first_name} {s.surname || s.last_name}</p>
                        <p className="text-xs text-gray-400">{s.admission_number}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => generateCard(s.id)}
                      disabled={generating === s.id}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CreditCard size={14}/> {generating === s.id ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
