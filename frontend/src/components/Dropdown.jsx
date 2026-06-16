import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Dropdown({ label, children, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center px-4 py-2 text-gray-700 hover:text-gray-900"
      >
        {label}
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg bg-white card-shadow-lg">
            {children}
          </div>
        </>
      )}
    </div>
  )
}
