import { APP_NAME } from '../../config'

export default function Logo({ size = 'md', showName = true, light = false }) {
  const sizes = { sm: 40, md: 48, lg: 60, xl: 72 }
  const d = sizes[size] || 48

  return (
    <div className="flex items-center gap-2.5">
      {/* Round white bg behind logo */}
      <div
        className="flex-shrink-0 rounded-full bg-white flex items-center justify-center"
        style={{
          width: d,
          height: d,
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        }}
      >
        <img
          src="/logo.png"
          alt={APP_NAME}
          style={{ width: d * 0.72, height: d * 0.72, objectFit: 'contain' }}
        />
      </div>
      {showName && (
        <span
          className={`font-bold tracking-tight ${light ? 'text-white' : 'text-[#1A1A1A]'}`}
          style={{ fontSize: d * 0.38 }}
        >
          {APP_NAME}
        </span>
      )}
    </div>
  )
}
