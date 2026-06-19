import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, BookOpen, Users, Check, ChevronDown } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Classes() {
  const { get, post, put, del } = useApi()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // 'add', 'edit', 'bulk-add'
  const [form, setForm] = useState({
    name: '',
    description: ''
  })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedClasses, setSelectedClasses] = useState([])
  const [customClassName, setCustomClassName] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Default classes from the list
  const defaultClasses = [
    { name: 'KG 1', description: 'Kindergarten Year 1' },
    { name: 'KG 2', description: 'Kindergarten Year 2' },
    { name: 'Nur 1', description: 'Nursery Year 1' },
    { name: 'Nur 2', description: 'Nursery Year 2' },
    { name: 'Primary 1', description: 'Primary School Year 1' },
    { name: 'Primary 2', description: 'Primary School Year 2' },
    { name: 'Primary 3', description: 'Primary School Year 3' },
    { name: 'Primary 4', description: 'Primary School Year 4' },
    { name: 'Primary 5', description: 'Primary School Year 5' },
    { name: 'Primary 6', description: 'Primary School Year 6' },
    { name: 'JSS 1', description: 'Junior Secondary School Year 1' },
    { name: 'JSS 2', description: 'Junior Secondary School Year 2' },
    { name: 'JSS 3', description: 'Junior Secondary School Year 3' },
    { name: 'SSS 1 Science', description: 'Senior Secondary School Year 1 - Science' },
    { name: 'SSS 1 Commercial', description: 'Senior Secondary School Year 1 - Commercial' },
    { name: 'SSS 1 Arts', description: 'Senior Secondary School Year 1 - Arts' },
    { name: 'SSS 2 Science', description: 'Senior Secondary School Year 2 - Science' },
    { name: 'SSS 2 Commercial', description: 'Senior Secondary School Year 2 - Commercial' },
    { name: 'SSS 2 Arts', description: 'Senior Secondary School Year 2 - Arts' },
    { name: 'SSS 3 Science', description: 'Senior Secondary School Year 3 - Science' },
    { name: 'SSS 3 Commercial', description: 'Senior Secondary School Year 3 - Commercial' },
    { name: 'SSS 3 Arts', description: 'Senior Secondary School Year 3 - Arts' },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await get('/classes')
      if (res.success) {
        setClasses(res.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await get('/classes')
      if (res.success) {
        let filtered = res.data || []
        if (search) {
          filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
          )
        }
        setClasses(filtered)
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
    setSelectedClasses([])
    setCustomClassName('')
    setCustomDescription('')
    setShowCustomInput(false)
    setError('')
    setSuccess('')
    setModal('add')
  }

  const openEditModal = (cls) => {
    setForm({
      name: cls.name || '',
      description: cls.description || ''
    })
    setEditId(cls.id)
    setError('')
    setSuccess('')
    setModal('edit')
  }

  const handleBulkSave = async () => {
    if (selectedClasses.length === 0 && !customClassName) {
      setError('Please select at least one class or enter a custom class name.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let classesToAdd = []

      selectedClasses.forEach(className => {
        const defaultClass = defaultClasses.find(c => c.name === className)
        if (defaultClass) {
          classesToAdd.push(defaultClass)
        }
      })

      if (customClassName) {
        classesToAdd.push({
          name: customClassName.trim(),
          description: customDescription.trim() || 'Custom class'
        })
      }

      const existingNames = classes.map(c => c.name)
      const newClasses = classesToAdd.filter(c => !existingNames.includes(c.name))

      if (newClasses.length === 0) {
        setError('All selected classes already exist in your school.')
        setSaving(false)
        return
      }

      let addedCount = 0
      let errorCount = 0

      for (const cls of newClasses) {
        try {
          const res = await post('/classes', cls)
          if (res.success) {
            addedCount++
          } else {
            errorCount++
          }
        } catch (e) {
          errorCount++
        }
      }

      await fetchData()
      
      if (addedCount > 0) {
        setSuccess(`${addedCount} class(es) added successfully!`)
        setTimeout(() => {
          setModal(null)
          setSuccess('')
        }, 1500)
      } else {
        setError('Failed to add classes. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleSingleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null
      }

      let res
      if (editId) {
        res = await put(`/classes?id=${editId}`, payload)
      } else {
        res = await post('/classes', payload)
      }

      if (res.success) {
        setSuccess(res.message || 'Class saved successfully')
        setTimeout(() => {
          setModal(null)
          fetchData()
        }, 500)
      } else {
        setError(res.message || 'Failed to save class')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class? This will remove all students assigned to it.')) return
    try {
      const res = await del(`/classes?id=${id}`)
      if (res.success) {
        await fetchData()
        setSuccess('Class deleted successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        alert(res.message || 'Failed to delete class')
      }
    } catch (err) {
      alert('An error occurred')
    }
  }

  const toggleClassSelection = (className) => {
    setSelectedClasses(prev => 
      prev.includes(className) 
        ? prev.filter(c => c !== className)
        : [...prev, className]
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const getStudentCount = (cls) => {
    return cls.student_count || 0
  }

  const existingClassNames = classes.map(c => c.name)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
            <p className="text-gray-500 text-sm">Manage all classes in your school</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Classes
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by class name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          ) : classes.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
              No classes found. Click "Add Classes" to get started.
            </div>
          ) : (
            classes.map((cls) => (
              <div key={cls.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-lg">
                      {cls.name}
                    </p>
                    {cls.description && (
                      <p className="text-sm text-gray-500 mt-1">{cls.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users size={14} /> {getStudentCount(cls)} students
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(cls)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Students</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="4" className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No classes found. Click "Add Classes" to get started.
                    </td>
                  </tr>
                ) : (
                  classes.map((cls) => (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-purple-400" />
                          <p className="font-medium text-gray-800">
                            {cls.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {cls.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users size={14} className="text-gray-400" />
                          {getStudentCount(cls)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(cls)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cls.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
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

      {/* Add Classes Modal - Bulk Selection */}
      {modal === 'add' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add Classes</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                  <p>💡 Select from the default classes below or add a custom class.</p>
                  <p className="mt-1">Classes already in your school are marked as <span className="text-green-600 font-medium">✓ Added</span>.</p>
                </div>

                {/* Default Classes Grid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Classes to Add
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                    {defaultClasses.map((cls) => {
                      const isExisting = existingClassNames.includes(cls.name)
                      const isSelected = selectedClasses.includes(cls.name)
                      return (
                        <button
                          key={cls.name}
                          onClick={() => !isExisting && toggleClassSelection(cls.name)}
                          disabled={isExisting}
                          className={`p-3 rounded-xl border text-left text-sm transition-all duration-200 ${
                            isExisting
                              ? 'bg-green-50 border-green-200 text-green-600 cursor-default'
                              : isSelected
                              ? 'bg-purple-100 border-purple-400 text-purple-700'
                              : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{cls.name}</span>
                            {isExisting ? (
                              <Check size={16} className="text-green-500" />
                            ) : isSelected ? (
                              <Check size={16} className="text-purple-500" />
                            ) : null}
                          </div>
                          <span className="text-xs text-gray-500">{cls.description}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Class Input */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
                  >
                    {showCustomInput ? '− Hide Custom Class' : '+ Add Custom Class'}
                  </button>

                  {showCustomInput && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Class Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customClassName}
                          onChange={(e) => setCustomClassName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                          placeholder="e.g. Nursery 1, Cambridge Class"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                          placeholder="Brief description of this class"
                        />
                      </div>
                      {customClassName && (
                        <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700">
                          Will add: <span className="font-semibold">{customClassName}</span>
                          {customDescription && ` - ${customDescription}`}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Count */}
                {(selectedClasses.length > 0 || customClassName) && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-700">
                    <p className="font-medium">
                      {selectedClasses.length + (customClassName ? 1 : 0)} class(es) will be added
                    </p>
                    <p className="text-xs text-purple-500 mt-1">
                      {selectedClasses.join(', ')}
                      {selectedClasses.length > 0 && customClassName && ', '}
                      {customClassName && customClassName}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkSave}
                    disabled={saving || (selectedClasses.length === 0 && !customClassName)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? 'Adding...' : (
                      <>
                        <Plus size={16} /> Add Classes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Class</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSingleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                    placeholder="e.g. JSS 1, SSS 2, Primary 3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800 resize-none"
                    placeholder="e.g. Junior Secondary School Year 1"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 text-sm disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}