import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const types = {
  success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle, iconColor: 'text-green-500' },
  error:   { bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-800',   icon: AlertCircle,  iconColor: 'text-red-500' },
  warning: { bg: 'bg-yellow-50',border: 'border-yellow-200',text: 'text-yellow-800',icon: AlertTriangle,iconColor: 'text-yellow-500' },
  info:    { bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-800',  icon: Info,         iconColor: 'text-blue-500' },
}

export default function Alert({ type = 'info', message, onClose, className = '' }) {
  if (!message) return null
  const t = types[type] || types.info
  const Icon = t.icon

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${t.bg} ${t.border} ${t.text} ${className} fade-in`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${t.iconColor}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
