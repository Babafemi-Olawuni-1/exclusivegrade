import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Copy } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Card from '../../components/Card'
import Alert from '../../components/Alert'
import Pagination from '../../components/Pagination'

export default function TeacherManagement() {
  const { get, post, put, del } = useApi()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreatedModal, setShowCreatedModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [newTeacherCredentials, setNewTeacherCredentials] = useState(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const response = await get('/teachers')
      if (response.success) {
        setTeachers(response.data)
      } else {
        setError(response.message || 'Failed to load teachers')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddTeacher = async (e) => {
    e.preventDefault()
    try {
      const response = await post('/teachers', formData)
      if (response.success) {
        setNewTeacherCredentials(response.data)
        setShowAddModal(false)
        setShowCreatedModal(true)
        setFormData({ first_name: '', last_name: '', email: '' })
        fetchTeachers()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditTeacher = async (e) => {
    e.preventDefault()
    try {
      const response = await put(`/teachers/${selectedTeacher.id}`, formData)
      if (response.success) {
        setSuccess('Teacher updated successfully')
        setShowEditModal(false)
        fetchTeachers()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteTeacher = async () => {
    try {
      const response = await del(`/teachers/${selectedTeacher.id}`)
      if (response.success) {
        setSuccess('Teacher deactivated successfully')
        setShowDeleteModal(false)
        fetchTeachers()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher)
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
    })
    setShowEditModal(true)
  }

  const handleCopyCredentials = () => {
    const text = `Username: ${newTeacherCredentials.username}\nPassword: ${newTeacherCredentials.password}`
    navigator.clipboard.writeText(text)
    setSuccess('Credentials copied to clipboard')
  }

  const filteredTeachers = teachers.filter(teacher =>
    teacher.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} dismissible />}

      {/* Search */}
      <Card>
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          icon={Search}
        />
      </Card>

      {/* Teachers Table */}
      <Card noPadding>
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading...</div>
        ) : paginatedTeachers.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Username</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTeachers.map((teacher, idx) => (
                    <tr key={idx} className="table-row border-b">
                      <td className="px-6 py-4 text-gray-900">
                        {teacher.first_name} {teacher.last_name}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{teacher.email}</td>
                      <td className="px-6 py-4 text-gray-900">{teacher.username}</td>
                      <td className="px-6 py-4">
                        <span className={teacher.is_active ? 'badge-success' : 'badge-error'}>
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(teacher)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher)
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
          <div className="p-6 text-center text-gray-600">No teachers found</div>
        )}
      </Card>

      {/* Add Teacher Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Teacher">
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <Input
            label="First Name *"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Last Name *"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Add Teacher
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

      {/* Teacher Created Modal */}
      <Modal
        isOpen={showCreatedModal}
        onClose={() => setShowCreatedModal(false)}
        title="Teacher Account Created"
      >
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-green-700">Teacher account has been successfully created!</p>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-3 py-2 bg-white border rounded font-mono text-sm">
                  {newTeacherCredentials?.username}
                </code>
                <button
                  onClick={handleCopyCredentials}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Default Password</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-3 py-2 bg-white border rounded font-mono text-sm">
                  {newTeacherCredentials?.password}
                </code>
                <button
                  onClick={handleCopyCredentials}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            Share these credentials with the teacher. They should change their password on first login.
          </p>

          <Button
            onClick={() => setShowCreatedModal(false)}
            variant="primary"
            className="w-full"
          >
            Done
          </Button>
        </div>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Teacher">
        <form onSubmit={handleEditTeacher} className="space-y-4">
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
            onChange={handleChange}
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              Update Teacher
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
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Deactivate Teacher" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to deactivate {selectedTeacher?.first_name} {selectedTeacher?.last_name}?
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteTeacher}
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
