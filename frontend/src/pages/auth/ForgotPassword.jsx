import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email')
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-orange-500">
            ExclusiveGrades
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl card-shadow-lg p-8">
              {!submitted ? (
                <>
                  <h1 className="text-3xl font-bold mb-2 text-gray-900">Reset Password</h1>
                  <p className="text-gray-600 mb-8">Enter your email address and we'll send you a link to reset your password.</p>

                  {error && (
                    <Alert type="error" message={error} onClose={() => setError(null)} dismissible className="mb-6" />
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@school.com"
                      icon={Mail}
                    />

                    <Button type="submit" variant="primary" size="lg" className="w-full">
                      Send Reset Link
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>

                  <p className="text-center text-gray-600 mt-6">
                    Remember your password?{' '}
                    <Link to="/auth/login" className="text-orange-500 hover:text-orange-600 font-semibold">
                      Sign in
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="inline-block bg-green-100 rounded-full p-3 mb-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">Check your email</h1>
                    <p className="text-gray-600 mb-6">
                      We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
                    </p>
                    <Link to="/auth/login">
                      <Button variant="primary" size="lg" className="w-full">
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
