import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, FileText,
  BarChart2, Calendar, CreditCard, Key, Wallet,
  BookOpen as NoteIcon, Monitor, Settings, LogOut, Menu, X,
  Bell, ChevronDown, Building2, DollarSign, School, BadgeInfo,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '../common/Logo'
import { initials } from '../../utils/helpers'

const adminNav = [
  { label: 'Dashboard',       href: '/admin',              icon: LayoutDashboard },
  { label: 'Students',        href: '/admin/students',     icon: Users },
  { label: 'Teachers',        href: '/admin/teachers',     icon: GraduationCap },
  { label: 'Classes',         href: '/admin/classes',      icon: School },
  { label: 'Subjects',        href: '/admin/subjects',     icon: BookOpen },
  { label: 'Result Templates',href: '/admin/result-templates', icon: FileText },
  { label: 'Results',         href: '/admin/results',      icon: BarChart2 },
  { label: 'Cognitive',       href: '/admin/cognitive',    icon: Monitor },
  { label: 'Attendance',      href: '/admin/attendance',   icon: Calendar },
  { label: 'Sessions',        href: '/admin/sessions',     icon: Calendar },
  { label: 'Pins',            href: '/admin/pins',         icon: Key },
  { label: 'Wallet',          href: '/admin/wallet',       icon: Wallet },
  { label: 'ID Cards',        href: '/admin/id-cards',     icon: BadgeInfo },
  { label: 'Lesson Notes',    href: '/admin/lesson-notes', icon: NoteIcon },
  { label: 'CBT',             href: '/admin/cbt',          icon: CreditCard },
  { label: 'Settings',        href: '/admin/settings',     icon: Settings },
]

const superNav = [
  { label: 'Dashboard', href: '/super',          icon: LayoutDashboard },
  { label: 'Schools',   href: '/super/schools',  icon: Building2 },
  { label: 'Payments',  href: '/super/payments', icon: DollarSign },
  { label: 'Revenue',   href: '/super/revenue',  icon: BarChart2 },
  { label: 'Settings',  href: '/super/settings', icon: Settings },
]

const teacherNav = [
  { label: 'Dashboard',      href: '/teacher',               icon: LayoutDashboard },
  { label: 'Upload Results', href: '/teacher/results-upload',icon: BarChart2 },
  { label: 'Lesson Notes',   href: '/teacher/lesson-notes',  icon: NoteIcon },
  { label: 'Profile',        href: '/teacher/profile',       icon: Settings },
]

function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon
  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
        ${isActive
          ? 'bg-[#FF6B00] text-white shadow-sm'
          : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

export default function AdminLayout({ children }) {
  const { user, school, logout, isSuper, isTeacher } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const nav = isSuper ? superNav : isTeacher ? teacherNav : adminNav

  const handleLogout = async () => {
    logout()
    navigate('/login')
  }

  const userName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || user.username
    : 'User'

  const roleLabel = isSuper ? 'Super Admin' : isTeacher ? 'Teacher' : 'Admin'

  return (
    <div className="flex h-screen bg-[#F5F5F5] font-sora overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-[#1A1A1A] flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <Logo size="sm" showName light />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* School name */}
        {school && !isSuper && (
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">School</p>
            <p className="text-sm text-white font-semibold truncate mt-0.5">{school.name}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {nav.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={location.pathname === item.href || (item.href !== '/admin' && item.href !== '/super' && item.href !== '/teacher' && location.pathname.startsWith(item.href))}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#F5F5F5] text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-[#F5F5F5] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-sm font-bold">
                {initials(userName)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">{userName}</p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card-lg border border-[#E5E5E5] z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E5E5E5]">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{userName}</p>
                    <p className="text-xs text-gray-500">{roleLabel}</p>
                  </div>
                  <Link
                    to={isTeacher ? '/teacher/profile' : isSuper ? '/super/settings' : '/admin/settings'}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F5F5F5] transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 w-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
