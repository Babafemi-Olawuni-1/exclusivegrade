import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { School, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import Logo from '../components/common/Logo'
import Button from '../components/forms/Button'
import Input from '../components/forms/Input'
import Alert from '../components/common/Alert'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { post, loading } = useApi()

  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', admin_first_name: '', admin_last_name: '',
  })

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }

    try {
      const res = await post('/auth/register', form)
      if (res.token) {
        login({ token: res.token, user: res.user, school: res.school })
        navigate('/admin')
      } else {
        setError(res.message || 'Registration failed.')
      }
    } catch (err) {
      setError(err.message || 'Registration failed.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sora flex flex-col">
      <header className="bg-white border-b border-[#E5E5E5] px-4 h-16 flex items-center">
        <Link to="/"><Logo size="sm" /></Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card-lg p-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">Register Your School</h1>
            <p className="text-sm text-gray-500 mb-6">Get started free — no credit card required</p>

            {/* Free plan perks */}
            <div className="bg-[#F5F5F5] rounded-xl p-4 mb-6">
              <p className="text-xs font-semibold text-gray-600 mb-2">Free plan includes:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {['10 students','2 teachers','Result management','PIN access'].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Check className="w-3.5 h-3.5 text-[#FF6B00]" /> {f}
                  </div>
                ))}
              </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="School Name" type="text" placeholder="Excellent Academy" icon={School}
                value={form.name} onChange={set('name')} required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name" type="text" placeholder="John" icon={User}
                  value={form.admin_first_name} onChange={set('admin_first_name')} required
                />
                <Input
                  label="Last Name" type="text" placeholder="Doe"
                  value={form.admin_last_name} onChange={set('admin_last_name')} required
                />
              </div>
              <Input
                label="Email Address" type="email" placeholder="admin@school.com" icon={Mail}
                value={form.email} onChange={set('email')} required autoComplete="email"
              />
              <div className="relative">
                <Input
                  label="Password" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" icon={Lock}
                  value={form.password} onChange={set('password')} required autoComplete="new-password"
                />
                <button
                  type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-xs text-gray-500">
                By registering, you agree to our{' '}
                <a href="#" className="text-[#FF6B00] hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-[#FF6B00] hover:underline">Privacy Policy</a>.
              </p>

              <Button type="submit" loading={loading} fullWidth size="lg">
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[#FF6B00] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
