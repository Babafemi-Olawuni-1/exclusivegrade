import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, Download } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import Input from '../components/Input'
import Button from '../components/Button'
import Card from '../components/Card'
import Alert from '../components/Alert'

export default function SchoolLanding() {
  const { schoolId } = useParams()
  const { get, post } = useApi()
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [reportCard, setReportCard] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showPin, setShowPin] = useState(false)
  const [formData, setFormData] = useState({ admission_number: '', pin: '' })

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const response = await get(`/school/public/${schoolId}`)
        if (response.success) {
          setSchool(response.data)
        } else {
          setError('School not found')
        }
      } catch (err) {
        setError('Failed to load school')
      } finally {
        setLoading(false)
      }
    }

    fetchSchool()
  }, [schoolId, get])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCheckResults = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setChecking(true)

    try {
      const response = await post(`/results/check-by-pin`, {
        school_id: schoolId,
        admission_number: formData.admission_number,
        pin: formData.pin,
      })

      if (response.success) {
        setReportCard(response.data)
        setShowForm(false)
        setSuccess('Results retrieved successfully')
      } else {
        setError(response.message || 'Invalid admission number or PIN')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setChecking(false)
    }
  }

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write(generateReportCardHTML())
    printWindow.document.close()
    printWindow.print()
  }

  const generateReportCardHTML = () => {
    if (!reportCard || !reportCard.student) return ''

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Report Card - ${reportCard.student.first_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .school-name { font-size: 24px; font-weight: bold; }
          .student-info { margin: 20px 0; }
          .section { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f0f0f0; }
          .verified { color: green; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">${school?.name}</div>
          <div style="margin-top: 10px;">
            <img src="${school?.logo_url}" style="max-height: 100px;" alt="School Logo">
          </div>
        </div>
        
        <div class="student-info">
          <h3>Student Information</h3>
          <p><strong>Name:</strong> ${reportCard.student.first_name} ${reportCard.student.last_name}</p>
          <p><strong>Admission Number:</strong> ${reportCard.student.admission_number}</p>
          <p><strong>Class:</strong> ${reportCard.student.class}</p>
        </div>

        <div class="section">
          <h3>Academic Results</h3>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Score</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${reportCard.subjects?.map(s => `
                <tr>
                  <td>${s.name}</td>
                  <td>${s.score}</td>
                  <td>${s.grade}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <p><strong>Average Score:</strong> ${reportCard.average_score}%</p>
          <p class="verified">✓ PIN Verified</p>
        </div>

        <div class="footer">
          <p>This is an official report card from ${school?.name}</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block spinner h-12 w-12 text-orange-500 mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {school?.logo_url && (
              <img src={school.logo_url} alt={school.name} className="h-12 w-12 rounded-lg" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{school?.name}</h1>
              <p className="text-sm text-gray-600">{school?.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible className="mb-6" />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} dismissible className="mb-6" />}

        {showForm ? (
          <Card>
            <div className="text-center mb-8">
              <Lock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Results</h2>
              <p className="text-gray-600">
                Enter your admission number and PIN to view your report card
              </p>
              <p className="text-sm text-gray-500 mt-4 bg-blue-50 rounded-lg p-3">
                📌 This school is on the Free Plan: Maximum 10 students
              </p>
            </div>

            <form onSubmit={handleCheckResults} className="space-y-6 max-w-md mx-auto">
              <Input
                label="Admission Number"
                type="text"
                name="admission_number"
                value={formData.admission_number}
                onChange={handleChange}
                placeholder="e.g., ADM-2024-001"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">PIN Code</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    placeholder="Enter your PIN"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                  >
                    {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={checking}
                disabled={checking}
                className="w-full"
              >
                View Results
              </Button>
            </form>
          </Card>
        ) : reportCard && reportCard.student ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Report Card</h2>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowForm(true)
                    setReportCard(null)
                    setFormData({ admission_number: '', pin: '' })
                  }}
                >
                  New Search
                </Button>
              </div>
            </div>

            {/* Student Information */}
            <Card>
              <h3 className="text-lg font-bold mb-4 text-gray-900">Student Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-900">
                    {reportCard.student.first_name} {reportCard.student.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admission Number</p>
                  <p className="font-semibold text-gray-900">{reportCard.student.admission_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-semibold text-gray-900">{reportCard.student.class}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sex</p>
                  <p className="font-semibold text-gray-900">{reportCard.student.sex}</p>
                </div>
              </div>
            </Card>

            {/* Academic Results */}
            <Card>
              <h3 className="text-lg font-bold mb-4 text-gray-900">Academic Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Subject</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Score</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportCard.subjects?.map((subject, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{subject.name}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{subject.score}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                            {subject.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-orange-500">{reportCard.average_score}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600 font-semibold">✓ PIN Verified</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Comments */}
            {(reportCard.teacher_comment || reportCard.admin_comment) && (
              <Card>
                <h3 className="text-lg font-bold mb-4 text-gray-900">Comments</h3>
                {reportCard.teacher_comment && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600">Teacher's Comment</p>
                    <p className="text-gray-900">{reportCard.teacher_comment}</p>
                  </div>
                )}
                {reportCard.admin_comment && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Principal's Comment</p>
                    <p className="text-gray-900">{reportCard.admin_comment}</p>
                  </div>
                )}
              </Card>
            )}

            {/* Attendance */}
            {reportCard.attendance && (
              <Card>
                <h3 className="text-lg font-bold mb-4 text-gray-900">Attendance</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Days Present</p>
                    <p className="text-2xl font-bold text-gray-900">{reportCard.attendance.present}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Days Absent</p>
                    <p className="text-2xl font-bold text-gray-900">{reportCard.attendance.absent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Attendance %</p>
                    <p className="text-2xl font-bold text-green-600">{reportCard.attendance.percentage}%</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
