import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative z-20 bg-[#0B1120] border-t border-white/5 py-12 w-full">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                <img src="/logo.png" alt="ExclusiveGrades" className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold text-white">
                Exclusive<span className="text-purple-400">Grades</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              The all-in-one platform for modern schools—manage results, generate secure PINs, create student ID cards, and empower teachers from one simple dashboard.
            </p>
            <p className="text-purple-400 text-sm mt-2 font-medium">
              Built for Nigerian schools. Designed for the future.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">Pricing</a></li>
              <li><Link to="/register" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">Register School</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">Help Center</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-purple-400 transition-colors duration-200">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <Mail size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <span>support@exclusivegrades.com</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Phone size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <span>+234 800 000 0000</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 ExclusiveGrades. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Built for Nigerian schools. Designed for the future.
          </p>
        </div>
      </div>
    </footer>
  )
}