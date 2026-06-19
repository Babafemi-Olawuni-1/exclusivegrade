import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, UserX, Eye, UserCheck, Copy, Check, Trash2, Key, Mail, User, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Teachers() {
  const { get, post, put, del } = useApi()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })
  const [editId, setEditId] = useState(null)
  const [viewTeacher, setViewTeacher] = useState(null)
  const [credentials, setCredentials] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await get('/teachers')
      if (res.success) {
        setTeachers(res.data?.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      let url = '/teachers'
      if (search) url += `?search=${encodeURIComponent(search)}`
      const res = await get(url)
      if (res.success) {
        setTeachers(res.data?.items || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const openAddModal = () => {
    setForm({ first_name: '', last_name: '', email: '' })
    setEditId(null)
    setCredentials(null)
    setViewTeacher(null)
    setError('')
    setSuccess('')
    setModal('add')
  }

  const openEditModal = (teacher) => {
    setForm({
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      email: teacher.email || ''
    })
    setEditId(teacher.id)
    setCredentials(null)
    setViewTeacher(null)
    setError('')
    setSuccess('')
    setModal('edit')
  }

  const openViewCredentials = (teacher) => {
    setViewTeacher(teacher)
    setCredentials({
      username: teacher.username || `${teacher.first_name.toLowerCase()}.${teacher.last_name.toLowerCase()}`,
      password: teacher.default_password || '********'
    })
    setModal('view-credentials')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || null
      }

      let res
      if (editId) {
        res = await put(`/teachers?id=${editId}`, payload)
      } else {
        res = await post('/teachers', payload)
      }

      if (res.success) {
        setSuccess(res.message || 'Teacher saved successfully')
        if (!editId && res.data) {
          setCredentials({
            username: res.data.username || '',
            password: res.data.default_password || ''
          })
          setViewTeacher(res.data)
          setModal('view-credentials')
        }
        setTimeout(() => {
          if (!editId && !credentials) {
            setModal(null)
          }
          fetchData()
        }, 500)
      } else {
        setError(res.message || 'Failed to save teacher')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (id) => {
    if (!confirm('Are you sure you want to deactivate this teacher?')) return
    try {
      const res = await del(`/teachers?id=${id}`)
      if (res.success) {
        await fetchData()
        setSuccess('Teacher deactivated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        alert(res.message || 'Failed to deactivate teacher')
      }
    } catch (err) {
      alert('An error occurred')
    }
  }

  const handleActivate = async (id) => {
    if (!confirm('Are you sure you want to activate this teacher?')) return
    try {
      const res = await put(`/teachers?id=${id}`, { is_active: 1 })
      if (res.success) {
        await fetchData()
        setSuccess('Teacher activated successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        alert(res.message || 'Failed to activate teacher')
      }
    } catch (err) {
      alert('An error occurred')
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
            <p className="text-gray-500 text-sm">Manage all teachers in your school</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Teacher
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800 bg-white"
            />
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
              </div>
            ))
          ) : teachers.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
              No teachers found. Click "Add Teacher" to get started.
            </div>
          ) : (
            teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">
                      {teacher.first_name} {teacher.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{teacher.email || 'No email'}</p>
                    <p className="text-xs text-gray-400">Username: {teacher.username || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        teacher.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {teacher.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openViewCredentials(teacher)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                    title="View Credentials"
                  >
                    <Key size={16} />
                  </button>
                  <button
                    onClick={() => openEditModal(teacher)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  {teacher.is_active ? (
                    <button
                      onClick={() => handleDeactivate(teacher.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Deactivate"
                    >
                      <UserX size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(teacher.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      title="Activate"
                    >
                      <UserCheck size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No teachers found. Click "Add Teacher" to get started.
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 text-sm">
                          {teacher.first_name} {teacher.last_name}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{teacher.email || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{teacher.username || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          teacher.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openViewCredentials(teacher)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                            title="View Credentials"
                          >
                            <Key size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(teacher)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          {teacher.is_active ? (
                            <button
                              onClick={() => handleDeactivate(teacher.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Deactivate"
                            >
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(teacher.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Activate"
                            >
                              <UserCheck size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {modal === 'add' ? 'Add Teacher' : 'Edit Teacher'}
                </h2>
                <button onClick={() => { setModal(null); setCredentials(null); }} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                    placeholder="teacher@school.com"
                  />
                </div>

                {modal === 'add' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                    <p>🔑 A username and default password will be generated automatically.</p>
                    <p className="mt-1">Credentials will be shown after creation.</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setModal(null); setCredentials(null); }}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 text-sm disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : (modal === 'add' ? 'Add Teacher' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Credentials Modal */}
      {modal === 'view-credentials' && viewTeacher && credentials && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Teacher Login Credentials</h2>
                <button 
                  onClick={() => { setModal(null); setCredentials(null); }} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-yellow-800 text-sm font-medium flex items-center gap-2">
                    <Key size={16} />
                    Save these credentials now. They won't be shown again.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Teacher Name</label>
                    <p className="text-gray-800 font-medium">{viewTeacher.first_name} {viewTeacher.last_name}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Username</label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-800 font-mono text-sm bg-gray-50 px-3 py-1.5 rounded-lg flex-1">
                        {credentials.username}
                      </p>
                      <button
                        onClick={() => handleCopy(credentials.username)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                      >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Default Password</label>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-800 font-mono text-sm bg-gray-50 px-3 py-1.5 rounded-lg flex-1">
                        {credentials.password}
                      </p>
                      <button
                        onClick={() => handleCopy(credentials.password)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                      >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                  <p>📌 Teachers log in using their <strong>username</strong> and this password.</p>
                  <p className="mt-1">Login URL: <span className="font-mono">/teacher</span></p>
                </div>

                <button
                  onClick={() => { setModal(null); setCredentials(null); }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}