import { FolderKanban, Home, MessageSquare, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NotFound3DScene } from '../components/common/NotFound3DScene'

export function NotFoundPage() {
  return (
    <main className="not-found-page-wrapper">
      <div className="not-found-orb not-found-orb-1" />
      <div className="not-found-orb not-found-orb-2" />

      <div className="content-shell not-found-container">
        {/* Interactive 3D Character Assembly Stage */}
        <div className="not-found-visual-stage reveal">
          <NotFound3DScene />
        </div>

        {/* 404 Text & Navigation Options */}
        <div className="not-found-content reveal">
          <span className="not-found-eyebrow">
            <Sparkles size={13} />
            <span>ERROR 404 · PAGE NOT FOUND</span>
          </span>

          <h1 className="not-found-title font-display">
            Trang này đang được gắn lại!
          </h1>

          <p className="not-found-desc">
            Liên kết bạn truy cập có thể đã bị di chuyển hoặc tạm thời không tồn tại.
            Nhân vật kỹ sư của chúng tôi đang tích cực sửa chữa và lắp ráp lại các module dữ liệu.
          </p>

          <div className="not-found-actions">
            <Link to="/" className="btn primary">
              <Home size={16} /> Về trang chủ
            </Link>
            <Link to="/projects" className="btn secondary">
              <FolderKanban size={16} /> Xem dự án
            </Link>
            <Link to="/contact" className="btn ghost">
              <MessageSquare size={16} /> Báo cáo sự cố
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
