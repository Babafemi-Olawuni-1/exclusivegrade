/** Format number as Nigerian Naira */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)

/** Format date to readable string */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Get grade letter from score */
export const getGrade = (score) => {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

/** Get color class for grade */
export const gradeColor = (score) => {
  if (score >= 70) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

/** Truncate text */
export const truncate = (str, n = 50) =>
  str && str.length > n ? str.slice(0, n) + '...' : str

/** Capitalize first letter */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

/** Download a blob as file */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

/** Generate initials from name */
export const initials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

/** Sleep helper */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
