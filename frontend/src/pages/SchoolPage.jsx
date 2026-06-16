import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Key, Search, Download, AlertCircle, CheckCircle, Printer } from 'lucide-react'
import api from '../api'
import Logo from '../components/common/Logo'
import Button from '../components/forms/Button'
import Input from '../components/forms/Input'
import Alert from '../components/common/Alert'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate, getGrade, gradeColor } from '../utils/helpers'

export default function SchoolPage() {
  const { slug } = useParams()
  const [school, setSchool] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [pin, setPin] = useState('')
  const [admNo, setAdmNo] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await api.get(`/school/public?slug=${slug}`)
        if (res.data.success) setSchool(res.data.school)
        else setPageError(res.data.message || 'School not found.')
      } catch {
        setPageError('Failed to load school page.')
      } finally {
        setPageLoading(false)
      }
    }
    fetchSchool()
  }, [slug])

  const handleCheck = async (e) => {
    e.preventDefault()
    setCheckError('')
    setResult(null)
    setChecking(true)
    try {
      const res = await api.post('/pins?action=validate', { pin_code: pin, admission_number: admNo })
      if (res.data.success) {
        setResult(res.data)
      } else {
        setCheckError(res.data.message || 'Invalid PIN or admission number.')
      }
    } catch (err) {
      setCheckError(err.response?.data?.message || 'Validation failed.')
    } finally {
      setChecking(false)
    }
  }

  const handlePrint = () => window.print()

  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="xl" />
    </div>
  )

  if (pageError) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700">{pageError}</h2>
        <Link to="/" className="text-[#FF6B00] mt-4 inline-block">← Back to home</Link>
      </div>
    </div>
  )

  const isStarter = school?.plan === 'starter' || school?.plan === 'free'

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sora">
      {/* School header */}
      <header className="bg-[#1A1A1A] text-white py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-4">
            {school?.logo ? (
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-logo overflow-hidden">
                <img src={school.logo} alt={school.name} className="w-16 h-16 object-contain" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-logo">
                <span className="text-[#FF6B00] font-bold text-2xl">{school?.name?.[0]}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">{school?.name}</h1>
              {school?.address && <p className="text-gray-400 text-sm mt-1">{school.address}</p>}
            </div>

            {isStarter && (
              <div className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-4 py-2 rounded-xl text-sm font-semibold">
                📋 Free Plan — 10 students maximum
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Announcements */}
        {school?.announcements?.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-[#1A1A1A] mb-3">📢 Announcements</h3>
            <div className="space-y-3">
              {school.announcements.map((a) => (
                <div key={a.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="font-semibold text-blue-900 text-sm">{a.title}</p>
                  <p className="text-blue-700 text-sm mt-1">{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIN Checker */}
        {!result && (
          <div className="bg-white rounded-2xl shadow-card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-[#FF6B00]" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Check Your Result</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your PIN and admission number to view your report card</p>
            </div>

            {checkError && (
              <Alert type="error" message={checkError} onClose={() => setCheckError('')} className="mb-5" />
            )}

            <form onSubmit={handleCheck} className="space-y-4 max-w-sm mx-auto">
              <Input
                label="Admission Number"
                type="text"
                placeholder="e.g. ADM/2024/001"
                value={admNo}
                onChange={(e) => setAdmNo(e.target.value)}
                required
              />
              <Input
                label="PIN Code"
                type="text"
                placeholder="Enter your 12-digit PIN"
                icon={Key}
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                required
              />
              <Button type="submit" loading={checking} fullWidth size="lg">
                <Search className="w-4 h-4" /> Check Result
              </Button>
            </form>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="bg-white rounded-2xl shadow-card p-6 lg:p-8 fade-in" id="report-card">
            {/* Print button */}
            <div className="flex justify-between items-center mb-6 no-print">
              <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                <CheckCircle className="w-5 h-5" /> Result verified successfully
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button size="sm" onClick={() => { setResult(null); setPin(''); setAdmNo('') }}>
                  Check Another
                </Button>
              </div>
            </div>

            {/* School header for print */}
            <div className="text-center mb-6 pb-6 border-b border-[#E5E5E5]">
              {school?.logo && (
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-logo mx-auto mb-3 overflow-hidden">
                  <img src={school.logo} alt={school.name} className="w-12 h-12 object-contain" />
                </div>
              )}
              <h2 className="text-xl font-bold">{school?.name}</h2>
              <p className="text-sm text-gray-500">STUDENT ACADEMIC REPORT CARD</p>
              {result.term && <p className="text-sm text-gray-500">{result.term?.name} — {result.session?.name}</p>}
            </div>

            {/* Student info */}
            {result.student && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-[#F5F5F5] rounded-xl p-4">
                <div><p className="text-xs text-gray-500">Student Name</p><p className="font-semibold text-sm">{result.student.first_name} {result.student.surname}</p></div>
                <div><p className="text-xs text-gray-500">Admission No.</p><p className="font-semibold text-sm">{result.student.admission_number}</p></div>
                <div><p className="text-xs text-gray-500">Class</p><p className="font-semibold text-sm">{result.student.class_name}</p></div>
                <div><p className="text-xs text-gray-500">Term</p><p className="font-semibold text-sm">{result.term?.name}</p></div>
              </div>
            )}

            {/* Subjects */}
            {result.results?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Academic Results</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#1A1A1A] text-white">
                        <th className="px-4 py-2.5 text-left rounded-tl-lg">Subject</th>
                        {result.results[0]?.components?.map((c) => (
                          <th key={c.name} className="px-3 py-2.5 text-center">{c.name}</th>
                        ))}
                        <th className="px-4 py-2.5 text-center">Total</th>
                        <th className="px-4 py-2.5 text-center rounded-tr-lg">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'}>
                          <td className="px-4 py-2.5 font-medium">{r.subject_name}</td>
                          {r.components?.map((c) => (
                            <td key={c.name} className="px-3 py-2.5 text-center">{c.score ?? '—'}</td>
                          ))}
                          <td className={`px-4 py-2.5 text-center font-bold ${gradeColor(r.total)}`}>{r.total}</td>
                          <td className="px-4 py-2.5 text-center font-bold">{getGrade(r.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cognitive assessment */}
            {result.cognitive?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Cognitive/Affective Assessment</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.cognitive.map((c, i) => (
                    <div key={i} className="bg-[#F5F5F5] rounded-lg px-3 py-2.5 flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700">{c.skill_name}</span>
                      <span className="text-xs font-bold text-[#FF6B00]">{c.rating}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance */}
            {result.attendance && (
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="text-center bg-green-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-green-600">{result.attendance.present_days}</p>
                  <p className="text-xs text-gray-500">Days Present</p>
                </div>
                <div className="text-center bg-red-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-red-500">{result.attendance.absent_days}</p>
                  <p className="text-xs text-gray-500">Days Absent</p>
                </div>
                <div className="text-center bg-blue-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-blue-600">{result.attendance.total_days}</p>
                  <p className="text-xs text-gray-500">Total School Days</p>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {result.teacher_comment && (
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Class Teacher's Comment</p>
                  <p className="text-sm text-gray-700 italic">"{result.teacher_comment}"</p>
                </div>
              )}
              {result.admin_comment && (
                <div className="bg-[#F5F5F5] rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Principal's Comment</p>
                  <p className="text-sm text-gray-700 italic">"{result.admin_comment}"</p>
                </div>
              )}
            </div>

            {result.next_term_begins && (
              <div className="text-center text-sm text-gray-600 border-t border-[#E5E5E5] pt-4">
                Next Term Begins: <strong>{formatDate(result.next_term_begins)}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 border-t border-[#E5E5E5] bg-white mt-10">
        Powered by <Link to="/" className="text-[#FF6B00] font-semibold hover:underline">ExclusiveGrades</Link>
      </footer>
    </div>
  )
}
