import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import Logo from '../components/common/Logo'
import Button from '../components/forms/Button'
import Input from '../components/forms/Input'
import Alert from '../components/common/Alert'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { post, loading } = useApi()

  const [tab, setTab] = useState('admin')     // 'admin' | 'teacher'
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')

  const [adminForm, setAdminForm] = useState({ email: '', password: '' })
  const [teacherForm, setTeacherForm] = useState({ username: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = tab === 'admin'
        ? { login_type: 'email',    email:    adminForm.email,    password: adminForm.password }
        : { login_type: 'username', username: teacherForm.username, password: teacherForm.password }

      // res is the inner data: { token, user, school }
      const res = await post('/auth/login', payload)

      if (res?.token) {
        login({ token: res.token, user: res.user, school: res.school })
        const role = res.user?.role
        if (role === 'super_admin')                             navigate('/super')
        else if (role === 'school_admin' || role === 'admin')  navigate('/admin')
        else                                                    navigate('/teacher')
      } else {
        setError('Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError(err.message || 'Login failed.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sora flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] px-4 h-16 flex items-center">
        <Link to="/"><Logo size="sm" /></Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card-lg p-8">
            {/* Heading */}
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500 mb-6">Sign in to your ExclusiveGrades account</p>

            {/* Tabs */}
            <div className="flex bg-[#F5F5F5] rounded-xl p-1 mb-6">
              {[['admin','School Admin'],['teacher','Teacher']].map(([k,l]) => (
                <button
                  key={k}
                  onClick={() => { setTab(k); setError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === k ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {l}
                </button>
              ))}
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'admin' ? (
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@school.com"
                  icon={Mail}
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              ) : (
                <Input
                  label="Username"
                  type="text"
                  placeholder="teacher_username"
                  icon={User}
                  value={teacherForm.username}
                  onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })}
                  required
                  autoComplete="username"
                />
              )}

              <div className="relative">
                <Input
                  label="Password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={Lock}
                  value={tab === 'admin' ? adminForm.password : teacherForm.password}
                  onChange={(e) =>
                    tab === 'admin'
                      ? setAdminForm({ ...adminForm, password: e.target.value })
                      : setTeacherForm({ ...teacherForm, password: e.target.value })
                  }
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button type="submit" loading={loading} fullWidth size="lg">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#FF6B00] font-semibold hover:underline">Register here</Link>
            </p>
          </div>

          {/* Demo hint */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
            <p className="font-semibold mb-1">Test credentials</p>
            <p>School Admin — Email: <strong>test@academy.com</strong> · Password: <strong>password123</strong></p>
            <p className="mt-1">Super Admin — Email: <strong>admin@exclusivegrade.com</strong> · Password: <strong>password</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}
