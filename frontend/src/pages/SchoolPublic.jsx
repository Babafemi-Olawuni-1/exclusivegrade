import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Key, Search, Printer, AlertCircle } from 'lucide-react'
import { useApi } from '../hooks/useApi'

export default function SchoolPublic() {
  const { slug } = useParams()
  const { get, post } = useApi()
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pin, setPin] = useState('')
  const [admNo, setAdmNo] = useState('')
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    get(`school/public?slug=${slug}`)
      .then(r => { 
        if (r.success) {
          setSchool(r.data)
        } else {
          setError('School not found')
        }
      })
      .catch(() => setError('Failed to load school page'))
      .finally(() => setLoading(false))
  }, [slug, get])

  const handleCheck = async (e) => {
    e.preventDefault()
    setCheckError('')
    setResult(null)
    setChecking(true)
    try {
      const res = await post('pins?action=validate', { 
        pin_code: pin, 
        admission_number: admNo 
      })
      if (res.success) {
        setResult(res.data)
      } else {
        setCheckError(res.message || 'Invalid PIN or admission number')
      }
    } catch (err) {
      setCheckError(err.message || 'Validation failed')
    } finally {
      setChecking(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-center px-4">
      <div>
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <p className="text-white text-xl font-semibold">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0B1120]">
      {/* School Header */}
      <header className="bg-white/5 border-b border-white/10 py-8">
        <div className="container mx-auto px-4 text-center">
          {school?.logo_url ? (
            <img src={school.logo_url} alt={school.name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 font-bold text-2xl flex items-center justify-center mx-auto mb-3">
              {school?.name?.[0]}
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">{school?.name}</h1>
          {school?.address && <p className="text-gray-400 text-sm mt-1">{school.address}</p>}
          {school?.welcome_text && <p className="text-gray-300 text-sm mt-2 max-w-xl mx-auto">{school.welcome_text}</p>}
          {school?.plan === 'starter' && (
            <div className="inline-block mt-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs px-3 py-1 rounded-full">
              Free Plan — 10 students max
            </div>
          )}
        </div>
      </header>

      {/* Announcements */}
      {school?.announcements?.length > 0 && (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-3">
            {school.announcements.map(a => (
              <div key={a.id} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-300 font-semibold text-sm">📢 {a.title}</p>
                <p className="text-gray-400 text-sm mt-1">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PIN Checker */}
      <div className="container mx-auto px-4 py-10 max-w-md">
        {!result ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Key size={28} className="text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Check Your Result</h2>
              <p className="text-gray-400 text-sm mt-1">Enter your PIN and admission number</p>
            </div>

            {checkError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-sm">{checkError}</div>
            )}

            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Admission Number</label>
                <input
                  type="text" 
                  required 
                  value={admNo} 
                  onChange={e => setAdmNo(e.target.value)}
                  placeholder="e.g. ADM/2024/001"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">PIN Code</label>
                <input
                  type="text" 
                  required 
                  value={pin} 
                  onChange={e => setPin(e.target.value.toUpperCase())}
                  placeholder="Enter your PIN"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono tracking-widest"
                />
              </div>
              <button 
                type="submit" 
                disabled={checking}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {checking ? 'Checking...' : <><Search size={18} /> Check Result</>}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-gray-800" id="report-card">
            {/* Actions */}
            <div className="flex justify-between items-center mb-5 no-print">
              <p className="text-green-600 font-semibold text-sm">✓ Result verified</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-1.5"
                >
                  <Printer size={14} /> Print
                </button>
                <button 
                  onClick={() => { setResult(null); setPin(''); setAdmNo('') }} 
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-sm"
                >
                  Check Another
                </button>
              </div>
            </div>

            {/* School header */}
            <div className="text-center border-b pb-4 mb-5">
              <h2 className="text-lg font-bold">{school?.name}</h2>
              <p className="text-xs text-gray-500">STUDENT ACADEMIC REPORT CARD</p>
              {result.term && <p className="text-xs text-gray-500">{result.term?.name} — {result.session?.name}</p>}
            </div>

            {/* Student info */}
            {result.student && (
              <div className="grid grid-cols-2 gap-3 mb-5 text-sm bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-gray-400">Student</p>
                  <p className="font-semibold">{result.student.first_name} {result.student.surname || result.student.last_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Admission No.</p>
                  <p className="font-semibold">{result.student.admission_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Class</p>
                  <p className="font-semibold">{result.student.class_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Term</p>
                  <p className="font-semibold">{result.term?.name}</p>
                </div>
              </div>
            )}

            {/* Results table */}
            {result.results?.length > 0 && (
              <div className="mb-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-white text-xs">
                    <tr>
                      <th className="px-3 py-2 text-left">Subject</th>
                      <th className="px-3 py-2 text-center">CA1</th>
                      <th className="px-3 py-2 text-center">CA2</th>
                      <th className="px-3 py-2 text-center">Exam</th>
                      <th className="px-3 py-2 text-center">Total</th>
                      <th className="px-3 py-2 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 font-medium">{r.subject_name}</td>
                        <td className="px-3 py-2 text-center">{r.ca1 ?? '—'}</td>
                        <td className="px-3 py-2 text-center">{r.ca2 ?? '—'}</td>
                        <td className="px-3 py-2 text-center">{r.exam ?? '—'}</td>
                        <td className="px-3 py-2 text-center font-bold text-purple-700">{r.total ?? '—'}</td>
                        <td className="px-3 py-2 text-center font-bold">{r.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Comments */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {result.teacher_comment && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Teacher's Comment</p>
                  <p className="italic text-gray-700">"{result.teacher_comment}"</p>
                </div>
              )}
              {result.admin_comment && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Principal's Comment</p>
                  <p className="italic text-gray-700">"{result.admin_comment}"</p>
                </div>
              )}
            </div>

            {result.next_term_begins && (
              <p className="text-center text-xs text-gray-500 mt-4 border-t pt-4">
                Next Term Begins: <strong>{new Date(result.next_term_begins).toLocaleDateString()}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      <footer className="text-center py-6 text-xs text-gray-500 border-t border-white/5">
        Powered by <a href="/" className="text-purple-400 hover:underline">ExclusiveGrades</a>
      </footer>
    </div>
  )
}