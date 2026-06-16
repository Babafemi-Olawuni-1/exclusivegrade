import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle, Search } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Card from '../../components/Card'
import Alert from '../../components/Alert'
import Pagination from '../../components/Pagination'

export default function ResultsManagement() {
  const { get, post, put } = useApi()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [reviewData, setReviewData] = useState({
    admin_comment: '',
    next_term_begins: '',
  })

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const response = await get('/results/pending')
      if (response.success) {
        setResults(response.data)
      } else {
        setError(response.message || 'Failed to load results')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (result) => {
    setSelectedResult(result)
    setReviewData({
      admin_comment: result.admin_comment || '',
      next_term_begins: result.next_term_begins || '',
    })
    setShowReviewModal(true)
  }

  const handleApprove = async () => {
    try {
      const response = await put(`/results/${selectedResult.id}/approve`, reviewData)
      if (response.success) {
        setSuccess('Result approved and published successfully')
        setShowReviewModal(false)
        fetchResults()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReject = async () => {
    try {
      const response = await put(`/results/${selectedResult.id}/reject`, {
        admin_comment: reviewData.admin_comment,
      })
      if (response.success) {
        setSuccess('Result returned to teacher')
        setShowReviewModal(false)
        fetchResults()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredResults = results.filter(result =>
    result.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.teacher?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Results Management</h1>
        <p className="text-gray-600 mt-2">Review and approve pending results from teachers</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} dismissible />}

      {/* Search */}
      <Card>
        <Input
          placeholder="Search by student or teacher name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          icon={Search}
        />
      </Card>

      {/* Results Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading...</div>
        ) : paginatedResults.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Teacher</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Class</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subjects</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((result, idx) => (
                    <tr key={idx} className="table-row border-b">
                      <td className="px-6 py-4 text-gray-900">
                        <div>
                          <p className="font-medium">{result.student?.first_name} {result.student?.last_name}</p>
                          <p className="text-sm text-gray-600">{result.student?.admission_number}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {result.teacher?.first_name} {result.teacher?.last_name}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{result.student?.class}</td>
                      <td className="px-6 py-4 text-gray-900">{result.subjects?.length || 0}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {new Date(result.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReviewClick(result)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-6 border-t flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-gray-600">No pending results</div>
        )}
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Result"
        size="2xl"
      >
        {selectedResult && (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold mb-3 text-gray-900">Student Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedResult.student?.first_name} {selectedResult.student?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admission Number</p>
                  <p className="font-medium text-gray-900">{selectedResult.student?.admission_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-medium text-gray-900">{selectedResult.student?.class}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teacher</p>
                  <p className="font-medium text-gray-900">
                    {selectedResult.teacher?.first_name} {selectedResult.teacher?.last_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Subject</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Score</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedResult.subjects?.map((subject, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2 text-gray-900">{subject.name}</td>
                      <td className="px-4 py-2 text-right text-gray-900">{subject.score}</td>
                      <td className="px-4 py-2 text-right text-gray-900">{subject.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Principal's Comment
              </label>
              <textarea
                value={reviewData.admin_comment}
                onChange={(e) =>
                  setReviewData({ ...reviewData, admin_comment: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
                placeholder="Add your comment (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Term Begins
              </label>
              <input
                type="date"
                value={reviewData.next_term_begins}
                onChange={(e) =>
                  setReviewData({ ...reviewData, next_term_begins: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="success"
                onClick={handleApprove}
                className="flex items-center gap-2 flex-1"
              >
                <CheckCircle className="h-4 w-4" />
                Approve & Publish
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                className="flex items-center gap-2 flex-1"
              >
                <XCircle className="h-4 w-4" />
                Return to Teacher
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
