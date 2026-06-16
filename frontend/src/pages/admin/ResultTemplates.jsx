import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Link2 } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ResultTemplates() {
  const { get, post, put, del, loading } = useApi()
  const [templates, setTemplates] = useState([])
  const [classes, setClasses] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [assignModal, setAssignModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [assignForm, setAssignForm] = useState({ template_id:'', class_id:'' })
  const [form, setForm] = useState({
    name: '',
    components: [{ name: 'CA', max_score: 40, percentage: 40 }, { name: 'Exam', max_score: 60, percentage: 60 }],
  })

  const fetch = useCallback(async () => {
    try {
      const [tr, cr] = await Promise.all([get('/result-templates'), get('/classes')])
      setTemplates(tr.templates || [])
      setClasses(cr.classes || [])
    } catch { setError('Failed to load templates.') }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const openAdd = () => {
    setForm({ name:'', components:[{name:'CA',max_score:40,percentage:40},{name:'Exam',max_score:60,percentage:60}] })
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (t) => {
    setForm({ name: t.name, components: t.components || [] })
    setEditing(t.id)
    setModalOpen(true)
  }

  const addComponent = () => setForm({ ...form, components: [...form.components, { name:'', max_score:0, percentage:0 }] })
  const removeComponent = (i) => setForm({ ...form, components: form.components.filter((_,idx) => idx !== i) })
  const updateComponent = (i, key, val) => {
    const comps = [...form.components]
    comps[i] = { ...comps[i], [key]: val }
    setForm({ ...form, components: comps })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editing) await put(`/result-templates?id=${editing}`, form)
      else         await post('/result-templates', form)
      setSuccess(editing ? 'Template updated.' : 'Template created.')
      setModalOpen(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await del(`/result-templates?id=${target.id}`)
      setSuccess('Template deleted.')
      setDeleteModal(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await post('/result-templates?action=assign', assignForm)
      setSuccess('Template assigned to class.')
      setAssignModal(false)
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const totalPercent = form.components.reduce((sum, c) => sum + Number(c.percentage || 0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Result Templates</h1>
          <p className="text-sm text-gray-500">Configure scoring components (CA, Exam, etc.)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setAssignModal(true)}><Link2 className="w-4 h-4" /> Assign to Class</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4" /> New Template</Button>
        </div>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {templates.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-card p-16 text-center text-gray-400">
              <p className="font-medium">No templates yet. Create your first result template.</p>
            </div>
          ) : templates.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold">{t.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { setTarget(t); setDeleteModal(true) }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="space-y-2">
                {t.components?.map((c,i) => (
                  <div key={i} className="flex justify-between text-sm bg-[#F5F5F5] rounded-lg px-3 py-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-gray-500">Max: {c.max_score} · {c.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Template' : 'Create Template'} size="lg"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button form="template-form" type="submit" loading={submitting}>{editing ? 'Update' : 'Create'}</Button></div>}
      >
        <form id="template-form" onSubmit={handleSubmit} className="space-y-5">
          <Input label="Template Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Standard Template" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#333333]">Scoring Components</label>
              <Button type="button" size="xs" variant="ghost" onClick={addComponent}><Plus className="w-3 h-3" /> Add</Button>
            </div>
            <div className="space-y-2">
              {form.components.map((c,i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-end">
                  <Input placeholder="Name (e.g. CA)" value={c.name} onChange={e => updateComponent(i,'name',e.target.value)} />
                  <Input type="number" placeholder="Max Score" value={c.max_score} onChange={e => updateComponent(i,'max_score',Number(e.target.value))} />
                  <Input type="number" placeholder="%" value={c.percentage} onChange={e => updateComponent(i,'percentage',Number(e.target.value))} />
                  <button type="button" onClick={() => removeComponent(i)} className="mb-1 p-2 rounded-lg hover:bg-red-50 text-red-500 text-sm">✕</button>
                </div>
              ))}
            </div>
            {totalPercent !== 100 && (
              <p className="text-xs text-amber-600 mt-2">Percentages total: {totalPercent}% (should be 100%)</p>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Template" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button><Button variant="danger" loading={submitting} onClick={handleDelete}>Delete</Button></div>}
      >
        <p className="text-sm text-gray-600">Delete template <strong>{target?.name}</strong>?</p>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Template to Class" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setAssignModal(false)}>Cancel</Button><Button loading={submitting} form="assign-form" type="submit">Assign</Button></div>}
      >
        <form id="assign-form" onSubmit={handleAssign} className="space-y-4">
          <Select label="Template" required options={templates.map(t => ({ value: t.id, label: t.name }))} value={assignForm.template_id} onChange={e => setAssignForm({...assignForm, template_id: e.target.value})} />
          <Select label="Class" required options={classes.map(c => ({ value: c.id, label: c.name }))} value={assignForm.class_id} onChange={e => setAssignForm({...assignForm, class_id: e.target.value})} />
        </form>
      </Modal>
    </div>
  )
}
