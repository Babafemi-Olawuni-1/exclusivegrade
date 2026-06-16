import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '../common/Logo'
import Button from '../forms/Button'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isAdmin, isTeacher, isSuper } = useAuth()

  const dashLink = isSuper ? '/super' : isAdmin ? '/admin' : '/teacher'

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/">
            <Logo size="sm" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-[#FF6B00] transition-colors">How It Works</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={dashLink}>
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started Free</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-[#F5F5F5]"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#E5E5E5] bg-white px-4 py-4 space-y-3">
          <a href="#features" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700 py-2">Features</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700 py-2">Pricing</a>
          <a href="#how-it-works" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700 py-2">How It Works</a>
          <div className="pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link to={dashLink} onClick={() => setOpen(false)}>
                <Button fullWidth>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" fullWidth>Log In</Button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <Button fullWidth>Get Started Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
