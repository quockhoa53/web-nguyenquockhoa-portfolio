import { Download, ExternalLink, FileText, Star, Sparkles, Layers } from 'lucide-react'
import { recordResumeDownload } from '../../services/portfolioApi'

export function ResumeChatCard({ resume }) {
  if (!resume) return null

  const fileUrl = resume.fileUrl || resume.file_url
  const title = resume.title || 'CV Nguyễn Quốc Khoa'
  const targetRole = resume.targetRole || resume.target_role || 'GENERAL'
  const summary = resume.summary || ''

  const roleLabel =
    targetRole === 'BACKEND'
      ? 'Java / Backend Engineer'
      : targetRole === 'FULLSTACK'
        ? 'Full-stack Developer'
        : targetRole === 'AI_ENGINEER'
          ? 'AI / LLM Specialist'
          : 'Hồ sơ năng lực'

  async function handleDownloadClick() {
    if (resume.id) {
      try {
        await recordResumeDownload(resume.id)
      } catch (e) {
        // silent fail
      }
    }
  }

  return (
    <div className="chat-generative-card chat-resume-card" style={{ borderLeft: '3.5px solid #06b6d4' }}>
      <div className="chat-card-header">
        <div className="chat-card-badge-row">
          <span className="chat-card-type-badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
            <FileText size={12} /> HỒ SƠ CV
          </span>
          <span className="chat-card-category-badge">
            <Layers size={11} /> {roleLabel}
          </span>
          {resume.isPrimary && (
            <span className="chat-card-featured-badge">
              <Star size={11} fill="#fbbf24" /> CV chính
            </span>
          )}
        </div>
        <h4 className="chat-card-title">{title}</h4>
      </div>

      {summary && <p className="chat-card-desc">{summary}</p>}

      <div className="chat-card-actions">
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={resume.fileName || true}
            className="chat-card-btn btn-primary"
            onClick={handleDownloadClick}
            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
          >
            <Download size={14} />
            <span>Tải File CV (PDF)</span>
          </a>
        )}

        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-card-btn btn-secondary"
            title="Xem trực tiếp trên trình duyệt"
          >
            <ExternalLink size={13} />
            <span>Xem trước</span>
          </a>
        )}
      </div>
    </div>
  )
}
