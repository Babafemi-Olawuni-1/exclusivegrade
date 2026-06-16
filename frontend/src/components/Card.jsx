export default function Card({ children, className = '', noPadding = false }) {
  return (
    <div className={`rounded-lg bg-white card-shadow ${!noPadding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}
