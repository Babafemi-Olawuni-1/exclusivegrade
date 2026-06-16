// Teacher's Lesson Notes page - reuses the same logic as admin
// but scoped to teacher's own notes
import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Eye, Cpu } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

export default function TeacherLessonNotes() {
  const { get, post, put, del, loading } = useApi()
  const [notes, setNotes] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [aiModal, setAiModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [form, setForm] = useState({ topic:'', content:'', class_id:'', subject_id:'' })
  const [aiForm, setAiForm] = useState({ topic:'', class:'', subject:'', class_id:'', subject_id:'' })

  const fetch = useCallback(async () => {
    try {
      const res = await get('/lesson-notes')
      setNotes(res.notes || [])
    } catch { setError('Failed to load lesson notes.') }
  }, [])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    Promise.all([get('/classes'), get('/subjects')]).then(([c, s]) => {
      setClasses(c.classes || [])
      setSubjects(s.subjects || [])
    }).catch(() => {})
  }, [])

  const openAdd  = () => { setForm({ topic:'', content:'', class_id:'', subject_id:'' }); setEditing(null); setModalOpen(true) }
  const openEdit = (n) => { setForm({ topic:n.topic, content:n.content, class_id:n.class_id, subject_id:n.subject_id }); setEditing(n.id); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editing) await put(`/lesson-notes?id=${editing}`, form)
      else         await post('/lesson-notes', form)
      setSuccess(editing ? 'Note updated.' : 'Note created.')
      setModalOpen(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await del(`/lesson-notes?id=${target.id}`)
      setSuccess('Note deleted.')
      setDeleteModal(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleAiGenerate = async (e) => {
    e.preventDefault()
    setAiGenerating(true)
    try {
      const res = await post('/lesson-notes/ai', aiForm)
      setForm({ topic: aiForm.topic, content: res.note?.content || res.content || '', class_id: aiForm.class_id, subject_id: aiForm.subject_id })
      setAiModal(false)
      setEditing(null)
      setModalOpen(true)
    } catch (err) { setError(err.message || 'AI generation failed.') }
    finally { setAiGenerating(false) }
  }

  const set = k => e => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Lesson Notes</h1>
          <p className="text-sm text-gray-500">{notes.length} notes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setAiModal(true)}><Cpu className="w-4 h-4" /> AI Generate</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4" /> Add Note</Button>
        </div>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="font-medium">No lesson notes yet.</p></div>
        ) : (
          <div className="divide-y divide-[#E5E5E5]">
            {notes.map(n => (
              <div key={n.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#F5F5F5] transition-colors">
                <div>
                  <p className="font-medium text-sm">{n.topic}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.class_name} · {n.subject_name} · {formatDate(n.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setTarget(n); setViewModal(true) }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openEdit(n)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { setTarget(n); setDeleteModal(true) }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals same as admin version */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Lesson Note' : 'Add Lesson Note'} size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button form="note-form-t" type="submit" loading={submitting}>{editing?'Update':'Save'}</Button></div>}
      >
        <form id="note-form-t" onSubmit={handleSubmit} className="space-y-4">
          <Input label="Topic" required value={form.topic} onChange={set('topic')} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Class" options={classes.map(c=>({value:c.id,label:c.name}))} value={form.class_id} onChange={set('class_id')} />
            <Select label="Subject" options={subjects.map(s=>({value:s.id,label:s.name}))} value={form.subject_id} onChange={set('subject_id')} />
          </div>
          <div>
            <label className="text-sm font-medium text-[#333333] block mb-1">Content</label>
            <textarea required rows={8} value={form.content} onChange={set('content')}
              className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00] resize-y" />
          </div>
        </form>
      </Modal>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title={target?.topic} size="lg">
        <div className="bg-[#F5F5F5] rounded-xl p-5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{target?.content}</div>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Note" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button><Button variant="danger" loading={submitting} onClick={handleDelete}>Delete</Button></div>}
      >
        <p className="text-sm text-gray-600">Delete <strong>{target?.topic}</strong>?</p>
      </Modal>

      <Modal isOpen={aiModal} onClose={() => setAiModal(false)} title="Generate with AI" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setAiModal(false)}>Cancel</Button><Button form="ai-form-t" type="submit" loading={aiGenerating} variant="dark"><Cpu className="w-4 h-4" /> Generate</Button></div>}
      >
        <form id="ai-form-t" onSubmit={handleAiGenerate} className="space-y-4">
          <Input label="Topic" required value={aiForm.topic} onChange={e=>setAiForm({...aiForm,topic:e.target.value})} />
          <Input label="Class Level" required value={aiForm.class} onChange={e=>setAiForm({...aiForm,class:e.target.value})} placeholder="e.g. JSS 2" />
          <Input label="Subject" required value={aiForm.subject} onChange={e=>setAiForm({...aiForm,subject:e.target.value})} placeholder="e.g. Biology" />
        </form>
      </Modal>
    </div>
  )
}
