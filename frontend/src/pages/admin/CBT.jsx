import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Filter } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const EMPTY = { subject:'', class_level:'', question:'', options:['','','',''], correct_answer:'', explanation:'', is_premium: false }

export default function CBT() {
  const { get, post, put, del, loading } = useApi()
  const [questions, setQuestions] = useState([])
  const [filters, setFilters] = useState({ subject:'', class_level:'', is_premium:'' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  const fetch = useCallback(async () => {
    try {
      const params = {}
      if (filters.subject) params.subject = filters.subject
      if (filters.class_level) params.class_level = filters.class_level
      if (filters.is_premium !== '') params.is_premium = filters.is_premium
      const res = await get('/cbt?action=questions', params)
      setQuestions(res.questions || [])
    } catch { setError('Failed to load questions.') }
  }, [filters])

  useEffect(() => { fetch() }, [fetch])

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModalOpen(true) }
  const openEdit = (q) => {
    setForm({
      subject: q.subject, class_level: q.class_level, question: q.question,
      options: q.options || ['','','',''], correct_answer: q.correct_answer,
      explanation: q.explanation || '', is_premium: q.is_premium || false,
    })
    setEditing(q.id)
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editing) await put(`/cbt?action=questions&id=${editing}`, form)
      else         await post('/cbt?action=questions', form)
      setSuccess(editing ? 'Question updated.' : 'Question added.')
      setModalOpen(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await del(`/cbt?action=questions&id=${target.id}`)
      setSuccess('Question deleted.')
      setDeleteModal(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const updateOption = (i, val) => {
    const opts = [...form.options]
    opts[i] = val
    setForm({ ...form, options: opts })
  }

  const set = k => e => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">CBT Question Bank</h1>
          <p className="text-sm text-gray-500">{questions.length} questions</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4" /> Add Question</Button>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Filter by subject..." value={filters.subject} onChange={e=>setFilters({...filters,subject:e.target.value})} className="w-48" />
        <Input placeholder="Filter by class level..." value={filters.class_level} onChange={e=>setFilters({...filters,class_level:e.target.value})} className="w-48" />
        <Select options={[{value:'',label:'All'},{value:'1',label:'Premium'},{value:'0',label:'Free'}]} value={filters.is_premium} onChange={e=>setFilters({...filters,is_premium:e.target.value})} placeholder={null} className="w-32" />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p className="font-medium">No questions found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>{['#','Question','Subject','Class','Type','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {questions.map((q,i) => (
                  <tr key={q.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-3 text-gray-400">{i+1}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate font-medium">{q.question}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{q.subject}</td>
                    <td className="px-4 py-3 text-gray-600">{q.class_level}</td>
                    <td className="px-4 py-3">
                      <Badge variant={q.is_premium ? 'warning' : 'gray'}>{q.is_premium ? 'Premium' : 'Free'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { setTarget(q); setDeleteModal(true) }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Question' : 'Add Question'} size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button form="cbt-form" type="submit" loading={submitting}>{editing ? 'Update' : 'Add'}</Button></div>}
      >
        <form id="cbt-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Subject" required value={form.subject} onChange={set('subject')} placeholder="e.g. Mathematics" />
            <Input label="Class Level" required value={form.class_level} onChange={set('class_level')} placeholder="e.g. JSS 1" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#333333] block mb-1">Question <span className="text-[#EF4444]">*</span></label>
            <textarea rows={3} required value={form.question} onChange={set('question')}
              className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00] resize-none"
              placeholder="Enter question here..." />
          </div>
          <div>
            <label className="text-sm font-medium text-[#333333] block mb-2">Options</label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-6 h-6 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {String.fromCharCode(65+i)}
                  </span>
                  <Input value={opt} onChange={e=>updateOption(i,e.target.value)} placeholder={`Option ${String.fromCharCode(65+i)}`} />
                </div>
              ))}
            </div>
          </div>
          <Select label="Correct Answer" required
            options={form.options.filter(Boolean).map((o,i) => ({ value: o, label: `${String.fromCharCode(65+i)}: ${o}` }))}
            value={form.correct_answer} onChange={set('correct_answer')}
          />
          <Input label="Explanation (optional)" value={form.explanation} onChange={set('explanation')} placeholder="Brief explanation of the correct answer" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_premium} onChange={e=>setForm({...form,is_premium:e.target.checked})} className="w-4 h-4 accent-[#FF6B00]" />
            Mark as Premium Question
          </label>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Question" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button><Button variant="danger" loading={submitting} onClick={handleDelete}>Delete</Button></div>}
      >
        <p className="text-sm text-gray-600">Delete this question permanently?</p>
      </Modal>
    </div>
  )
}
