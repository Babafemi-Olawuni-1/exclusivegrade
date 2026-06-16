import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Card from '../../components/Card'
import Alert from '../../components/Alert'

export default function Announcements() {
  const { get, post, put, del } = useApi()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await get('/announcements')
      if (response.success) {
        setAnnouncements(response.data)
      } else {
        setError(response.message)
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

  const handleAdd = () => {
    setIsEditing(false)
    setFormData({ title: '', content: '', type: 'general' })
    setShowModal(true)
  }

  const handleEdit = (announcement) => {
    setIsEditing(true)
    setSelectedAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditing) {
        const response = await put(`/announcements/${selectedAnnouncement.id}`, formData)
        if (response.success) {
          setSuccess('Announcement updated')
        }
      } else {
        const response = await post('/announcements', formData)
        if (response.success) {
          setSuccess('Announcement created')
        }
      }
      setShowModal(false)
      fetchAnnouncements()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return

    try {
      const response = await del(`/announcements/${id}`)
      if (response.success) {
        setSuccess('Announcement deleted')
        fetchAnnouncements()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredAnnouncements = announcements.filter(ann =>
    ann.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <Button variant="primary" onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} dismissible />}

      {/* Search */}
      <Card>
        <Input
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading...</div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((ann, idx) => (
            <Card key={idx}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
                  <p className="text-gray-600 mt-2">{ann.content}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ann.type === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : ann.type === 'important'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ann.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(ann)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-gray-600">No announcements</div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Announcement' : 'New Announcement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Announcement content..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            rows="5"
            required
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="general">General</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="primary" className="flex-1">
              {isEditing ? 'Update' : 'Publish'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
