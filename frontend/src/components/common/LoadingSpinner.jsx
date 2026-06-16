export default function LoadingSpinner({ size = 'md', color = 'orange', fullPage = false }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' }
  const colors = {
    orange: 'border-[#FF6B00]',
    white: 'border-white',
    gray: 'border-gray-400',
  }

  const spinner = (
    <div
      className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full spinner`}
    />
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}
