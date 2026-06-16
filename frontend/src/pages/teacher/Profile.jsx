import { useState } from 'react'
import { Save } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Alert from '../../components/common/Alert'

export default function TeacherProfile() {
  const { post, put } = useApi()
  const { user, updateUser } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState('profile')

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    signature_url: user?.signature_url || '',
  })

  const [pwdForm, setPwdForm] = useState({ current_password:'', new_password:'', confirm_password:'' })

  const handleProfile = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await put('/auth/update-profile', form)
      updateUser(form)
      setSuccess('Profile updated.')
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (pwdForm.new_password !== pwdForm.confirm_password) { setError('Passwords do not match.'); return }
    setSubmitting(true)
    setError('')
    try {
      await post('/auth/change-password', { current_password: pwdForm.current_password, new_password: pwdForm.new_password })
      setSuccess('Password changed.')
      setPwdForm({ current_password:'', new_password:'', confirm_password:'' })
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const pset = k => e => setForm({...form, [k]: e.target.value})
  const ppset = k => e => setPwdForm({...pwdForm, [k]: e.target.value})

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-xl font-bold text-[#1A1A1A]">My Profile</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-xl w-fit">
        {[['profile','Profile'],['password','Password']].map(([k,l]) => (
          <button key={k} onClick={() => { setTab(k); setError(''); setSuccess('') }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===k?'bg-white text-[#FF6B00] shadow-sm':'text-gray-500 hover:text-gray-800'}`}>
            {l}
          </button>
        ))}
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {tab === 'profile' ? (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <form onSubmit={handleProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" value={form.first_name} onChange={pset('first_name')} />
              <Input label="Last Name"  value={form.last_name}  onChange={pset('last_name')} />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={pset('email')} />
            <Input label="Signature URL" type="url" value={form.signature_url} onChange={pset('signature_url')} placeholder="https://..." hint="Link to your digital signature image" />
            {form.signature_url && (
              <div className="p-3 border border-[#E5E5E5] rounded-xl">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <img src={form.signature_url} alt="Signature" className="h-16 object-contain" onError={e=>e.target.style.display='none'} />
              </div>
            )}
            <Button type="submit" loading={submitting}><Save className="w-4 h-4" /> Save</Button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <form onSubmit={handlePassword} className="space-y-4">
            <Input label="Current Password" type="password" required value={pwdForm.current_password} onChange={ppset('current_password')} />
            <Input label="New Password" type="password" required value={pwdForm.new_password} onChange={ppset('new_password')} />
            <Input label="Confirm Password" type="password" required value={pwdForm.confirm_password} onChange={ppset('confirm_password')} />
            <Button type="submit" loading={submitting}><Save className="w-4 h-4" /> Update Password</Button>
          </form>
        </div>
      )}
    </div>
  )
}
