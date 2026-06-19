import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCog, BookOpen, FileText, 
  Key, Wallet, CreditCard, Settings, LogOut, Menu, X,
  GraduationCap, ClipboardCheck, Calendar, Bot, FileQuestion
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Students', icon: Users, path: '/admin/students' },
    { name: 'Teachers', icon: UserCog, path: '/admin/teachers' },
    { name: 'Classes', icon: BookOpen, path: '/admin/classes' },
    { name: 'Subjects', icon: GraduationCap, path: '/admin/subjects' },
    { name: 'Results', icon: FileText, path: '/admin/results' },
    { name: 'Result Templates', icon: ClipboardCheck, path: '/admin/result-templates' },
    { name: 'Cognitive', icon: Bot, path: '/admin/cognitive' },
    { name: 'Attendance', icon: Calendar, path: '/admin/attendance' },
    { name: 'Sessions', icon: Calendar, path: '/admin/sessions' },
    { name: 'Pins', icon: Key, path: '/admin/pins' },
    { name: 'Wallet', icon: Wallet, path: '/admin/wallet' },
    { name: 'ID Cards', icon: CreditCard, path: '/admin/id-cards' },
    { name: 'Lesson Notes', icon: FileQuestion, path: '/admin/lesson-notes' },
    { name: 'CBT', icon: FileQuestion, path: '/admin/cbt' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ]

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true
    if (path !== '/admin' && location.pathname.startsWith(path)) return true
    return false
  }

  const currentPage = navItems.find(item => isActive(item.path))?.name || 'Dashboard'

  const bottomNavItems = [
    { name: 'Home', icon: LayoutDashboard, path: '/admin' },
    { name: 'Students', icon: Users, path: '/admin/students' },
    { name: 'Results', icon: FileText, path: '/admin/results' },
    { name: 'Pins', icon: Key, path: '/admin/pins' },
    { name: 'More', icon: Menu, path: '#' },
  ]

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 shadow-sm h-screen sticky top-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          {/* ALWAYS SHOWS EXCLUSIVEGRADES - NOT SCHOOL NAME */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
              <img src="/logo.png" alt="ExclusiveGrades" className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold text-gray-800">
              Exclusive<span className="text-purple-400">Grades</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          {/* ALWAYS SHOWS EXCLUSIVEGRADES - NOT SCHOOL NAME */}
          <div className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
              <img src="/logo.png" alt="ExclusiveGrades" className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold text-gray-800">
              Exclusive<span className="text-purple-400">Grades</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-600 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          ))}
          <button
            onClick={() => {
              handleLogout()
              setSidebarOpen(false)
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all duration-200 mt-1"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-screen pb-20 md:pb-6">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg transition-colors text-gray-800 hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg font-semibold md:hidden text-gray-800">
                {currentPage}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm hidden sm:block text-gray-700 font-medium">
                {user?.first_name} {user?.last_name}
              </span>
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold text-sm">
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-around py-1">
            {bottomNavItems.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                    active
                      ? 'text-purple-400'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <div className={`relative ${active ? 'scale-110' : ''}`}>
                    <item.icon size={22} className={active ? 'text-purple-400' : ''} />
                    {active && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-purple-400' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}