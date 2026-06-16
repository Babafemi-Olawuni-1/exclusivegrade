export default function Input({
  label,
  error,
  hint,
  icon: Icon,
  iconRight: IconRight,
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
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={`
            w-full px-3 py-2.5 rounded-lg border text-sm font-sans
            bg-white text-[#1A1A1A] placeholder-gray-400
            transition-colors outline-none
            focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]
            disabled:bg-[#F5F5F5] disabled:cursor-not-allowed
            ${Icon ? 'pl-9' : ''}
            ${IconRight ? 'pr-9' : ''}
            ${error ? 'border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]' : 'border-[#E5E5E5]'}
            ${className}
          `}
          {...props}
        />
        {IconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconRight className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
