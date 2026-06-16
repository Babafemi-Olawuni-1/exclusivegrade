import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload, Search } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useAuthContext } from '../../context/AuthContext'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Select from '../../components/Select'
import Modal from '../../components/Modal'
import Card from '../../components/Card'
import Alert from '../../components/Alert'
import Pagination from '../../components/Pagination'

export default function StudentManagement() {
  const { get, post, put, del } = useApi()
  const { school } = useAuthContext()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [classes, setClasses] = useState([])

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Form data
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    last_name: '',
    admission_number: '',
    class: '',
    sex: '',
    dob: '',
    photo: null,
  })

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await get('/students')
      if (response.success) {
        setStudents(response.data)
      } else {
        setError(response.message || 'Failed to load students')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await get('/classes')
      if (response.success) {
        setClasses(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch classes', err)
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData({ ...formData, [name]: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    try {
      const response = await post('/students', formData)
      if (response.success) {
        setSuccess('Student added successfully')
        setShowAddModal(false)
        setFormData({
          first_name: '',
          surname: '',
          last_name: '',
          admission_number: '',
          class: '',
          sex: '',
          dob: '',
          photo: null,
        })
        fetchStudents()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditStudent = async (e) => {
    e.preventDefault()
    try {
      const response = await put(`/students/${selectedStudent.id}`, formData)
      if (response.success) {
        setSuccess('Student updated successfully')
        setShowEditModal(false)
        fetchStudents()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteStudent = async () => {
    try {
      const response = await del(`/students/${selectedStudent.id}`)
      if (response.success) {
        setSuccess('Student deactivated successfully')
        setShowDeleteModal(false)
        fetchStudents()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const openEditModal = (student) => {
    setSelectedStudent(student)
    setFormData({
      first_name: student.first_name,
      surname: student.surname,
      last_name: student.last_name,
      admission_number: student.admission_number,
      class: student.class,
      sex: student.sex,
      dob: student.dob,
      photo: null,
    })
    setShowEditModal(true)
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = !filterClass || student.class === filterClass
    return matchesSearch && matchesClass
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} dismissible />}

      {/* Filters */}
      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Search by name or admission number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            icon={Search}
          />
          <Select
            options={classes.map(c => ({ label: c.name, value: c.id }))}
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </Card>

      {/* Students Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading...</div>
        ) : paginatedStudents.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Admission No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Class</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sex</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student, idx) => (
                    <tr key={idx} className="table-row border-b">
                      <td className="px-6 py-4 text-gray-900">
                        <div className="flex items-center gap-3">
                          {student.photo_url && (
                            <img src={student.photo_url} alt="" className="h-8 w-8 rounded-full" />
                          )}
                          <div>
                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{student.admission_number}</td>
                      <td className="px-6 py-4 text-gray-900">{student.class}</td>
                      <td className="px-6 py-4 text-gray-900">{student.sex}</td>
                      <td className="px-6 py-4">
                        <span className={student.is_active ? 'badge-success' : 'badge-error'}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(student)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-6 border-t flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-gray-600">No students found</div>
        )}
      </Card>

      {/* Add Student Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student" size="lg">
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Last Name *"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Admission Number *"
              name="admission_number"
              value={formData.admission_number}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Class *"
              name="class"
              value={formData.class}
              onChange={handleChange}
              options={classes.map(c => ({ label: c.name, value: c.id }))}
              required
            />
            <Select
              label="Sex *"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              options={[
                { label: 'Male', value: 'M' },
                { label: 'Female', value: 'F' },
              ]}
              required
            />
          </div>
          <Input
            label="Date of Birth"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />
          <Input
            label="Photo"
            type="file"
            name="photo"
            onChange={handleChange}
            accept="image/*"
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Add Student
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Student" size="lg">
        <form onSubmit={handleEditStudent} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
            <Input
              label="Surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
            <Input
              label="Admission Number"
              name="admission_number"
              value={formData.admission_number}
              onChange={handleChange}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              options={classes.map(c => ({ label: c.name, value: c.id }))}
            />
            <Select
              label="Sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              options={[
                { label: 'Male', value: 'M' },
                { label: 'Female', value: 'F' },
              ]}
            />
          </div>
          <Input
            label="Date of Birth"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />
          <Input
            label="Photo"
            type="file"
            name="photo"
            onChange={handleChange}
            accept="image/*"
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Update Student
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Deactivate Student" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to deactivate {selectedStudent?.first_name} {selectedStudent?.last_name}?
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteStudent}
              className="flex-1"
            >
              Deactivate
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
