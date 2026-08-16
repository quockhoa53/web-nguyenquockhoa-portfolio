import { useState } from 'react'
import { Mail, MapPin } from 'lucide-react'
import { Section } from '../../components/common/Section'
import { sendContact } from '../../services/portfolioApi'

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' }

export function ContactSection({ profile }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      await sendContact(form)
      setForm(EMPTY_FORM)
      setStatus({ type: 'success', message: 'Đã gửi lời nhắn thành công!' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Section id="contact" eyebrow="Kết nối" title="Cùng làm việc với nhau" description="Bạn có một ý tưởng hoặc cơ hội hợp tác? Hãy để lại lời nhắn cho tôi.">
      <div className="contact-grid">
        <div className="contact-info-card">
          <h3>Thông tin trao đổi</h3>
          <p>Tôi luôn sẵn sàng trao đổi về các dự án backend, kiến trúc hệ thống, xử lý dữ liệu cũng như các cơ hội hợp tác phát triển sản phẩm.</p>
          <div className="contact-details">
            <div className="contact-detail-item">
              <Mail className="contact-icon" />
              <div>
                <small>Email liên hệ</small>
                <span>{profile.email}</span>
              </div>
            </div>
            {profile.location && (
              <div className="contact-detail-item">
                <MapPin className="contact-icon" />
                <div>
                  <small>Địa điểm làm việc</small>
                  <span>{profile.location}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <form className="contact-form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <input required maxLength="150" name="name" autoComplete="name" className="input" placeholder="Họ và tên của bạn" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input required maxLength="255" type="email" name="email" autoComplete="email" className="input" placeholder="Địa chỉ Email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input required maxLength="255" name="subject" className="input" placeholder="Chủ đề / Tiêu đề tin nhắn" value={form.subject} onChange={handleChange} />
          </div>
          <div className="form-group">
            <textarea required maxLength="5000" name="message" rows="5" className="input resize-none" placeholder="Nội dung lời nhắn..." value={form.message} onChange={handleChange} />
          </div>
          <button disabled={isSubmitting} className="btn primary submit-btn">
            {isSubmitting ? 'Đang gửi…' : 'Gửi lời nhắn ngay'}
          </button>
          {status.message && (
            <p role="status" className={`status-msg ${status.type === 'error' ? 'error' : 'success'}`}>
              {status.message}
            </p>
          )}
        </form>
      </div>
    </Section>
  )
}
