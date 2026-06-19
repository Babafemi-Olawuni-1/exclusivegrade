import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, school, token, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isAuthenticated = !!token
  const isAdmin = user?.role === 'school_admin'
  const isTeacher = user?.role === 'teacher'
  const isSuper = user?.role === 'super_admin'

  const dashLink = isSuper ? '/super' : isAdmin ? '/admin' : '/teacher'

  // Get school name and logo
  const schoolName = school?.name || 'ExclusiveGrades'
  const schoolLogo = school?.logo_url || '/logo.png'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0B1120]/95 backdrop-blur-md border-b border-white/5' : 'bg-[#0B1120] border-b border-white/5'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo and School Name */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center flex-shrink-0">
              <img src={schoolLogo} alt={schoolName} className="w-6 h-6 md:w-7 md:h-7 object-contain" />
            </div>
            <span className="text-lg md:text-xl font-bold text-white truncate max-w-[150px] md:max-w-[200px]">
              <span className="text-purple-400">{schoolName}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!isAuthenticated && (
              <>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Features
                </a>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Pricing
                </a>
                <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  How It Works
                </a>
              </>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-300 hidden lg:block">
                  {user?.first_name} {user?.last_name}
                </span>
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold text-sm">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </div>
                <Link
                  to={dashLink}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center gap-1"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                >
                  Register Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white p-2"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0B1120] border-t border-white/5 px-4 py-4 space-y-3">
          {!isAuthenticated && (
            <>
              <a href="#features" onClick={() => setOpen(false)} className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm py-2">
                Features
              </a>
              <a href="#pricing" onClick={() => setOpen(false)} className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm py-2">
                Pricing
              </a>
              <a href="#how-it-works" onClick={() => setOpen(false)} className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm py-2">
                How It Works
              </a>
            </>
          )}
          {isAuthenticated ? (
            <>
              <div className="text-gray-300 text-sm py-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold text-xs">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </div>
                {user?.first_name} {user?.last_name}
              </div>
              <Link
                to={dashLink}
                onClick={() => setOpen(false)}
                className="block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold text-center transition-all duration-300"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setOpen(false)
                }}
                className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm py-2 w-full text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm py-2"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold text-center transition-all duration-300"
              >
                Register Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}