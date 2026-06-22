import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Edit2, UserX, Upload, Download, X, Check, Camera, Eye, UserCheck, FileDown } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Students() {
  const { get, post, put, del } = useApi()
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({
    first_name: '',
    surname: '',
    last_name: '',
    admission_number: '',
    class_id: '',
    sex: '',
    date_of_birth: '',
    photo_url: ''
  })
  const [editId, setEditId] = useState(null)
  const [viewStudent, setViewStudent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [csvFile, setCsvFile] = useState(null)
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvResult, setCsvResult] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileInputRef = useRef(null)
  const photoInputRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const studentsRes = await get('/students')
      setStudents(studentsRes?.data?.items || [])
      const classesRes = await get('/classes')
      setClasses(classesRes?.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (classFilter) params.class_id = classFilter
      const res = await get('/students', params)
      setStudents(res?.data?.items || [])
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
  }, [search, classFilter])

  const openAddModal = () => {
    setForm({
      first_name: '',
      surname: '',
      last_name: '',
      admission_number: '',
      class_id: '',
      sex: '',
      date_of_birth: '',
      photo_url: ''
    })
    setPhotoFile(null)
    setPhotoPreview(null)
    setEditId(null)
    setViewStudent(null)
    setError('')
    setSuccess('')
    setModal('add')
  }

  const openEditModal = (student) => {
    setForm({
      first_name: student.first_name || '',
      surname: student.surname || '',
      last_name: student.last_name || '',
      admission_number: student.admission_number || '',
      class_id: student.class_id || '',
      sex: student.sex || '',
      date_of_birth: student.date_of_birth || '',
      photo_url: student.photo_url || ''
    })
    setPhotoPreview(student.photo_url || null)
    setPhotoFile(null)
    setEditId(student.id)
    setViewStudent(null)
    setError('')
    setSuccess('')
    setModal('edit')
  }

  const openViewModal = (student) => {
    setViewStudent(student)
    setModal('view')
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const uploadPhoto = async (file) => {
    setUploadingPhoto(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'gallery')

    try {
      const token = localStorage.getItem('gg_token')
      const response = await fetch('/api/school/upload', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || 'Photo upload failed')
      return data.data?.url || null
    } catch (err) {
      // Photo upload failed — continue without photo
      console.warn('Photo upload failed:', err.message)
      return null
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let photoUrl = form.photo_url

      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile)
      }

      const payload = {
        first_name: form.first_name,
        surname: form.surname,
        last_name: form.last_name,
        admission_number: form.admission_number,
        class_id: form.class_id || null,
        sex: form.sex,
        date_of_birth: form.date_of_birth || null,
        photo_url: photoUrl
      }

      let res
      if (editId) {
        res = await put(`/students?id=${editId}`, payload)
      } else {
        res = await post('/students', payload)
      }

      setSuccess('Student saved successfully')
      setTimeout(() => { setModal(null); fetchData() }, 500)
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this student?')) return
    try {
      await del(`/students?id=${id}`)
      await fetchData()
      setSuccess('Student deactivated')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { alert(err.message) }
  }

  const handleActivate = async (id) => {
    if (!confirm('Activate this student?')) return
    try {
      await put(`/students?id=${id}`, { is_active: 1 })
      await fetchData()
      setSuccess('Student activated')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { alert(err.message) }
  }

  const handleCsvImport = async () => {
    if (!csvFile) {
      alert('Please select a CSV file')
      return
    }

    setCsvImporting(true)
    setCsvResult(null)

    try {
      const formData = new FormData()
      formData.append('csv', csvFile)

      const token = localStorage.getItem('gg_token')
      // Use proxy path with route param
      const response = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setCsvResult(data.data)
        fetchData()
        setCsvFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        alert(data.message || 'Import failed')
      }
    } catch (err) {
      alert('Import failed: ' + err.message)
    } finally {
      setCsvImporting(false)
    }
  }

  const handleExportCSV = () => {
    if (students.length === 0) {
      alert('No students to export')
      return
    }

    setExporting(true)
    try {
      const headers = ['Surname', 'First Name', 'Other Name', 'Admission Number', 'Class', 'Sex', 'Date of Birth', 'Status']
      
      const rows = students.map(student => {
        const className = getClassName(student.class_id)
        return [
          student.surname || '',
          student.first_name || '',
          student.last_name || '',
          student.admission_number || '',
          className,
          student.sex || '',
          student.date_of_birth || '',
          student.is_active ? 'Active' : 'Inactive'
        ]
      })

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  const downloadTemplate = () => {
    const headers = ['Surname', 'First Name', 'Other Name', 'Admission Number', 'Class Name', 'Sex', 'Date of Birth']
    const csvContent = headers.join(',') + '\n' + 'Doe,John,Smith,GF/2024/001,JSS 1,Male,2010-05-15'
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId)
    return cls ? cls.name : '-'
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Name display functions
  const getListName = (student) => {
    const surname = student.surname || ''
    const firstName = student.first_name || ''
    const lastName = student.last_name || ''
    const lastNameInitial = lastName ? ' ' + lastName.charAt(0) + '.' : ''
    
    let name = ''
    if (surname) name += surname
    if (firstName || lastNameInitial) {
      if (name) name += ', '
      if (firstName) name += firstName
      if (lastNameInitial) name += lastNameInitial
    }
    return name || 'Unnamed'
  }

  const getDetailName = (student) => {
    const surname = student.surname || ''
    const firstName = student.first_name || ''
    const lastName = student.last_name || ''
    
    let name = ''
    if (surname) name += surname
    if (firstName || lastName) {
      if (name) name += ', '
      if (firstName) name += firstName
      if (lastName) name += ' ' + lastName
    }
    return name || 'Unnamed'
  }

  const truncateName = (name) => {
    if (!name) return ''
    return name.length > 30 ? name.substring(0, 30) + '...' : name
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Students</h1>
            <p className="text-gray-500 text-sm">Manage all students in your school</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCSV}
              disabled={exporting || students.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <FileDown size={16} /> Export CSV
            </button>
            <button
              onClick={() => setModal('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              <Upload size={16} /> Import CSV
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Add Student
            </button>
          </div>
        </div>

        {/* Filters - FIXED VISIBILITY */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or admission number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800 bg-white"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white text-gray-800 min-w-[150px]"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
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
          ) : students.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
              No students found
            </div>
          ) : (
            students.map((student) => {
              const displayName = getListName(student)
              return (
                <div key={student.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.first_name} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-lg">
                          {(student.surname || student.first_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {truncateName(displayName)}
                      </p>
                      <p className="text-xs text-gray-500">Adm: {student.admission_number}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">{getClassName(student.class_id)}</span>
                        <span className="text-xs text-gray-600">{student.sex || '-'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          student.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openViewModal(student)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(student)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    {student.is_active ? (
                      <button
                        onClick={() => handleDeactivate(student.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Deactivate"
                      >
                        <UserX size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(student.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Activate"
                      >
                        <UserCheck size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Photo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admission No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sex</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="7" className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const displayName = getListName(student)
                    return (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-3">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt="Student" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-sm">
                              {(student.surname || student.first_name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-sm truncate max-w-[200px]" title={getDetailName(student)}>
                            {truncateName(displayName)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.admission_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{getClassName(student.class_id)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.sex || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {student.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openViewModal(student)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => openEditModal(student)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            {student.is_active ? (
                              <button
                                onClick={() => handleDeactivate(student.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Deactivate"
                              >
                                <UserX size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(student.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                title="Activate"
                              >
                                <UserCheck size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {modal === 'add' ? 'Add Student' : 'Edit Student'}
                </h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 hover:border-purple-400 transition-colors duration-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Passport Photo</label>
                  <div className="flex items-center gap-6">
                    <div 
                      className="relative w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer group hover:bg-gray-300 transition-colors duration-200"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-500">
                          <Camera size={28} />
                          <span className="text-xs mt-1">Add Photo</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Upload a passport photo for the student.</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF (max 2MB)</p>
                      {photoFile && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          <Check size={14} /> {photoFile.name}
                        </p>
                      )}
                      {uploadingPhoto && (
                        <p className="text-xs text-blue-600 mt-2">Uploading...</p>
                      )}
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Choose File
                      </button>
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                    <input
                      type="text"
                      name="surname"
                      value={form.surname}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                    />
                  </div>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="admission_number"
                    value={form.admission_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select
                      name="class_id"
                      value={form.class_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                    <select
                      name="sex"
                      value={form.sex}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-800"
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
                    disabled={saving || uploadingPhoto}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 text-sm disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : (modal === 'add' ? 'Add Student' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {modal === 'view' && viewStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Student Details</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {viewStudent.photo_url ? (
                    <img src={viewStudent.photo_url} alt="Student" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-2xl">
                      {(viewStudent.surname || viewStudent.first_name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-gray-800">{getDetailName(viewStudent)}</p>
                    <p className="text-sm text-gray-500">Admission: {viewStudent.admission_number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Class</p>
                    <p className="text-sm font-medium text-gray-700">{getClassName(viewStudent.class_id)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Sex</p>
                    <p className="text-sm font-medium text-gray-700">{viewStudent.sex || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-700">{viewStudent.date_of_birth || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      viewStudent.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {viewStudent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setModal(null)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setModal(null)
                      openEditModal(viewStudent)
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200 text-sm"
                  >
                    Edit Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {modal === 'csv' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Import Students from CSV</h2>
                <button onClick={() => { setModal(null); setCsvResult(null); setCsvFile(null) }} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              {csvResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-700 font-medium">✅ {csvResult.imported || 0} students imported successfully</p>
                    {csvResult.skipped > 0 && (
                      <p className="text-yellow-600 text-sm mt-1">⚠️ {csvResult.skipped} rows skipped</p>
                    )}
                    {csvResult.errors && csvResult.errors.length > 0 && (
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        {csvResult.errors.slice(0, 10).map((err, i) => (
                          <p key={i} className="text-red-600 text-xs">{err}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setModal(null); setCsvResult(null); setCsvFile(null) }}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors duration-200"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file with the following columns:
                    <br />
                    <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">Surname, First Name, Other Name, Admission Number, Class Name, Sex, Date of Birth</span>
                  </p>

                  <button
                    onClick={downloadTemplate}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 mb-4"
                  >
                    <Download size={14} /> Download Template
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                  />

                  {csvFile && (
                    <p className="text-sm text-gray-600 mt-2">Selected: {csvFile.name}</p>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => { setModal(null); setCsvFile(null) }}
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCsvImport}
                      disabled={csvImporting || !csvFile}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50"
                    >
                      {csvImporting ? 'Importing...' : 'Import'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}