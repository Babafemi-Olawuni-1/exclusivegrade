import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, User, Settings, Home } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import Button from '../../components/Button'
import Dropdown from '../../components/Dropdown'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isSuper = user?.role === 'super_admin'

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const menuItems = [
    { label: 'Dashboard', href: isSuper ? '/super' : '/admin', icon: Home },
    { label: 'Students', href: isSuper ? '/super/students' : '/admin/students' },
    { label: 'Teachers', href: isSuper ? '/super/teachers' : '/admin/teachers' },
    { label: 'Results', href: isSuper ? '/super/results' : '/admin/results' },
    { label: 'Wallet', href: isSuper ? '/super/wallet' : '/admin/wallet' },
    { label: 'PINs', href: isSuper ? '/super/pins' : '/admin/pins' },
    { label: 'Announcements', href: isSuper ? '/super/announcements' : '/admin/announcements' },
    { label: 'Analytics', href: isSuper ? '/super/analytics' : '/admin/analytics' },
    { label: 'Settings', href: isSuper ? '/super/settings' : '/admin/settings' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white p-4
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-xl font-bold">
            ExclusiveGrades
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <item.icon className="inline-block h-5 w-5 mr-2" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <Dropdown label={user?.first_name || user?.email}>
                <Link
                  to={isSuper ? '/super/profile' : '/admin/profile'}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <User className="inline-block h-4 w-4 mr-2" />
                  Profile
                </Link>
                <Link
                  to={isSuper ? '/super/settings' : '/admin/settings'}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="inline-block h-4 w-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="inline-block h-4 w-4 mr-2" />
                  Logout
                </button>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
