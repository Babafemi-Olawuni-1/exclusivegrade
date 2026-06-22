import { useState, useEffect } from 'react'
import { Save, Bell, Lock, User, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/layout/AdminLayout'
import api from '../../api'

export default function Settings() {
  const { get, post, put } = useApi()
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [announcements, setAnnouncements] = useState([])

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    signature_url: user?.signature_url || '',
  })
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [annForm, setAnnForm] = useState({ title: '', body: '', is_published: true })

  useEffect(() => {
    if (tab === 'announcements') {
      get('/announcements').then(r => setAnnouncements(r?.data || [])).catch(() => {})
    }
  }, [tab])

  const handleProfile = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await put('/auth/update-profile', profileForm)
      if (updateUser) updateUser(profileForm)
      setSuccess('Profile updated.')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwdForm.new_password !== pwdForm.confirm) { setError('Passwords do not match.'); return }
    if (pwdForm.new_password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setSaving(true); setError('')
    try {
      await post('/auth/change-password', { current_password: pwdForm.current_password, new_password: pwdForm.new_password })
      setSuccess('Password changed.'); setPwdForm({ current_password:'', new_password:'', confirm:'' })
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleAnnouncement = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await post('/announcements', annForm)
      setSuccess('Announcement posted.')
      setAnnForm({ title:'', body:'', is_published: true })
      get('/announcements').then(r => setAnnouncements(r?.data || [])).catch(() => {})
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const deleteAnn = async (id) => {
    try {
      const res = await api.delete(`/announcements?id=${id}`)
      if (res.data?.success) setAnnouncements(p => p.filter(a => a.id !== id))
    } catch(err) { alert(err.message) }
  }

  const tabs = [['profile','Profile'],['password','Password'],['announcements','Announcements']]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map(([k,l]) => (
            <button key={k} onClick={() => { setTab(k); setError(''); setSuccess('') }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===k?'bg-white text-purple-600 shadow-sm':'text-gray-500 hover:text-gray-800'}`}>
              {l}
            </button>
          ))}
        </div>

        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm max-w-xl">{error}</div>}
        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm max-w-xl">{success}</div>}

        {tab === 'profile' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xl shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-5">Profile Information</h2>
            <form onSubmit={handleProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                  <input type="text" value={profileForm.first_name} onChange={e => setProfileForm({...profileForm, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                  <input type="text" value={profileForm.last_name} onChange={e => setProfileForm({...profileForm, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Signature URL</label>
                <input type="url" value={profileForm.signature_url} onChange={e => setProfileForm({...profileForm, signature_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://..." />
                {profileForm.signature_url && (
                  <div className="mt-2 p-2 border border-gray-200 rounded-xl">
                    <img src={profileForm.signature_url} alt="Signature" className="h-14 object-contain" onError={e=>e.target.style.display='none'} />
                  </div>
                )}
              </div>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                <Save size={16}/> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xl shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-5">Change Password</h2>
            <form onSubmit={handlePassword} className="space-y-4">
              {[['Current Password','current_password'],['New Password','new_password'],['Confirm Password','confirm']].map(([l,k]) => (
                <div key={k}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{l}</label>
                  <input type="password" required value={pwdForm[k]} onChange={e => setPwdForm({...pwdForm, [k]: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}
              <button type="submit" disabled={saving} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                <Lock size={16}/> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {tab === 'announcements' && (
          <div className="space-y-5 max-w-2xl">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Post Announcement</h2>
              <form onSubmit={handleAnnouncement} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Title <span className="text-red-500">*</span></label>
                  <input type="text" required value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Body <span className="text-red-500">*</span></label>
                  <textarea required rows={4} value={annForm.body} onChange={e => setAnnForm({...annForm, body: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={annForm.is_published} onChange={e => setAnnForm({...annForm, is_published: e.target.checked})} className="w-4 h-4 accent-purple-600" />
                  Publish immediately
                </label>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                  <Bell size={16}/> {saving ? 'Posting...' : 'Post Announcement'}
                </button>
              </form>
            </div>
            {announcements.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-200"><h3 className="font-semibold text-gray-800">Existing Announcements</h3></div>
                <div className="divide-y divide-gray-100">
                  {announcements.map(a => (
                    <div key={a.id} className="px-5 py-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{a.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{a.body}</p>
                      </div>
                      <button onClick={() => deleteAnn(a.id)} className="text-red-400 hover:text-red-600 shrink-0 text-xs">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
