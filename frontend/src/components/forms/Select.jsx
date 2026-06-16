import { ChevronDown } from 'lucide-react'

export default function Select({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Select...',
  className = '',
  containerClass = '',
  required,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${containerClass}`}>
      {label && (
        <label className="text-sm font-medium text-[#333333]">
          {label}
          {required && <span className="text-[#EF4444] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full px-3 py-2.5 rounded-lg border text-sm font-sans appearance-none
            bg-white text-[#1A1A1A]
            transition-colors outline-none
            focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]
            disabled:bg-[#F5F5F5] disabled:cursor-not-allowed
            ${error ? 'border-[#EF4444]' : 'border-[#E5E5E5]'}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) =>
            typeof opt === 'string' ? (
              <option key={opt} value={opt}>{opt}</option>
            ) : (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            )
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
