import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export default function Alert({ type = 'info', title, message, onClose, dismissible = true }) {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const Icon = icons[type]

  return (
    <div className={`rounded-lg border-l-4 border-current p-4 ${typeClasses[type]} fade-in`}>
      <div className="flex">
        <Icon className="h-6 w-6 flex-shrink-0" />
        <div className="ml-3">
          {title && <h3 className="font-semibold">{title}</h3>}
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
        {dismissible && (
          <button
            onClick={onClose}
            className="ml-auto text-current opacity-50 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
