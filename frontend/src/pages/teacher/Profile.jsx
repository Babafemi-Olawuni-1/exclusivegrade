import { useState } from 'react'
import { Save } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/layout/AdminLayout'

export default function TeacherProfile() {
  const { post, put } = useApi()
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    signature_url: user?.signature_url || '',
  })
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm: '' })

  const handleProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await put('/auth/update-profile', form)
      if (res.success) { if (updateUser) updateUser(form); setSuccess('Profile updated.') }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwdForm.new_password !== pwdForm.confirm) { setError('Passwords do not match.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await post('/auth/change-password', { current_password: pwdForm.current_password, new_password: pwdForm.new_password })
      if (res.success) { setSuccess('Password changed.'); setPwdForm({ current_password:'', new_password:'', confirm:'' }) }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-xl">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[['profile','Profile'],['password','Password']].map(([k,l]) => (
            <button key={k} onClick={() => { setTab(k); setError(''); setSuccess('') }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===k?'bg-white text-purple-600 shadow-sm':'text-gray-500 hover:text-gray-800'}`}>{l}</button>
          ))}
        </div>

        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}

        {tab === 'profile' ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['First Name','first_name'],['Last Name','last_name']].map(([l,k]) => (
                  <div key={k}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{l}</label>
                    <input type="text" value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Signature URL</label>
                <input type="url" value={form.signature_url} onChange={e => setForm({...form, signature_url: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                {form.signature_url && (
                  <div className="mt-2 p-2 border border-gray-200 rounded-xl">
                    <img src={form.signature_url} alt="Signature" className="h-14 object-contain" onError={e=>e.target.style.display='none'} />
                  </div>
                )}
              </div>
              <button type="submit" disabled={saving} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                <Save size={16}/> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handlePassword} className="space-y-4">
              {[['Current Password','current_password'],['New Password','new_password'],['Confirm Password','confirm']].map(([l,k]) => (
                <div key={k}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{l}</label>
                  <input type="password" required value={pwdForm[k]} onChange={e => setPwdForm({...pwdForm, [k]: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}
              <button type="submit" disabled={saving} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                <Save size={16}/> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
