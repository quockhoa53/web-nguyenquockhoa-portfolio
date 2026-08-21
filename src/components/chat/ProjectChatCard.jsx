import { memo } from 'react'
import { ExternalLink, Code2 as Github, ArrowRight, Sparkles, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

export const ProjectChatCard = memo(function ProjectChatCard({ project, onNavigate }) {
  if (!project) return null

  // Parse technologies if string or array
  const techList = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
      ? project.technologies.split(',').map(t => t.trim()).filter(Boolean)
      : []

  const detailUrl = `/projects/${project.id}`
  const demoUrl = project.demoUrl || project.demo_url
  const sourceUrl = project.sourceUrl || project.source_url

  // Clean description if HTML
  const plainDesc = project.summary || (project.description ? project.description.replace(/<[^>]*>?/gm, '') : '')
  const displaySummary = plainDesc.length > 140 ? plainDesc.substring(0, 140) + '...' : plainDesc

  return (
    <div className="chat-generative-card chat-project-card">
      <div className="chat-card-header">
        <div className="chat-card-badge-row">
          <span className="chat-card-type-badge project-badge">
            <Layers size={12} /> DỰ ÁN
          </span>
          {project.featured && (
            <span className="chat-card-featured-badge">
              <Sparkles size={11} /> Nổi bật
            </span>
          )}
        </div>
        <h4 className="chat-card-title">{project.title}</h4>
      </div>

      {displaySummary && (
        <p className="chat-card-desc">{displaySummary}</p>
      )}

      {techList.length > 0 && (
        <div className="chat-card-tags">
          {techList.slice(0, 4).map((tech, idx) => (
            <span key={idx} className="chat-card-tag">
              {tech}
            </span>
          ))}
          {techList.length > 4 && (
            <span className="chat-card-tag-more">+{techList.length - 4}</span>
          )}
        </div>
      )}

      <div className="chat-card-actions">
        <Link
          to={detailUrl}
          className="chat-card-btn btn-primary"
          onClick={() => onNavigate && onNavigate()}
        >
          <span>Xem chi tiết</span>
          <ArrowRight size={14} />
        </Link>

        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-card-btn btn-secondary"
            title="Mở bản Demo trực tiếp"
          >
            <ExternalLink size={13} />
            <span>Demo</span>
          </a>
        )}

        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-card-btn btn-outline"
            title="Xem mã nguồn GitHub"
          >
            <Github size={13} />
            <span>GitHub</span>
          </a>
        )}
      </div>
    </div>
  )
})
