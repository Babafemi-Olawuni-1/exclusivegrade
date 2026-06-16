import LoadingSpinner from '../common/LoadingSpinner'

const variants = {
  primary:   'bg-[#FF6B00] text-white hover:bg-orange-700 disabled:bg-orange-300',
  secondary: 'bg-white text-[#FF6B00] border-2 border-[#FF6B00] hover:bg-orange-50 disabled:opacity-50',
  danger:    'bg-[#EF4444] text-white hover:bg-red-600 disabled:bg-red-300',
  ghost:     'bg-transparent text-[#333333] hover:bg-[#F5F5F5] disabled:opacity-50',
  success:   'bg-[#10B981] text-white hover:bg-emerald-600 disabled:bg-emerald-300',
  dark:      'bg-[#1A1A1A] text-white hover:bg-[#333333] disabled:opacity-50',
}

const sizes = {
  xs:  'px-2.5 py-1 text-xs',
  sm:  'px-3 py-1.5 text-sm',
  md:  'px-4 py-2.5 text-sm',
  lg:  'px-6 py-3 text-base',
  xl:  'px-8 py-4 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-lg transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/40
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" color={variant === 'primary' || variant === 'danger' ? 'white' : 'orange'} />}
      {children}
    </button>
  )
}
