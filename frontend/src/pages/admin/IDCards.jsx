import { useState, useEffect } from 'react'
import { BadgeInfo, Download, Eye } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Button from '../../components/forms/Button'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { API_URL } from '../../config'

export default function IDCards() {
  const { get, loading } = useApi()
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('default')
  const [generatedCards, setGeneratedCards] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generating, setGenerating] = useState(null)

  useEffect(() => {
    Promise.all([get('/classes'), get('/id-cards')]).then(([c, ic]) => {
      setClasses(c.classes || [])
      setGeneratedCards(ic.id_cards || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    get('/students', { class_id: selectedClass, per_page: 200 }).then(r => setStudents(r.students || [])).catch(() => {})
  }, [selectedClass])

  const generateCard = async (studentId) => {
    setGenerating(studentId)
    setError('')
    try {
      const url = `${API_URL}/id-cards?action=generate&id=${studentId}&template=${selectedTemplate}`
      window.open(url, '_blank')
      setSuccess('ID Card generated. Opening in new tab...')
    } catch (err) { setError(err.message) }
    finally { setGenerating(null) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">ID Cards</h1>
          <p className="text-sm text-gray-500">Generate student ID cards</p>
        </div>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h3 className="font-semibold mb-4">Card Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Class"
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            placeholder="Select Class"
          />
          <Select
            label="Template"
            options={[{value:'default',label:'Default'},{value:'classic',label:'Classic'},{value:'modern',label:'Modern'}]}
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
            placeholder={null}
          />
        </div>
      </div>

      {/* Students list */}
      {selectedClass && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <h3 className="font-semibold">Students ({students.length})</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><LoadingSpinner /></div>
          ) : students.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">No students in this class.</p>
          ) : (
            <div className="divide-y divide-[#E5E5E5]">
              {students.map(s => (
                <div key={s.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{s.first_name} {s.surname}</p>
                    <p className="text-xs text-gray-500">{s.admission_number}</p>
                  </div>
                  <Button
                    size="xs"
                    loading={generating === s.id}
                    onClick={() => generateCard(s.id)}
                  >
                    <BadgeInfo className="w-3.5 h-3.5" /> Generate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Previously generated */}
      {generatedCards.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E5E5]">
            <h3 className="font-semibold">Generated Cards</h3>
          </div>
          <div className="divide-y divide-[#E5E5E5]">
            {generatedCards.map(card => (
              <div key={card.id} className="px-5 py-3.5 flex items-center justify-between">
                <p className="text-sm font-medium">{card.student_name}</p>
                <a href={card.url} target="_blank" rel="noopener noreferrer">
                  <Button size="xs" variant="ghost"><Download className="w-3.5 h-3.5" /> Download</Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
