import { useState, useEffect } from 'react'
import { Save, School, Bell, Lock } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Settings() {
  const { get, post, put, loading } = useApi()
  const { user, school, updateSchool, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    signature_url: user?.signature_url || '',
  })

  const [pwdForm, setPwdForm] = useState({ current_password:'', new_password:'', confirm_password:'' })

  const [announcementForm, setAnnForm] = useState({ title:'', body:'', is_published: true })
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    if (tab === 'announcements') {
      get('/announcements').then(r => setAnnouncements(r.announcements || [])).catch(() => {})
    }
  }, [tab])

  const handleProfile = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await put('/auth/update-profile', profileForm)
      updateUser(profileForm)
      setSuccess('Profile updated successfully.')
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwdForm.new_password !== pwdForm.confirm_password) { setError('Passwords do not match.'); return }
    if (pwdForm.new_password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setSubmitting(true)
    setError('')
    try {
      await post('/auth/change-password', { current_password: pwdForm.current_password, new_password: pwdForm.new_password })
      setSuccess('Password changed successfully.')
      setPwdForm({ current_password:'', new_password:'', confirm_password:'' })
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleAnnouncement = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await post('/announcements', announcementForm)
      setSuccess('Announcement created.')
      setAnnForm({ title:'', body:'', is_published: true })
      get('/announcements').then(r => setAnnouncements(r.announcements || [])).catch(() => {})
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const deleteAnn = async (id) => {
    try {
      await api.delete(`/announcements?id=${id}`)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      setSuccess('Announcement deleted.')
    } catch (err) { setError(err.message) }
  }

  const pset = k => e => setProfileForm({ ...profileForm, [k]: e.target.value })
  const ppset = k => e => setPwdForm({ ...pwdForm, [k]: e.target.value })

  const tabs = [
    ['profile', 'My Profile', School],
    ['password', 'Change Password', Lock],
    ['announcements', 'Announcements', Bell],
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-[#1A1A1A]">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-xl w-fit">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setError(''); setSuccess('') }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===k?'bg-white text-[#FF6B00] shadow-sm':'text-gray-500 hover:text-gray-800'}`}>
            {l}
          </button>
        ))}
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {tab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-card p-6 max-w-xl">
          <h2 className="font-semibold mb-5">Profile Information</h2>
          <form onSubmit={handleProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={profileForm.first_name} onChange={pset('first_name')} />
              <Input label="Last Name" value={profileForm.last_name} onChange={pset('last_name')} />
            </div>
            <Input label="Email Address" type="email" value={profileForm.email} onChange={pset('email')} />
            <Input label="Signature URL" type="url" value={profileForm.signature_url} onChange={pset('signature_url')} placeholder="https://..." hint="Link to your signature image" />
            {profileForm.signature_url && (
              <div className="p-3 border border-[#E5E5E5] rounded-xl">
                <p className="text-xs text-gray-500 mb-2">Signature preview:</p>
                <img src={profileForm.signature_url} alt="Signature" className="h-16 object-contain" onError={e => e.target.style.display='none'} />
              </div>
            )}
            <div className="pt-2">
              <Button type="submit" loading={submitting}><Save className="w-4 h-4" /> Save Changes</Button>
            </div>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="bg-white rounded-2xl shadow-card p-6 max-w-xl">
          <h2 className="font-semibold mb-5">Change Password</h2>
          <form onSubmit={handlePassword} className="space-y-4">
            <Input label="Current Password" type="password" required value={pwdForm.current_password} onChange={ppset('current_password')} />
            <Input label="New Password" type="password" required value={pwdForm.new_password} onChange={ppset('new_password')} hint="Minimum 6 characters" />
            <Input label="Confirm New Password" type="password" required value={pwdForm.confirm_password} onChange={ppset('confirm_password')} />
            <div className="pt-2">
              <Button type="submit" loading={submitting}><Save className="w-4 h-4" /> Update Password</Button>
            </div>
          </form>
        </div>
      )}

      {tab === 'announcements' && (
        <div className="space-y-5 max-w-2xl">
          {/* Create announcement */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-semibold mb-4">Create Announcement</h2>
            <form onSubmit={handleAnnouncement} className="space-y-4">
              <Input label="Title" required value={announcementForm.title} onChange={e=>setAnnForm({...announcementForm,title:e.target.value})} />
              <div>
                <label className="text-sm font-medium text-[#333333] block mb-1">Body</label>
                <textarea rows={4} required value={announcementForm.body} onChange={e=>setAnnForm({...announcementForm,body:e.target.value})}
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00] resize-none" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={announcementForm.is_published} onChange={e=>setAnnForm({...announcementForm,is_published:e.target.checked})} className="w-4 h-4 accent-[#FF6B00]" />
                Publish immediately
              </label>
              <Button type="submit" loading={submitting}><Bell className="w-4 h-4" /> Post Announcement</Button>
            </form>
          </div>

          {/* Existing announcements */}
          {announcements.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E5E5]">
                <h3 className="font-semibold">Existing Announcements</h3>
              </div>
              <div className="divide-y divide-[#E5E5E5]">
                {announcements.map(a => (
                  <div key={a.id} className="px-5 py-4 flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.body}</p>
                    </div>
                    <button onClick={() => deleteAnn(a.id)} className="ml-4 text-red-400 hover:text-red-600 text-xs shrink-0">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
