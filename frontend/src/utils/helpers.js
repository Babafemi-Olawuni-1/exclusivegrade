export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const generatePin = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const downloadCSV = (data, filename = 'download.csv') => {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map((row) =>
      Object.values(row)
        .map((value) => {
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`
          }
          return value
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n')
        const headers = lines[0].split(',').map((h) => h.trim())
        const data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim())
          const row = {}
          headers.forEach((header, index) => {
            row[header] = values[index]
          })
          return row
        })
        resolve(data.filter((row) => Object.values(row).some((v) => v)))
      } catch (error) {
        reject(error)
      }
    }
    reader.readAsText(file)
  })
}

export const exportToExcel = (data, filename = 'export.xlsx') => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, filename)
}

export const generatePDF = async (content, filename = 'document.pdf') => {
  // This would typically use a library like jsPDF
  // For now, we'll use the browser's print functionality
  const printWindow = window.open('', '', 'height=400,width=800')
  printWindow.document.write(content)
  printWindow.document.close()
  printWindow.print()
}

export const getGradeColor = (grade) => {
  const gradeMap = {
    A: 'bg-green-100 text-green-800',
    B: 'bg-blue-100 text-blue-800',
    C: 'bg-yellow-100 text-yellow-800',
    D: 'bg-orange-100 text-orange-800',
    E: 'bg-red-100 text-red-800',
    F: 'bg-red-200 text-red-900',
  }
  return gradeMap[grade] || 'bg-gray-100 text-gray-800'
}

export const getStatusColor = (status) => {
  const statusMap = {
    active: 'badge-success',
    inactive: 'badge-error',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
  }
  return statusMap[status] || 'badge-info'
}

export const truncateText = (text, length = 50) => {
  return text && text.length > length ? text.substring(0, length) + '...' : text
}

export const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export const calculateGPA = (grades) => {
  const gradeValues = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, E: 0.5, F: 0.0 }
  const sum = grades.reduce((acc, grade) => acc + (gradeValues[grade] || 0), 0)
  return (sum / grades.length).toFixed(2)
}
