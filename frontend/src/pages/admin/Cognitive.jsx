import { useState, useEffect } from 'react'
import { Plus, Link2, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Cognitive() {
  const { get, post } = useApi()
  const [templates, setTemplates] = useState([])
  const [classes, setClasses] = useState([])
  const [sessions, setSessions] = useState([])
  const [cogResults, setCogResults] = useState([])
  const [tab, setTab] = useState('templates')
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resultsFilter, setResultsFilter] = useState({ class_id: '', term_id: '' })

  const [templateForm, setTemplateForm] = useState({ name: '', skills: [''] })
  const [assignForm, setAssignForm] = useState({ template_id: '', class_id: '' })

  const allTerms = sessions.flatMap(s => (s.terms||[]).map(t => ({...t, session_name: s.name})))

  const fetch = async () => {
    try {
      const [tr, cr, sr] = await Promise.allSettled([
        get('/cognitive?action=templates'),
        get('/classes'),
        get('/sessions'),
      ])
      if (tr.value?.success) setTemplates(tr.value.data || [])
      if (cr.value?.success) setClasses(cr.value.data || [])
      if (sr.value?.success) setSessions(sr.value.data || [])
    } catch(e) { console.error(e) }
  }

  useEffect(() => { fetch() }, [])

  useEffect(() => {
    if (tab === 'results' && resultsFilter.class_id && resultsFilter.term_id) {
      get('/cognitive?action=results', resultsFilter).then(r => { if (r.success) setCogResults(r.data || []) }).catch(()=>{})
    }
  }, [tab, resultsFilter])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await post('/cognitive?action=templates', { name: templateForm.name, skills: templateForm.skills.filter(Boolean) })
      if (res.success) { setSuccess('Template created.'); setModal(null); fetch() }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await post('/cognitive?action=assign', assignForm)
      if (res.success) { setSuccess('Template assigned.'); setModal(null) }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const addSkill = () => setTemplateForm({...templateForm, skills: [...templateForm.skills, '']})
  const updSkill = (i, v) => { const s=[...templateForm.skills]; s[i]=v; setTemplateForm({...templateForm, skills: s}) }
  const remSkill = (i) => setTemplateForm({...templateForm, skills: templateForm.skills.filter((_,idx)=>idx!==i)})

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Cognitive Assessment</h1>
            <p className="text-gray-500 text-sm">Psychomotor & affective domain assessment</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal('assign')} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm flex items-center gap-2"><Link2 size={16}/> Assign Template</button>
            <button onClick={() => { setTemplateForm({name:'',skills:['']}); setModal('create') }} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm flex items-center gap-2"><Plus size={16}/> New Template</button>
          </div>
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[['templates','Templates'],['results','Results']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===k?'bg-white text-purple-600 shadow-sm':'text-gray-500 hover:text-gray-800'}`}>{l}</button>
          ))}
        </div>

        {tab === 'templates' ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {templates.length === 0 ? (
              <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">No templates. Create one to get started.</div>
            ) : templates.map(t => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">{t.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {t.skills?.map((s,i)=><span key={i} className="bg-purple-50 text-purple-600 text-xs px-2.5 py-1 rounded-full border border-purple-100">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select value={resultsFilter.class_id} onChange={e => setResultsFilter({...resultsFilter, class_id: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select Class</option>
                {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={resultsFilter.term_id} onChange={e => setResultsFilter({...resultsFilter, term_id: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select Term</option>
                {allTerms.map(t=><option key={t.id} value={t.id}>{t.name} ({t.session_name})</option>)}
              </select>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {cogResults.length === 0 ? (
                <p className="text-center py-12 text-gray-400 text-sm">Select class and term to view results.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>{['Student','Skill','Rating'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cogResults.map((r,i)=>(
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{r.student_name}</td>
                        <td className="px-4 py-3 text-gray-600">{r.skill_name}</td>
                        <td className="px-4 py-3 font-bold text-purple-700">{r.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Create Template</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Template Name <span className="text-red-500">*</span></label>
                <input required type="text" value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Psychomotor Assessment" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Skills / Traits</label>
                  <button type="button" onClick={addSkill} className="text-xs text-purple-600 font-medium hover:text-purple-700">+ Add Skill</button>
                </div>
                <div className="space-y-2">
                  {templateForm.skills.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={s} onChange={e => updSkill(i, e.target.value)} placeholder={`Skill ${i+1} (e.g. Neatness)`}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      <button type="button" onClick={() => remSkill(i)} className="px-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">✕</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
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
              <h2 className="text-xl font-bold text-gray-800">Assign to Class</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Template <span className="text-red-500">*</span></label>
                <select required value={assignForm.template_id} onChange={e => setAssignForm({...assignForm, template_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Select Template --</option>
                  {templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Class <span className="text-red-500">*</span></label>
                <select required value={assignForm.class_id} onChange={e => setAssignForm({...assignForm, class_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Select Class --</option>
                  {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
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
    </AdminLayout>
  )
}
