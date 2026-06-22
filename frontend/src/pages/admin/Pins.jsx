import { useState, useEffect } from 'react'
import { Key, Plus, Trash2, X, Download } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function Pins() {
  const { get, post, del } = useApi()
  const [pins, setPins] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lastGenerated, setLastGenerated] = useState(null)

  const [singleForm, setSingleForm] = useState({ student_id: '', usage_limit: 3, expiry_days: 365 })
  const [bulkForm, setBulkForm]   = useState({ class_id: '', usage_limit: 3, expiry_days: 365 })

  const fetch = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterStatus) params.status = filterStatus
      const res = await get('/pins', params)
      setPins(res?.data || [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [filterStatus])
  useEffect(() => {
    Promise.allSettled([get('/students', {per_page:200}), get('/classes')]).then(([s,c]) => {
      setStudents(s.value?.data?.items || [])
      setClasses(c.value?.data || [])
    })
  }, [])

  const handleSingle = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await post('/pins?action=single', singleForm)
      setLastGenerated(res?.data || res)
      setSuccess(`PIN generated: ${res?.data?.pin_code || res?.pin_code}`)
      setModal('show-pin'); fetch()
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleBulk = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await post('/pins?action=bulk', bulkForm)
      const d = res?.data || res
      setSuccess(`${d?.total || 'Multiple'} PINs generated. Cost: ₦${(d?.total_cost||0).toLocaleString()}`)
      setModal(null); fetch()
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this PIN?')) return
    try {
      await del(`/pins?id=${id}`)
      setSuccess('PIN deactivated.'); fetch()
    } catch(err) { alert(err.message) }
  }

  const exportPins = () => {
    const rows = pins.map(p => [p.pin_code, `${p.first_name} ${p.last_name}`, p.admission_number, p.status, p.usage_count, p.usage_limit, p.expires_at].join(','))
    const csv = ['PIN,Student,Admission,Status,Used,Limit,Expires', ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = 'pins.csv'
    a.click()
  }

  const statusBadge = (status) => {
    const map = { unused:'bg-green-100 text-green-700', partially_used:'bg-blue-100 text-blue-700', used:'bg-gray-100 text-gray-600', expired:'bg-red-100 text-red-700' }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || map.unused}`}>{status?.replace('_',' ')}</span>
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">PIN Management</h1>
            <p className="text-gray-500 text-sm">{pins.length} PINs generated</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={exportPins} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm flex items-center gap-2"><Download size={16}/> Export</button>
            <button onClick={() => { setBulkForm({class_id:'',usage_limit:3,expiry_days:365}); setModal('bulk') }} className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm flex items-center gap-2"><Plus size={16}/> Bulk Generate</button>
            <button onClick={() => { setSingleForm({student_id:'',usage_limit:3,expiry_days:365}); setModal('single') }} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm flex items-center gap-2"><Key size={16}/> Single PIN</button>
          </div>
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}
        {error   && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        {/* Filter */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 w-48">
          <option value="">All Statuses</option>
          <option value="unused">Unused</option>
          <option value="partially_used">Partially Used</option>
          <option value="used">Used</option>
          <option value="expired">Expired</option>
        </select>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['PIN Code','Student','Admission','Usage','Status','Expires','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? [...Array(5)].map((_,i)=><tr key={i}><td colSpan="7" className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td></tr>)
                : pins.length === 0 ? <tr><td colSpan="7" className="py-10 text-center text-gray-400">No PINs found. Generate your first PIN.</td></tr>
                : pins.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-purple-700">{p.pin_code}</td>
                    <td className="px-4 py-3 text-gray-800">{p.first_name} {p.last_name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.admission_number}</td>
                    <td className="px-4 py-3 text-gray-600">{p.usage_count}/{p.usage_limit}</td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      {p.status === 'unused' || p.status === 'partially_used' ? (
                        <button onClick={() => handleDeactivate(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Single PIN Modal */}
      {modal === 'single' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Generate Single PIN</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleSingle} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Student <span className="text-red-500">*</span></label>
                <select required value={singleForm.student_id} onChange={e => setSingleForm({...singleForm, student_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.surname || s.last_name} ({s.admission_number})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Usage Limit</label>
                  <input type="number" min="1" value={singleForm.usage_limit} onChange={e => setSingleForm({...singleForm, usage_limit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry (days)</label>
                  <input type="number" min="1" value={singleForm.expiry_days} onChange={e => setSingleForm({...singleForm, expiry_days: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Generating...' : 'Generate PIN'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Modal */}
      {modal === 'bulk' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Bulk Generate PINs</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleBulk} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Class <span className="text-red-500">*</span></label>
                <select required value={bulkForm.class_id} onChange={e => setBulkForm({...bulkForm, class_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Select Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Usage Limit</label>
                  <input type="number" min="1" value={bulkForm.usage_limit} onChange={e => setBulkForm({...bulkForm, usage_limit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry (days)</label>
                  <input type="number" min="1" value={bulkForm.expiry_days} onChange={e => setBulkForm({...bulkForm, expiry_days: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                One PIN per student in the selected class. Cost deducted from wallet automatically.
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 disabled:opacity-50">{saving ? 'Generating...' : 'Generate PINs'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show generated PIN */}
      {modal === 'show-pin' && lastGenerated && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <Key size={40} className="text-purple-600 mx-auto mb-3"/>
            <h2 className="text-xl font-bold text-gray-800 mb-2">PIN Generated!</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-400 mb-1">PIN Code</p>
              <p className="text-2xl font-mono font-bold text-purple-700 tracking-widest">{lastGenerated.pin_code}</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">For: {lastGenerated.student_name || lastGenerated.first_name}</p>
            <button onClick={() => setModal(null)} className="w-full py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm">Done</button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
