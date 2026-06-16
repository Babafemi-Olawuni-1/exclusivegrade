import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, perPage }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E5]">
      <p className="text-sm text-gray-500">
        {totalItems ? `Showing ${(currentPage - 1) * perPage + 1}–${Math.min(currentPage * perPage, totalItems)} of ${totalItems}` : `Page ${currentPage} of ${totalPages}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {currentPage > delta + 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-lg text-sm hover:bg-[#F5F5F5]">1</button>
            {currentPage > delta + 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-[#FF6B00] text-white'
                : 'hover:bg-[#F5F5F5] text-gray-700'
            }`}
          >
            {p}
          </button>
        ))}
        {currentPage < totalPages - delta && (
          <>
            {currentPage < totalPages - delta - 1 && <span className="px-1 text-gray-400">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded-lg text-sm hover:bg-[#F5F5F5]">{totalPages}</button>
          </>
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
