import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Mail, Lock, Phone, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks'
import { useAuthContext } from '../context/AuthContext'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import Alert from '../components/Alert'

export default function Register() {
  const navigate = useNavigate()
  const { register, loading, error } = useAuth()
  const { login: contextLogin } = useAuthContext()
  const [formData, setFormData] = useState({
    school_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    state: '',
  })
  const [localError, setLocalError] = useState(null)
  const [showAlert, setShowAlert] = useState(false)

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
    'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
    'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
    'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    // Validation
    if (!formData.school_name || !formData.email || !formData.password) {
      setLocalError('Please fill in all required fields')
      setShowAlert(true)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      setShowAlert(true)
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      setShowAlert(true)
      return
    }

    const result = await register({
      school_name: formData.school_name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
      state: formData.state,
    })

    if (result) {
      contextLogin(result)
      navigate('/admin')
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

        <div className="py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl card-shadow-lg p-8">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Register Your School</h1>
              <p className="text-gray-600 mb-8">Join 500+ schools managing results with ExclusiveGrades</p>

              {showAlert && (
                <Alert
                  type="error"
                  message={localError}
                  onClose={() => setShowAlert(false)}
                  dismissible
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="School Name *"
                    type="text"
                    name="school_name"
                    value={formData.school_name}
                    onChange={handleChange}
                    placeholder="Excellent Academy"
                    icon={Building2}
                  />

                  <Input
                    label="Email Address *"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@school.com"
                    icon={Mail}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Password *"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    icon={Lock}
                  />

                  <Input
                    label="Confirm Password *"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    icon={Lock}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234 (0) 901 234 567"
                    icon={Phone}
                  />

                  <Select
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    options={nigerianStates.map(state => ({ label: state, value: state }))}
                  />
                </div>

                <Input
                  label="Address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="School street address"
                />

                <div className="pt-4">
                  <label className="flex items-center mb-4">
                    <input type="checkbox" className="rounded mr-2" required />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="#" className="text-orange-500 hover:text-orange-600">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-orange-500 hover:text-orange-600">
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    disabled={loading}
                    className="w-full"
                  >
                    Create Your Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>

              <p className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <Link to="/auth/login" className="text-orange-500 hover:text-orange-600 font-semibold">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
