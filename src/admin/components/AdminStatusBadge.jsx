export function AdminStatusBadge({ status, label }) {
  if (!status && !label) return <span className="status-badge status-default">—</span>

  const val = String(status || label || '').toUpperCase()

  let type = 'default'
  let display = label || status

  if (val === 'PUBLISHED' || val === 'ACTIVE' || val === 'APPROVED' || val === 'TRUE' || val === 'ADMIN') {
    type = 'success'
    if (val === 'PUBLISHED') display = 'Đã xuất bản'
    if (val === 'ACTIVE') display = 'Hoạt động'
    if (val === 'APPROVED') display = 'Đã duyệt'
  } else if (val === 'DRAFT' || val === 'PENDING' || val === 'UNVERIFIED') {
    type = 'warning'
    if (val === 'DRAFT') display = 'Bản nháp'
    if (val === 'PENDING') display = 'Chờ duyệt'
  } else if (val === 'ARCHIVED' || val === 'REJECTED' || val === 'FALSE' || val === 'INACTIVE') {
    type = 'danger'
    if (val === 'ARCHIVED') display = 'Lưu trữ'
    if (val === 'REJECTED') display = 'Đã từ chối'
  } else if (val === 'BACKEND' || val === 'FULLSTACK' || val === 'AI_ENGINEER') {
    type = 'info'
  }

  return (
    <span className={`admin-status-badge status-${type}`}>
      <span className="status-dot" />
      <span>{display}</span>
    </span>
  )
}
