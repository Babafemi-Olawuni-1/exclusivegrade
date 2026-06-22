import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, BookOpen, Users, Check, Copy, ChevronRight, User } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Subjects() {
  const { get, post, put, del } = useApi()
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // 'add', 'edit', 'copy', 'assign-teacher'
  const [form, setForm] = useState({
    name: '',
    class_id: '',
    teacher_id: ''
  })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Bulk add states
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [customSubjectName, setCustomSubjectName] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  
  // Copy subjects states
  const [sourceClassId, setSourceClassId] = useState('')
  const [destClassId, setDestClassId] = useState('')
  const [subjectsToCopy, setSubjectsToCopy] = useState([])
  const [copying, setCopying] = useState(false)
  
  // Assign teacher states
  const [assignClassId, setAssignClassId] = useState('')
  const [assignSubjectId, setAssignSubjectId] = useState('')
  const [assignTeacherId, setAssignTeacherId] = useState('')

  // Default subjects from Nigerian curriculum
  const defaultSubjects = [
    // Core subjects
    { name: 'Mathematics' },
    { name: 'English Language' },
    { name: 'Civic Education' },
    { name: 'Basic Science' },
    { name: 'Basic Technology' },
    { name: 'Social Studies' },
    { name: 'Christian Religious Studies' },
    { name: 'Islamic Studies' },
    { name: 'Yoruba Language' },
    { name: 'Hausa Language' },
    { name: 'Igbo Language' },
    // Junior Secondary
    { name: 'Cultural & Creative Arts' },
    { name: 'Business Studies' },
    { name: 'Home Economics' },
    { name: 'Agricultural Science' },
    { name: 'Computer Studies' },
    // Senior Secondary - Sciences
    { name: 'Physics' },
    { name: 'Chemistry' },
    { name: 'Biology' },
    { name: 'Further Mathematics' },
    // Senior Secondary - Arts
    { name: 'Literature in English' },
    { name: 'Government' },
    { name: 'History' },
    { name: 'Geography' },
    { name: 'Music' },
    // Senior Secondary - Commercial
    { name: 'Economics' },
    { name: 'Commerce' },
    { name: 'Accounting' },
    { name: 'Marketing' },
    { name: 'Computer Science' },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [subjectsRes, classesRes, teachersRes] = await Promise.allSettled([
        get('/subjects'),
        get('/classes'),
        get('/teachers'),
      ])
      setSubjects(subjectsRes.value?.data || [])
      setClasses(classesRes.value?.data || [])
      setTeachers(teachersRes.value?.data?.items || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await get('/subjects')
      let filtered = res?.data || []
      if (search) filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      setSubjects(filtered)
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
    setSelectedSubjects([])
    setSelectedClassId('')
    setCustomSubjectName('')
    setShowCustomInput(false)
    setError('')
    setSuccess('')
    setModal('add')
  }

  const openEditModal = (subject) => {
    setForm({
      name: subject.name || '',
      class_id: subject.class_id || '',
      teacher_id: subject.teacher_id || ''
    })
    setEditId(subject.id)
    setError('')
    setSuccess('')
    setModal('edit')
  }

  const openCopyModal = () => {
    setSourceClassId('')
    setDestClassId('')
    setSubjectsToCopy([])
    setError('')
    setSuccess('')
    setModal('copy')
  }

  const openAssignTeacherModal = () => {
    setAssignClassId('')
    setAssignSubjectId('')
    setAssignTeacherId('')
    setError('')
    setSuccess('')
    setModal('assign-teacher')
  }

  const toggleSubjectSelection = (subjectName) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectName) 
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName]
    )
  }

  const toggleCopySubject = (subjectId) => {
    setSubjectsToCopy(prev => 
      prev.includes(subjectId) 
        ? prev.filter(s => s !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleBulkSave = async () => {
    if (selectedSubjects.length === 0 && !customSubjectName) {
      setError('Please select at least one subject or enter a custom subject name.')
      return
    }
    if (!selectedClassId) {
      setError('Please select a class to assign these subjects to.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let subjectsToAdd = []

      selectedSubjects.forEach(subjectName => {
        subjectsToAdd.push({ name: subjectName, class_id: selectedClassId })
      })

      if (customSubjectName) {
        subjectsToAdd.push({ name: customSubjectName.trim(), class_id: selectedClassId })
      }

      // Filter out subjects that already exist for this class
      const existingNames = subjects
        .filter(s => s.class_id === parseInt(selectedClassId))
        .map(s => s.name)
      
      const newSubjects = subjectsToAdd.filter(s => !existingNames.includes(s.name))

      if (newSubjects.length === 0) {
        setError('All selected subjects already exist for this class.')
        setSaving(false)
        return
      }

      let addedCount = 0
      for (const subj of newSubjects) {
        try {
          await post('/subjects', { name: subj.name, class_id: subj.class_id })
          addedCount++
        } catch (e) {
          console.error('Failed to add subject:', e)
        }
      }

      await fetchData()
      
      if (addedCount > 0) {
        setSuccess(`${addedCount} subject(s) added successfully!`)
        setTimeout(() => {
          setModal(null)
          setSuccess('')
        }, 1500)
      } else {
        setError('Failed to add subjects.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleCopySubjects = async () => {
    if (!sourceClassId || !destClassId) { setError('Select both source and destination classes.'); return }
    setCopying(true); setError(''); setSuccess('')
    try {
      const res = await post('/subjects?action=copy', {
        source_class_id: parseInt(sourceClassId),
        destination_class_id: parseInt(destClassId)
      })
      setSuccess(`${res?.data?.copied || 0} subject(s) copied successfully!`)
      setTimeout(() => { setModal(null); setSuccess(''); fetchData() }, 1500)
    } catch (err) { setError(err.message) }
    finally { setCopying(false) }
  }

  const handleAssignTeacher = async () => {
    if (!assignClassId || !assignSubjectId) { setError('Select both class and subject.'); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      await post('/subjects?action=assign-teacher', {
        class_subject_id: parseInt(assignSubjectId),
        teacher_id: assignTeacherId ? parseInt(assignTeacherId) : null
      })
      setSuccess('Teacher assigned!')
      setTimeout(() => { setModal(null); setSuccess(''); fetchData() }, 1500)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleSingleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try {
      if (editId) await put(`/subjects?id=${editId}`, { name: form.name.trim() })
      else        await post('/subjects', { name: form.name.trim(), class_id: form.class_id || null })
      setSuccess('Subject saved')
      setTimeout(() => { setModal(null); fetchData() }, 500)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return
    try {
      await del(`/subjects?id=${id}`)
      await fetchData()
      setSuccess('Subject deleted')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { alert(err.message) }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId)
    return cls ? cls.name : '-'
  }

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId)
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : '-'
  }

  const getSubjectsForClass = (classId) => {
    return subjects.filter(s => s.class_id === classId)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
            <p className="text-gray-500 text-sm">Manage all subjects in your school</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openCopyModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              <Copy size={16} /> Copy Subjects
            </button>
            <button
              onClick={openAssignTeacherModal}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              <User size={16} /> Assign Teacher
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Add Subjects
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by subject name..."
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
          ) : subjects.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
              No subjects found. Click "Add Subjects" to get started.
            </div>
          ) : (
            subjects.map((subject) => (
              <div key={subject.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">
                      {subject.name}
                    </p>
                    <p className="text-xs text-gray-500">Class: {getClassName(subject.class_id)}</p>
                    {subject.teacher_name && (
                      <p className="text-xs text-gray-500">Teacher: {subject.teacher_name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setAssignClassId(subject.class_id)
                      setAssignSubjectId(subject.id)
                      setAssignTeacherId(subject.teacher_id || '')
                      setModal('assign-teacher')
                    }}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
                    title="Assign Teacher"
                  >
                    <User size={16} />
                  </button>
                  <button
                    onClick={() => openEditModal(subject)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
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
                ) : subjects.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No subjects found. Click "Add Subjects" to get started.
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} className="text-purple-400" />
                          <p className="font-medium text-gray-800">
                            {subject.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getClassName(subject.class_id)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getTeacherName(subject.teacher_id) || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setAssignClassId(subject.class_id)
                              setAssignSubjectId(subject.id)
                              setAssignTeacherId(subject.teacher_id || '')
                              setModal('assign-teacher')
                            }}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
                            title="Assign Teacher"
                          >
                            <User size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(subject)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(subject.id)}
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

      {/* Add Subjects Modal - Bulk Selection */}
      {modal === 'add' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add Subjects</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                  <p>Select subjects from the list or add a custom subject.</p>
                  <p className="mt-1">Subjects already in this class are marked as <span className="text-green-600 font-medium">Added</span>.</p>
                </div>

                {/* Select Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                {/* Default Subjects Grid */}
                {selectedClassId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Subjects to Add
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-2">
                      {defaultSubjects.map((subj) => {
                        const existingNames = subjects
                          .filter(s => s.class_id === parseInt(selectedClassId))
                          .map(s => s.name)
                        const isExisting = existingNames.includes(subj.name)
                        const isSelected = selectedSubjects.includes(subj.name)
                        return (
                          <button
                            key={subj.name}
                            onClick={() => !isExisting && toggleSubjectSelection(subj.name)}
                            disabled={isExisting}
                            className={`p-3 rounded-xl border text-left text-sm transition-all duration-200 ${
                              isExisting
                                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-default'
                                : isSelected
                                ? 'bg-purple-100 border-purple-400 text-purple-700'
                                : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{subj.name}</span>
                              {isExisting ? (
                                <Check size={16} className="text-gray-400" />
                              ) : isSelected ? (
                                <Check size={16} className="text-purple-500" />
                              ) : null}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Subject Input */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
                  >
                    {showCustomInput ? '− Hide Custom Subject' : '+ Add Custom Subject'}
                  </button>

                  {showCustomInput && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={customSubjectName}
                        onChange={(e) => setCustomSubjectName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                        placeholder="e.g. Further Mathematics"
                      />
                    </div>
                  )}
                </div>

                {/* Selected Count */}
                {(selectedSubjects.length > 0 || customSubjectName) && selectedClassId && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-700">
                    <p className="font-medium">
                      {selectedSubjects.length + (customSubjectName ? 1 : 0)} subject(s) will be added to {getClassName(parseInt(selectedClassId))}
                    </p>
                    <p className="text-xs text-purple-500 mt-1">
                      {selectedSubjects.join(', ')}
                      {selectedSubjects.length > 0 && customSubjectName && ', '}
                      {customSubjectName && customSubjectName}
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
                    disabled={saving || !selectedClassId || (selectedSubjects.length === 0 && !customSubjectName)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? 'Adding...' : (
                      <>
                        <Plus size={16} /> Add Subjects
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
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Edit Subject</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSingleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                    required
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

      {/* Copy Subjects Modal */}
      {modal === 'copy' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Copy Subjects</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                  <p>Copy all subjects from one class to another.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={sourceClassId}
                    onChange={(e) => {
                      setSourceClassId(e.target.value)
                      const sourceSubjects = getSubjectsForClass(parseInt(e.target.value))
                      setSubjectsToCopy(sourceSubjects.map(s => s.id))
                    }}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                  >
                    <option value="">-- Select Source Class --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={destClassId}
                    onChange={(e) => setDestClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                  >
                    <option value="">-- Select Destination Class --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                {sourceClassId && destClassId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subjects to Copy ({subjectsToCopy.length} selected)
                    </label>
                    <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-xl p-2">
                      {getSubjectsForClass(parseInt(sourceClassId)).map((subject) => {
                        const isChecked = subjectsToCopy.includes(subject.id)
                        return (
                          <button
                            key={subject.id}
                            onClick={() => toggleCopySubject(subject.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${
                              isChecked ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span>{subject.name}</span>
                            {isChecked && <Check size={16} className="text-purple-500" />}
                          </button>
                        )
                      })}
                    </div>
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
                    onClick={handleCopySubjects}
                    disabled={copying || !sourceClassId || !destClassId || subjectsToCopy.length === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {copying ? 'Copying...' : (
                      <>
                        <Copy size={16} /> Copy Subjects
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {modal === 'assign-teacher' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Assign Teacher to Subject</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                  <p>Assign a teacher to teach this subject.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    value={assignClassId}
                    onChange={(e) => setAssignClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignSubjectId}
                    onChange={(e) => setAssignSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                  >
                    <option value="">-- Select Subject --</option>
                    {getSubjectsForClass(parseInt(assignClassId)).map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher (Optional)
                  </label>
                  <select
                    value={assignTeacherId}
                    onChange={(e) => setAssignTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                  >
                    <option value="">-- Select Teacher --</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </option>
                    ))}
                  </select>
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
                    type="button"
                    onClick={handleAssignTeacher}
                    disabled={saving || !assignSubjectId}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? 'Assigning...' : (
                      <>
                        <User size={16} /> Assign Teacher
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}