import { useState, useEffect } from 'react'
import { Eye, TrendingUp, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import AdminLayout from '../../components/layout/AdminLayout'

export default function SuperSchools() {
  const { get, put } = useApi()
  const [schools, setSchools] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [editForm, setEditForm] = useState({ status: '', plan: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await get('/super?action=schools', { page, per_page: 20 })
      if (res.success) { setSchools(res.data?.schools || res.data || []); setTotal(res.data?.total || 0) }
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [page])

  const handleEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await put(`/super?action=school&id=${selected.id}`, editForm)
      if (res.success) { setSuccess('School updated.'); setModal(null); fetch() }
      else setError(res.message || 'Failed')
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const statusBadge = (s) => {
    const map = { active:'bg-green-100 text-green-700', suspended:'bg-red-100 text-red-700', pending:'bg-yellow-100 text-yellow-700' }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s]||map.active}`}>{s}</span>
  }
  const planBadge = (p) => {
    const map = { starter:'bg-gray-100 text-gray-600', pro:'bg-purple-100 text-purple-700', enterprise:'bg-blue-100 text-blue-700' }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[p]||map.starter}`}>{p}</span>
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Schools</h1>
          <p className="text-gray-500 text-sm">{total} registered schools</p>
        </div>

        {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">{success}</div>}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['School','Email','Plan','Status','Students','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? [...Array(5)].map((_,i)=><tr key={i}><td colSpan="6" className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td></tr>)
                : schools.length === 0 ? <tr><td colSpan="6" className="py-10 text-center text-gray-400">No schools found.</td></tr>
                : schools.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.email}</td>
                    <td className="px-4 py-3">{planBadge(s.plan)}</td>
                    <td className="px-4 py-3">{statusBadge(s.status)}</td>
                    <td className="px-4 py-3 text-gray-600">{s.student_count || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelected(s); setModal('view') }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><Eye size={15}/></button>
                        <button onClick={() => { setSelected(s); setEditForm({status:s.status, plan:s.plan}); setModal('edit') }} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"><TrendingUp size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selected.name}</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Email',selected.email],['Plan',selected.plan],['Status',selected.status],['Students',selected.student_count||0],['Teachers',selected.teacher_count||0],['Balance',`₦${(selected.wallet_balance||0).toLocaleString()}`],['Slug',selected.slug],['Created',new Date(selected.created_at).toLocaleDateString()]].map(([k,v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400">{k}</p><p className="font-semibold mt-0.5">{v}</p></div>
              ))}
            </div>
            <button onClick={() => setModal(null)} className="w-full mt-4 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700">Close</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Update {selected?.name}</h2>
              <button onClick={() => setModal(null)}><X size={24} className="text-gray-400"/></button>
            </div>
            {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Plan</label>
                <select value={editForm.plan} onChange={e => setEditForm({...editForm, plan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="starter">Starter (Free)</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 disabled:opacity-50">{saving ? 'Updating...' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
