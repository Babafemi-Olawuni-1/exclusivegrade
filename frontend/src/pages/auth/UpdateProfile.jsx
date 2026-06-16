import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Alert from '../../components/Alert'
import Card from '../../components/Card'

export default function UpdateProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()
  const { put } = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await put('/auth/update-profile', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      })

      if (response.success) {
        setSuccess('Profile updated successfully')
      } else {
        setError(response.message || 'Failed to update profile')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await put('/auth/change-password', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      })

      if (response.success) {
        setSuccess('Password changed successfully')
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        setError(response.message || 'Failed to change password')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} dismissible />}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <h2 className="text-xl font-bold mb-6 text-gray-900">Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              disabled
            />
            <Input
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              Update Profile
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card>
          <h2 className="text-xl font-bold mb-6 text-gray-900">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
            />
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              Change Password
            </Button>
          </form>
        </Card>
      </div>

      {/* Logout */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Logout</h3>
            <p className="text-sm text-gray-600">Sign out from your account</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  )
}
