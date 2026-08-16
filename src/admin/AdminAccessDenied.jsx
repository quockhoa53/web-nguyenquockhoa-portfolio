import { ShieldX, Wifi } from 'lucide-react'

export function AdminAccessDenied({ ip }) {
  return (
    <main className="admin-access-denied">
      <div className="access-denied-card">
        <span className="access-denied-icon"><ShieldX /></span>
        <small>ADMIN SECURITY</small>
        <h1>Không được phép truy cập</h1>
        <p>Thiết bị này không sử dụng địa chỉ IP Wi-Fi đã được cấp quyền quản trị.</p>
        <div className="access-ip"><Wifi /><span>IP hiện tại</span><strong>{ip || 'Không xác định'}</strong></div>
        <p className="access-help">Hãy kết nối đúng mạng Wi-Fi hoặc liên hệ quản trị viên để thêm IP này vào allowlist.</p>
        <a href="/">Quay về Portfolio</a>
      </div>
    </main>
  )
}
