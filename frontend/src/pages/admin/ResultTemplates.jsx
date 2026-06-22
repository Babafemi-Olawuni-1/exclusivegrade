import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Link2, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function ResultTemplates() {
  const { get, post, put, del } = useApi()
  const [templates, setTemplates] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [assignForm, setAssignForm] = useState({ template_id: '', class_id: '' })
  const [form, setForm] = useState({
    name: '',
    components: [{ name: 'CA1', max_score: 20 }, { name: 'CA2', max_score: 20 }, { name: 'Exam', max_score: 60 }],
  })

  const fetch = async () => {
    setLoading(true)
    try {
      const [tr, cr] = await Promise.allSettled([get('/result-templates'), get('/classes')])
      if (tr.value?.success) setTemplates(tr.value.data || [])
      if (cr.value?.success) setClasses(cr.value.data || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => {
    setForm({ name:'', components:[{name:'CA1',max_score:20},{name:'CA2',max_score:20},{name:'Exam',max_score:60}] })
    setEditing(null)
    setModal('form')
  }

  const openEdit = (t) => {
    setForm({ name: t.name, components: t.components || [] })
    setEditing(t.id)
    setModal('form')
  }

  const addComponent = () => setForm({ ...form, components: [...form.components, { name: '', max_score: 0 }] })
  const removeComponent = (i) => setForm({ ...form, components: form.components.filter((_,idx) => idx !== i) })
  const updateComp = (i, key, val) => {
    const c = [...form.components]; c[i] = { ...c[i], [key]: val }; setForm({ ...form, components: c })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let res
      if (editing) res = await put(`/result-templates?id=${editing}`, form)
      else         res = await post('/result-templates', form)
      if (res.success) { setSuccess(editing ? 'Template updated.' : 'Template created.'); setModal(null); fetch() }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      const res = await del(`/result-templates?id=${target.id}`)
      if (res.success) { setSuccess('Deleted.'); setModal(null); fetch() }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await post('/result-templates?action=assign', assignForm)
      if (res.success) { setSuccess('Template assigned to class.'); setModal(null) }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const totalScore = form.components.reduce((s, c) => s + Number(c.max_score || 0), 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Result Templates</h1>
            <p className="text-gray-500 text-sm">Configure scoring components (CA, Exam, etc.)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal('assign')} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm flex items-center gap-2"><Link2 size={16}/> Assign to Class</button>
            <button onClick={openAdd} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm flex items-center gap-2"><Plus size={16}/> New Template</button>
          </div>
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {templates.length === 0 ? (
              <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">No templates yet. Create your first result template.</div>
            ) : templates.map(t => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-800">{t.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15}/></button>
                    <button onClick={() => { setTarget(t); setModal('delete') }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {t.components?.map((c, i) => (
                    <div key={i} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-medium text-gray-700">{c.name}</span>
                      <span className="text-gray-500">Max: {c.max_score}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-400">Total: {t.components?.reduce((s,c)=>s+Number(c.max_score||0),0)} marks</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {modal === 'form' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{editing ? 'Edit Template' : 'Create Template'}</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Template Name <span className="text-red-500">*</span></label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Standard Template" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Components</label>
                  <button type="button" onClick={addComponent} className="text-xs text-purple-600 hover:text-purple-700 font-medium">+ Add Component</button>
                </div>
                <div className="space-y-2">
                  {form.components.map((c, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 items-center">
                      <input className="col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Name (e.g. CA)" value={c.name} onChange={e => updateComp(i,'name',e.target.value)} />
                      <input type="number" className="col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Max Score" value={c.max_score} onChange={e => updateComp(i,'max_score',e.target.value)} />
                      <button type="button" onClick={() => removeComponent(i)} className="py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">✕</button>
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-1.5 ${totalScore === 100 ? 'text-green-600' : 'text-amber-600'}`}>Total: {totalScore} marks (should equal 100)</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {modal === 'assign' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Assign Template to Class</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Template <span className="text-red-500">*</span></label>
                <select required value={assignForm.template_id} onChange={e => setAssignForm({...assignForm, template_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Select Template --</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Class <span className="text-red-500">*</span></label>
                <select required value={assignForm.class_id} onChange={e => setAssignForm({...assignForm, class_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Select Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Assigning...' : 'Assign'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Delete Template</h2>
            <p className="text-gray-600 text-sm mb-5">Delete <strong>{target?.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
