import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/layout/AdminLayout'
import {
  Users, UserCog, BookOpen, Key, Wallet, FileText,
  Globe, ExternalLink, Copy, CheckCircle, Clock,
  UserPlus, CreditCard, FileCheck, TrendingUp, Plus
} from 'lucide-react'

function StatCard({ title, value, icon: Icon, color, href }) {
  const colors = {
    purple: { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-700' },
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-100',   icon: 'bg-blue-100 text-blue-600',     text: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  border: 'border-green-100',  icon: 'bg-green-100 text-green-600',   text: 'text-green-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-100', icon: 'bg-orange-100 text-orange-600', text: 'text-orange-700' },
    pink:   { bg: 'bg-pink-50',   border: 'border-pink-100',   icon: 'bg-pink-100 text-pink-600',     text: 'text-pink-700' },
    teal:   { bg: 'bg-teal-50',   border: 'border-teal-100',   icon: 'bg-teal-100 text-teal-600',     text: 'text-teal-700' },
  }
  const c = colors[color] || colors.purple
  const card = (
    <div className={`bg-white border ${c.border} rounded-2xl p-4 md:p-5 shadow-card hover:shadow-card-md transition-all duration-200 group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{value ?? 0}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${c.icon} group-hover:scale-110 transition-transform duration-200`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
  return href ? <Link to={href}>{card}</Link> : card
}

export default function Dashboard() {
  const { get } = useApi()
  const { user, school } = useAuth()
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, pins: 0, wallet: 0, results: 0 })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [stuRes, tchRes, clsRes, pinRes, walRes, resRes] = await Promise.allSettled([
        get('/students', { per_page: 5 }),
        get('/teachers'),
        get('/classes'),
        get('/pins', { per_page: 5 }),
        get('/wallet'),
        get('/results', { per_page: 5 }),
      ])

      const stu  = stuRes.status  === 'fulfilled' ? stuRes.value  : null
      const tch  = tchRes.status  === 'fulfilled' ? tchRes.value  : null
      const cls  = clsRes.status  === 'fulfilled' ? clsRes.value  : null
      const pin  = pinRes.status  === 'fulfilled' ? pinRes.value  : null
      const wal  = walRes.status  === 'fulfilled' ? walRes.value  : null
      const res  = resRes.status  === 'fulfilled' ? resRes.value  : null

      setStats({
        students: stu?.data?.total || 0,
        teachers: tch?.data?.total || (Array.isArray(tch?.data) ? tch.data.length : 0),
        classes:  Array.isArray(cls?.data) ? cls.data.length : 0,
        pins:     Array.isArray(pin?.data) ? pin.data.length : 0,
        wallet:   wal?.data?.balance || 0,
        results:  Array.isArray(res?.data) ? res.data.length : 0,
      })

      // Build activity feed
      const acts = []
      const stuItems = stu?.data?.items || []
      const pinItems = Array.isArray(pin?.data) ? pin.data : []
      const txItems  = wal?.data?.transactions?.slice(0, 3) || []
      const resItems = Array.isArray(res?.data) ? res.data.slice(0, 3) : []

      stuItems.forEach(s => acts.push({
        id: `stu-${s.id}`, icon: UserPlus, color: 'blue',
        action: `Added student: ${s.first_name} ${s.surname || s.last_name || ''}`,
        time: s.created_at,
      }))
      pinItems.forEach(p => acts.push({
        id: `pin-${p.id}`, icon: Key, color: 'orange',
        action: `Generated PIN for ${p.first_name || 'student'}`,
        time: p.created_at,
      }))
      txItems.forEach(tx => acts.push({
        id: `tx-${tx.id}`, icon: CreditCard, color: 'green',
        action: `Wallet: ${tx.type === 'topup' ? 'funded' : tx.type} ₦${parseFloat(tx.amount || 0).toLocaleString()}`,
        time: tx.created_at,
      }))
      resItems.forEach(r => acts.push({
        id: `res-${r.id}`, icon: FileCheck, color: 'teal',
        action: `Result for ${r.first_name || 'student'} (${r.status})`,
        time: r.created_at,
      }))

      acts.sort((a, b) => new Date(b.time) - new Date(a.time))
      setRecentActivity(acts.slice(0, 8))
    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally {
      setLoading(false)
    }
  }

  const timeAgo = (d) => {
    if (!d) return 'Just now'
    const diff = Date.now() - new Date(d)
    const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), day = Math.floor(diff / 86400000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    if (h < 24) return `${h}h ago`
    if (day < 7) return `${day}d ago`
    return new Date(d).toLocaleDateString()
  }

  const actColor = { blue: 'bg-blue-100 text-blue-600', orange: 'bg-orange-100 text-orange-600', green: 'bg-green-100 text-green-600', teal: 'bg-teal-100 text-teal-600' }
  const schoolUrl = school?.slug ? `${window.location.origin}/s/${school.slug}` : '#'

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-5 md:p-6 text-white shadow-card-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                Welcome back, {user?.first_name || 'Admin'}! 👋
              </h1>
              <p className="text-purple-200 text-sm mt-0.5">{school?.name || 'Your School'} — Dashboard</p>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/students" className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <Plus size={13} /> Add Student
              </Link>
              <Link to="/admin/pins" className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <Key size={13} /> Generate PIN
              </Link>
            </div>
          </div>
        </div>

        {/* School URL card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600"><Globe size={16} /></div>
              <div>
                <p className="text-xs text-gray-400">Your school landing page</p>
                <div className="flex items-center gap-1.5">
                  <a href={schoolUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-700 hover:text-purple-600 truncate max-w-[240px] transition-colors">
                    {schoolUrl}
                  </a>
                  <button onClick={() => { navigator.clipboard.writeText(schoolUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    className="p-1 rounded text-gray-400 hover:text-purple-600 transition-colors">
                    {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                  <a href={schoolUrl} target="_blank" rel="noopener noreferrer"
                    className="p-1 rounded text-gray-400 hover:text-purple-600 transition-colors">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 w-fit">Live</span>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            <StatCard title="Students"  value={stats.students} icon={Users}   color="purple" href="/admin/students" />
            <StatCard title="Teachers"  value={stats.teachers} icon={UserCog} color="blue"   href="/admin/teachers" />
            <StatCard title="Classes"   value={stats.classes}  icon={BookOpen}color="green"  href="/admin/classes" />
            <StatCard title="PINs"      value={stats.pins}     icon={Key}     color="orange" href="/admin/pins" />
            <StatCard title="Wallet"    value={`₦${(stats.wallet||0).toLocaleString()}`} icon={Wallet} color="pink" href="/admin/wallet" />
            <StatCard title="Results"   value={stats.results}  icon={FileText}color="teal"   href="/admin/results" />
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Student',    href: '/admin/students',  icon: UserPlus,   bg: 'bg-purple-600 hover:bg-purple-700' },
            { label: 'Add Teacher',    href: '/admin/teachers',  icon: UserCog,    bg: 'bg-blue-600 hover:bg-blue-700' },
            { label: 'Generate PINs',  href: '/admin/pins',      icon: Key,        bg: 'bg-orange-500 hover:bg-orange-600' },
            { label: 'View Results',   href: '/admin/results',   icon: TrendingUp, bg: 'bg-teal-600 hover:bg-teal-700' },
          ].map(({ label, href, icon: Icon, bg }) => (
            <Link key={label} to={href}
              className={`${bg} text-white rounded-xl p-3 flex flex-col items-center gap-1.5 text-center transition-colors shadow-sm`}>
              <Icon size={20} />
              <span className="text-xs font-semibold">{label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-card">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">Recent Activity</h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No activity yet. Add students or generate PINs to see activity here.
            </div>
          ) : (
            <div className="p-3 space-y-1.5">
              {recentActivity.map((act) => (
                <div key={act.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`p-1.5 rounded-lg ${actColor[act.color] || 'bg-purple-100 text-purple-600'}`}>
                    <act.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{act.action}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                    <Clock size={11} /> {timeAgo(act.time)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}
