import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export function AdminPagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (totalItems === 0) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      let start = Math.max(1, currentPage - 2)
      let end = Math.min(totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    return pages
  }

  return (
    <div className="admin-pagination-bar">
      <div className="admin-pagination-info">
        <span>
          Hiển thị <b>{startItem}</b>–<b>{endItem}</b> trong tổng số <b>{totalItems}</b> bản ghi
        </span>

        {pageSizeOptions && (
          <div className="admin-page-size-picker">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination-nav">
          <button
            type="button"
            className="pag-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            title="Trang đầu"
          >
            <ChevronsLeft size={15} />
          </button>
          <button
            type="button"
            className="pag-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            title="Trang trước"
          >
            <ChevronLeft size={15} />
          </button>

          <div className="pag-numbers">
            {getPageNumbers().map((p) => (
              <button
                key={p}
                type="button"
                className={`pag-num ${p === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="pag-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            title="Trang sau"
          >
            <ChevronRight size={15} />
          </button>
          <button
            type="button"
            className="pag-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            title="Trang cuối"
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
