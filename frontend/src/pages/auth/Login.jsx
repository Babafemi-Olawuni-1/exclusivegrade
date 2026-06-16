import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks'
import { useAuthContext } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import Alert from '../components/Alert'

export default function Login() {
  const navigate = useNavigate()
  const { login: contextLogin } = useAuthContext()
  const { login, loading, error } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState(null)
  const [showAlert, setShowAlert] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields')
      return
    }

    const result = await login(formData.email, formData.password)
    if (result) {
      contextLogin(result)
      
      // Redirect based on role
      if (result.user.role === 'admin' || result.user.role === 'super_admin') {
        navigate('/admin')
      } else if (result.user.role === 'teacher') {
        navigate('/teacher')
      } else {
        navigate('/')
      }
    } else if (error) {
      setLocalError(error)
      setShowAlert(true)
    }
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
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 mb-8">Sign in to your school account</p>

              {showAlert && (
                <Alert
                  type="error"
                  message={localError}
                  onClose={() => setShowAlert(false)}
                  dismissible
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@school.com"
                  icon={Mail}
                  error={localError && !formData.email ? 'Email is required' : ''}
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={Lock}
                  error={localError && !formData.password ? 'Password is required' : ''}
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded mr-2" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <Link to="/auth/forgot-password" className="text-orange-500 hover:text-orange-600">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                  className="w-full"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <p className="text-center text-gray-600 mt-6">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-orange-500 hover:text-orange-600 font-semibold">
                  Register here
                </Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-8 bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold mb-2">Demo Credentials:</p>
              <p>Email: admin@demo.com</p>
              <p>Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
