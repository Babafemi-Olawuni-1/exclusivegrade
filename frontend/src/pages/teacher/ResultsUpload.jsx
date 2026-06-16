import { useState } from 'react'
import { Upload, Download, AlertCircle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Alert from '../../components/Alert'
import Modal from '../../components/Modal'

export default function ResultsUpload() {
  const { post, get } = useApi()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploadType, setUploadType] = useState('csv')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [gridData, setGridData] = useState([])
  const [showGridModal, setShowGridModal] = useState(false)

  const downloadTemplate = () => {
    const template = `Student Name,Admission No,Mathematics,English,Physics,Chemistry,Biology,Average Score,Grade
John Doe,ADM-001,85,92,88,90,87,88.4,A
Jane Smith,ADM-002,75,80,78,82,79,78.8,B`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'results-template.csv'
    a.click()
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setError(null)
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', uploadType)

    try {
      // In a real app, this would upload to the server
      setSuccess('Results uploaded successfully and submitted for review')
      setFile(null)
      document.getElementById('fileInput').value = ''
    } catch (err) {
      setError(err.message || 'Failed to upload results')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Results</h1>
        <p className="text-gray-600 mt-2">Submit student results for admin review</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} dismissible />}

      {/* Upload Type Selection */}
      <Card>
        <h2 className="text-lg font-bold mb-4 text-gray-900">Upload Method</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-orange-500"
                 style={{ borderColor: uploadType === 'csv' ? '#ff8c42' : '#e5e7eb' }}>
            <input
              type="radio"
              value="csv"
              checked={uploadType === 'csv'}
              onChange={(e) => setUploadType(e.target.value)}
              className="mr-3"
            />
            <div>
              <p className="font-medium text-gray-900">CSV Upload</p>
              <p className="text-sm text-gray-600">Upload a CSV file with results</p>
            </div>
          </label>

          <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-orange-500"
                 style={{ borderColor: uploadType === 'grid' ? '#ff8c42' : '#e5e7eb' }}>
            <input
              type="radio"
              value="grid"
              checked={uploadType === 'grid'}
              onChange={(e) => setUploadType(e.target.value)}
              className="mr-3"
            />
            <div>
              <p className="font-medium text-gray-900">Grid Entry</p>
              <p className="text-sm text-gray-600">Enter results in a spreadsheet format</p>
            </div>
          </label>
        </div>
      </Card>

      {uploadType === 'csv' && (
        <>
          {/* CSV Upload */}
          <Card>
            <h2 className="text-lg font-bold mb-4 text-gray-900">Upload CSV File</h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Drag and drop your CSV file here, or click to select</p>
                <input
                  id="fileInput"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="fileInput" className="text-orange-600 hover:text-orange-700 cursor-pointer font-medium">
                  Select file
                </label>
              </div>

              {file && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✓ {file.name} selected</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading || !file}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload & Submit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={downloadTemplate}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </form>

            {/* Instructions */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-gray-900 mb-3">File Format Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ CSV or Excel format (.csv, .xlsx)</li>
                <li>✓ First row must contain headers</li>
                <li>✓ Required columns: Student Name, Admission No, Subject Scores</li>
                <li>✓ Maximum file size: 5MB</li>
              </ul>
            </div>
          </Card>
        </>
      )}

      {uploadType === 'grid' && (
        <>
          {/* Grid Entry */}
          <Card>
            <h2 className="text-lg font-bold mb-4 text-gray-900">Excel-like Grid Entry</h2>
            <p className="text-gray-600 mb-4">Enter results directly in the grid below</p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left text-sm font-medium">Student</th>
                    <th className="border p-2 text-center text-sm font-medium">Mathematics</th>
                    <th className="border p-2 text-center text-sm font-medium">English</th>
                    <th className="border p-2 text-center text-sm font-medium">Physics</th>
                    <th className="border p-2 text-center text-sm font-medium">Chemistry</th>
                    <th className="border p-2 text-center text-sm font-medium">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((row) => (
                    <tr key={row}>
                      <td className="border p-2">
                        <input type="text" placeholder="Name" className="w-full px-2 py-1 border rounded" />
                      </td>
                      <td className="border p-2">
                        <input type="number" placeholder="0" className="w-full px-2 py-1 border rounded text-center" max="100" />
                      </td>
                      <td className="border p-2">
                        <input type="number" placeholder="0" className="w-full px-2 py-1 border rounded text-center" max="100" />
                      </td>
                      <td className="border p-2">
                        <input type="number" placeholder="0" className="w-full px-2 py-1 border rounded text-center" max="100" />
                      </td>
                      <td className="border p-2">
                        <input type="number" placeholder="0" className="w-full px-2 py-1 border rounded text-center" max="100" />
                      </td>
                      <td className="border p-2 bg-gray-50 text-center font-medium">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="primary" className="flex-1">
                Save as Draft
              </Button>
              <Button variant="secondary" className="flex-1">
                Submit for Review
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Recent Uploads */}
      <Card>
        <h2 className="text-lg font-bold mb-4 text-gray-900">Recent Uploads</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Mathematics Results - SS1</p>
              <p className="text-sm text-gray-600">45 students • Approved</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Approved</span>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-gray-900">English Results - SS1</p>
              <p className="text-sm text-gray-600">45 students • Pending Review</p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Pending</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
