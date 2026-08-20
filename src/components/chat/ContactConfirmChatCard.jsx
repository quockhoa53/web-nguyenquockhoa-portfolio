import { useState } from 'react'
import { Send, CheckCircle2, X, AlertCircle, Loader2, Mail, User, Tag, MessageSquare, Edit3 } from 'lucide-react'
import { sendContact } from '../../services/portfolioApi'

export function ContactConfirmChatCard({ data = {} }) {
  const [formData, setFormData] = useState({
    name: data.name || 'Nhà tuyển dụng / Khách quý',
    email: data.email || '',
    subject: data.subject || 'Lời mời hợp tác / Phỏng vấn qua AI Chatbot',
    message: data.message || ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập họ và tên của bạn')
      return
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ để anh Khoa phản hồi')
      return
    }
    if (!formData.message.trim()) {
      setError('Vui lòng nhập nội dung lời nhắn')
      return
    }

    setLoading(true)
    setError('')
    try {
      await sendContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || 'Lời nhắn từ AI Chatbot',
        message: formData.message.trim()
      })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Không thể gửi lời nhắn. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (cancelled) {
    return (
      <div className="chat-generative-card" style={{ borderLeft: '3.5px solid #94a3b8', background: 'rgba(148, 163, 184, 0.08)' }}>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
          <X size={14} /> Bạn đã hủy gửi lời nhắn này.
        </p>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="chat-generative-card" style={{ borderLeft: '3.5px solid #10b981', background: 'rgba(16, 185, 129, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#10b981' }}>
              Đã gửi thông báo thành công tới anh Khoa!
            </h4>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.5 }}>
              Tin nhắn của bạn đã được lưu vào hệ thống và email thông báo tức thì đã được gửi tới hòm thư cá nhân của anh Khoa. Anh Khoa sẽ phản hồi qua email <b>{formData.email}</b> sớm nhất!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-generative-card chat-contact-confirm-card" style={{ borderLeft: '3.5px solid #6366f1' }}>
      <div className="chat-card-header">
        <div className="chat-card-badge-row">
          <span className="chat-card-type-badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <Mail size={12} /> XÁC NHẬN GỬI LIÊN HỆ
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6366f1',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginLeft: 'auto'
            }}
          >
            <Edit3 size={12} /> {isEditing ? 'Đóng chỉnh sửa' : 'Chỉnh sửa'}
          </button>
        </div>
        <h4 className="chat-card-title" style={{ marginTop: 6, fontSize: 14 }}>
          Bạn có muốn gửi thông tin liên hệ này tới anh Khoa?
        </h4>
      </div>

      {error && (
        <div style={{ margin: '8px 0', padding: '6px 10px', borderRadius: 6, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '10px 0' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)' }}>Họ &amp; Tên:</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)' }}>Email phản hồi *:</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@company.com"
              style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)' }}>Tiêu đề:</label>
            <input
              type="text"
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)' }}>Nội dung lời nhắn:</label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              style={{ width: '100%', padding: '6px 10px', fontSize: 12.5, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'var(--text)', resize: 'vertical' }}
            />
          </div>
        </div>
      ) : (
        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '10px 12px', margin: '8px 0', fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div>
            <span style={{ color: 'var(--sub)', fontWeight: 600 }}>👤 Người gửi: </span>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>{formData.name}</span>
          </div>
          <div>
            <span style={{ color: 'var(--sub)', fontWeight: 600 }}>📧 Email: </span>
            <span style={{ color: '#06b6d4', fontWeight: 700 }}>{formData.email || '(Chưa nhập)'}</span>
          </div>
          <div>
            <span style={{ color: 'var(--sub)', fontWeight: 600 }}>📌 Chủ đề: </span>
            <span style={{ color: 'var(--text)' }}>{formData.subject}</span>
          </div>
          <div style={{ marginTop: 2, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 4 }}>
            <span style={{ color: 'var(--sub)', fontWeight: 600 }}>📝 Lời nhắn: </span>
            <span style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{formData.message}</span>
          </div>
        </div>
      )}

      <div className="chat-card-actions" style={{ marginTop: 10 }}>
        <button
          type="button"
          className="chat-card-btn btn-primary"
          onClick={handleSend}
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', flex: 1 }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Đang gửi tin...</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>Xác nhận &amp; Gửi ngay</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="chat-card-btn btn-secondary"
          onClick={() => setCancelled(true)}
          disabled={loading}
        >
          <X size={13} />
          <span>Hủy</span>
        </button>
      </div>
    </div>
  )
}
