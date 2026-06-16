import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Link2, Save } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import Modal from '../../components/common/Modal'
import Button from '../../components/forms/Button'
import Input from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import Alert from '../../components/common/Alert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function Cognitive() {
  const { get, post, loading } = useApi()
  const [templates, setTemplates] = useState([])
  const [ratings, setRatings] = useState([])
  const [classes, setClasses] = useState([])
  const [sessions, setSessions] = useState([])
  const [terms, setTerms] = useState([])
  const [cogResults, setCogResults] = useState([])
  const [tab, setTab] = useState('templates')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [templateModal, setTemplateModal] = useState(false)
  const [assignModal, setAssignModal] = useState(false)
  const [templateForm, setTemplateForm] = useState({ name:'', skills: [''] })
  const [assignForm, setAssignForm] = useState({ template_id:'', class_id:'' })
  const [resultsFilter, setResultsFilter] = useState({ class_id:'', term_id:'' })

  const fetch = useCallback(async () => {
    try {
      const [tr, rr, cr, sr] = await Promise.all([
        get('/cognitive?action=templates'),
        get('/cognitive?action=ratings'),
        get('/classes'),
        get('/sessions'),
      ])
      setTemplates(tr.templates || [])
      setRatings(rr.ratings || [])
      setClasses(cr.classes || [])
      setSessions(sr.sessions || [])
      setTerms(sr.sessions?.flatMap(s => s.terms?.map(t => ({ ...t, session_name: s.name })) || []) || [])
    } catch { setError('Failed to load data.') }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    if (tab === 'results' && resultsFilter.class_id && resultsFilter.term_id) {
      get('/cognitive?action=results', resultsFilter).then(r => setCogResults(r.results || [])).catch(() => {})
    }
  }, [tab, resultsFilter])

  const handleCreateTemplate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await post('/cognitive?action=templates', {
        name: templateForm.name,
        skills: templateForm.skills.filter(Boolean),
      })
      setSuccess('Template created.')
      setTemplateModal(false)
      fetch()
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await post('/cognitive?action=assign', assignForm)
      setSuccess('Template assigned.')
      setAssignModal(false)
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const addSkill    = () => setTemplateForm({ ...templateForm, skills: [...templateForm.skills, ''] })
  const updateSkill = (i, val) => { const s = [...templateForm.skills]; s[i] = val; setTemplateForm({...templateForm, skills: s}) }
  const removeSkill = (i) => setTemplateForm({...templateForm, skills: templateForm.skills.filter((_,idx)=>idx!==i)})

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Cognitive Assessment</h1>
          <p className="text-sm text-gray-500">Manage psychomotor and affective domain templates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setAssignModal(true)}><Link2 className="w-4 h-4" /> Assign Template</Button>
          <Button size="sm" onClick={() => { setTemplateForm({name:'',skills:['']}); setTemplateModal(true) }}><Plus className="w-4 h-4" /> New Template</Button>
        </div>
      </div>

      {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-xl w-fit">
        {[['templates','Templates'],['ratings','Rating Scales'],['results','Results']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===k?'bg-white text-[#FF6B00] shadow-sm':'text-gray-500 hover:text-gray-800'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : tab === 'templates' ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {templates.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-card p-16 text-center text-gray-400"><p className="font-medium">No templates. Create one to get started.</p></div>
          ) : templates.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="font-bold mb-3">{t.name}</h3>
              <div className="flex flex-wrap gap-2">
                {t.skills?.map((s,i) => (
                  <span key={i} className="bg-[#F5F5F5] text-gray-600 text-xs px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'ratings' ? (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {ratings.length === 0 ? (
            <div className="p-16 text-center text-gray-400"><p>No rating scales defined.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                  <tr><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Label</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Range</th></tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {ratings.map((r,i) => (
                    <tr key={i} className="hover:bg-[#F5F5F5]">
                      <td className="px-4 py-3 font-bold text-[#FF6B00]">{r.grade}</td>
                      <td className="px-4 py-3">{r.label}</td>
                      <td className="px-4 py-3 text-gray-500">{r.min} – {r.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Results tab */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Class" options={classes.map(c=>({value:c.id,label:c.name}))} value={resultsFilter.class_id} onChange={e=>setResultsFilter({...resultsFilter,class_id:e.target.value})} placeholder="Select Class" />
            <Select label="Term" options={terms.map(t=>({value:t.id,label:`${t.name} (${t.session_name})`}))} value={resultsFilter.term_id} onChange={e=>setResultsFilter({...resultsFilter,term_id:e.target.value})} placeholder="Select Term" />
          </div>
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {cogResults.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">Select a class and term to view cognitive results.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Skill</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {cogResults.map((r,i) => (
                      <tr key={i} className="hover:bg-[#F5F5F5]">
                        <td className="px-4 py-3 font-medium">{r.student_name}</td>
                        <td className="px-4 py-3 text-gray-600">{r.skill_name}</td>
                        <td className="px-4 py-3 font-bold text-[#FF6B00]">{r.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template Modal */}
      <Modal isOpen={templateModal} onClose={() => setTemplateModal(false)} title="Create Cognitive Template"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setTemplateModal(false)}>Cancel</Button><Button form="cog-form" type="submit" loading={submitting}>Create</Button></div>}
      >
        <form id="cog-form" onSubmit={handleCreateTemplate} className="space-y-4">
          <Input label="Template Name" required value={templateForm.name} onChange={e=>setTemplateForm({...templateForm,name:e.target.value})} placeholder="e.g. Psychomotor Assessment" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#333333]">Skills / Traits</label>
              <Button type="button" size="xs" variant="ghost" onClick={addSkill}><Plus className="w-3 h-3" /> Add Skill</Button>
            </div>
            <div className="space-y-2">
              {templateForm.skills.map((s,i) => (
                <div key={i} className="flex gap-2">
                  <Input value={s} onChange={e=>updateSkill(i,e.target.value)} placeholder={`Skill ${i+1} (e.g. Neatness)`} />
                  <button type="button" onClick={()=>removeSkill(i)} className="px-2 text-red-500 hover:bg-red-50 rounded-lg">✕</button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Template to Class" size="sm"
        footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setAssignModal(false)}>Cancel</Button><Button form="cog-assign-form" type="submit" loading={submitting}>Assign</Button></div>}
      >
        <form id="cog-assign-form" onSubmit={handleAssign} className="space-y-4">
          <Select label="Template" required options={templates.map(t=>({value:t.id,label:t.name}))} value={assignForm.template_id} onChange={e=>setAssignForm({...assignForm,template_id:e.target.value})} />
          <Select label="Class" required options={classes.map(c=>({value:c.id,label:c.name}))} value={assignForm.class_id} onChange={e=>setAssignForm({...assignForm,class_id:e.target.value})} />
        </form>
      </Modal>
    </div>
  )
}
