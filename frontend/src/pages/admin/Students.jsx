import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, Upload, Download } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import Badge from '../../components/common/Badge'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const EMPTY = { first_name:'', surname:'', last_name:'', admission_number:'', class_id:'', date_of_birth:'', sex:'Male' }

export default function Students() {
  const { get, post, put, del, loading } = useApi()

  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [csvFile, setCsvFile] = useState(null)

  const fetchStudents = useCallback(async () => {
    try {
      const params = { page, per_page: 20 }
      if (search) params.search = search
      if (classFilter) params.class_id = classFilter
      const res = await get('/students', params)
      setStudents(res.students || [])
      setTotal(res.total || 0)
    } catch { setError('Failed to load students.') }
  }, [page, search, classFilter])

  useEffect(() => { fetchStudents() }, [fetchStudents])
  useEffect(() => {
    get('/classes').then(r => setClasses(r.classes || [])).catch(() => {})
  }, [])

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModalOpen(true) }
  const openEdit = (s) => { setForm({ ...s, class_id: s.class_id || '' }); setEditing(s.id); setModalOpen(true) }
  const openDel  = (s) => { setTarget(s); setDeleteModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editing) {
        await put(`/students?id=${editing}`, form)
        setSuccess('Student updated successfully.')
      } else {
        await post('/students', form)
        setSuccess('Student added successfully.')
      }
      setModalOpen(false)
      fetchStudents()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await del(`/students?id=${target.id}`)
      setSuccess('Student deactivated.')
      setDeleteModal(false)
      fetchStudents()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!csvFile) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('file', csvFile)
      await post('/students/import', fd)
      setSuccess('Students imported successfully.')
      setImportModal(false)
      fetchStudents()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const set = k => e => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Students</h1>
          <p className="text-sm text-gray-500">{total} students enrolled</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setImportModal(true)}>
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            placeholder="Search students..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select
          options={[{ value:'', label:'All Classes' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
          value={classFilter}
          onChange={e => { setClassFilter(e.target.value); setPage(1) }}
          placeholder={null}
          className="sm:w-48"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">No students found.</p>
            <p className="text-sm mt-1">Add your first student to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>
                  {['Name','Admission No.','Class','Sex','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {s.first_name} {s.surname} {s.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.admission_number}</td>
                    <td className="px-4 py-3 text-gray-600">{s.class_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.sex}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.status === 'active' ? 'success' : 'gray'}>
                        {s.status || 'active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openDel(s)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / 20)}
          onPageChange={setPage}
          totalItems={total}
          perPage={20}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Student' : 'Add Student'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button form="student-form" type="submit" loading={submitting}>
              {editing ? 'Update' : 'Add'} Student
            </Button>
          </div>
        }
      >
        <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name"    required value={form.first_name}       onChange={set('first_name')} />
            <Input label="Surname"       required value={form.surname}          onChange={set('surname')} />
          </div>
          <Input label="Last Name (optional)" value={form.last_name} onChange={set('last_name')} />
          <Input label="Admission Number" required value={form.admission_number} onChange={set('admission_number')} />
          <Select
            label="Class" required
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            value={form.class_id}
            onChange={set('class_id')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
            <Select
              label="Sex"
              options={['Male','Female']}
              value={form.sex}
              onChange={set('sex')}
              placeholder={null}
            />
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Deactivate Student"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={submitting} onClick={handleDelete}>Deactivate</Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to deactivate <strong>{target?.first_name} {target?.surname}</strong>? This will remove their active status.
        </p>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={importModal}
        onClose={() => setImportModal(false)}
        title="Import Students via CSV"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setImportModal(false)}>Cancel</Button>
            <Button form="import-form" type="submit" loading={submitting}>Import</Button>
          </div>
        }
      >
        <form id="import-form" onSubmit={handleImport} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">CSV Format</p>
            <p>Columns: first_name, surname, last_name, admission_number, class_id, date_of_birth, sex</p>
          </div>
          <Input
            label="CSV File" type="file" accept=".csv"
            onChange={e => setCsvFile(e.target.files[0])} required
          />
        </form>
      </Modal>
    </div>
  )
}
