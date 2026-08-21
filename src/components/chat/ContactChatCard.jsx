import { memo } from 'react'
import { Mail, MessageSquare, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export const ContactChatCard = memo(function ContactChatCard({ onNavigate }) {
  return (
    <div className="chat-generative-card chat-contact-card">
      <div className="chat-card-header">
        <div className="chat-card-badge-row">
          <span className="chat-card-type-badge contact-badge">
            <Mail size={12} /> KẾT NỐI
          </span>
          <span className="chat-card-featured-badge">
            <Sparkles size={11} /> Sẵn sàng nhận dự án
          </span>
        </div>
        <h4 className="chat-card-title">Liên hệ & Trao đổi hợp tác với Khoa</h4>
      </div>

      <p className="chat-card-desc">
        Bạn có thể gửi tin nhắn trực tiếp qua form liên hệ hoặc gửi email để trao đổi về cơ hội việc làm và dự án.
      </p>

      <div className="chat-card-actions">
        <Link
          to="/contact"
          className="chat-card-btn btn-primary"
          onClick={() => onNavigate && onNavigate()}
        >
          <MessageSquare size={14} />
          <span>Mở Form Liên Hệ</span>
          <ArrowRight size={14} />
        </Link>
        <a
          href="mailto:nguyenquockhoa5549@gmail.com"
          className="chat-card-btn btn-secondary"
        >
          <Mail size={13} />
          <span>Gửi Email Trực Tiếp</span>
        </a>
      </div>
    </div>
  )
})
