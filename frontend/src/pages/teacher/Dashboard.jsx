import { useApi } from '../../hooks/useApi'
import { useAuthContext } from '../../context/AuthContext'
import Card from '../../components/Card'

export default function TeacherDashboard() {
  const { user } = useAuthContext()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.first_name}!</h1>
        <p className="text-gray-600 mt-2">Upload and manage student results</p>
      </div>

      {/* Quick Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <p className="text-gray-600 text-sm mb-2">Results Uploaded</p>
          <p className="text-3xl font-bold text-gray-900">12</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm mb-2">Pending Review</p>
          <p className="text-3xl font-bold text-orange-600">3</p>
        </Card>
        <Card>
          <p className="text-gray-600 text-sm mb-2">Approved Results</p>
          <p className="text-3xl font-bold text-green-600">9</p>
        </Card>
      </div>

      {/* Next Steps */}
      <Card>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Next Steps</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Prepare your results file</p>
              <p className="text-sm text-gray-600">Use CSV or Excel format with student names and scores</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Upload results</p>
              <p className="text-sm text-gray-600">Go to "Upload Results" and submit your file</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Wait for approval</p>
              <p className="text-sm text-gray-600">School admin will review and approve your results</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card className="bg-blue-50 border-l-4 border-blue-500">
        <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-700 text-sm">
          Contact your school administrator for support with uploading results or managing your profile.
        </p>
      </Card>
    </div>
  )
}
