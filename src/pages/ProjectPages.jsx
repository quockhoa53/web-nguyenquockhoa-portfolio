import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code2,
  Code2 as GithubIcon,
  ExternalLink,
  Eye,
  FolderKanban,
  Heart,
  Layers,
  List,
  MessageSquare,
  Sparkles,
  Star,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/common/PageHero'
import { CardsSkeleton, LinesSkeleton } from '../components/common/Skeletons'
import { TiltCard } from '../components/common/TiltCard'
import { useApiResource } from '../hooks/useApiResource'
import { getProject, getProjects } from '../services/portfolioApi'

function parseTechnologies(tech) {
  if (Array.isArray(tech)) return tech.map(t => String(t).trim()).filter(Boolean)
  if (typeof tech === 'string') return tech.split(',').map(t => t.trim()).filter(Boolean)
  return []
}

function extractCleanSummary(html = '', rawSummary = '') {
  if (rawSummary && rawSummary.trim()) {
    return rawSummary.trim()
  }
  const text = (html || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= 180) return text
  const periodIndex = text.indexOf('.', 80)
  if (periodIndex !== -1 && periodIndex <= 220) {
    return text.slice(0, periodIndex + 1)
  }
  return text.slice(0, 180) + '...'
}

function processHtmlWithToc(htmlString = '') {
  if (!htmlString) return { processedHtml: '', tocItems: [] }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, strong')
    const tocItems = []

    let index = 1
    headings.forEach(heading => {
      const text = heading.textContent.trim()
      if (!text || text.length < 3 || text.length > 85) return

      const isHeadingTag = /^H[1-6]$/i.test(heading.tagName)
      const isStandaloneStrong =
        heading.tagName === 'STRONG' &&
        heading.parentElement &&
        heading.parentElement.textContent.trim() === text

      if (isHeadingTag || isStandaloneStrong) {
        const id = `toc-section-${index}`
        heading.id = id
        tocItems.push({
          id,
          text,
          level: isHeadingTag ? parseInt(heading.tagName.replace('H', ''), 10) : 3,
        })
        index++
      }
    })

    // If no standard headings found, attempt to match bullet lines or key points
    if (tocItems.length === 0) {
      const paragraphs = doc.querySelectorAll('p, div, li')
      paragraphs.forEach(p => {
        const text = p.textContent.trim()
        if (/^(\d+[\.\)]|[🎯🚀⚡🛠️📌🔍💡])/.test(text) && text.length < 75) {
          const id = `toc-section-${index}`
          p.id = id
          tocItems.push({ id, text, level: 3 })
          index++
        }
      })
    }

    return {
      processedHtml: doc.body.innerHTML,
      tocItems,
    }
  } catch (err) {
    return { processedHtml: htmlString, tocItems: [] }
  }
}

export function ProjectsPage() {
  const projects = useApiResource(getProjects)
  const [filter, setFilter] = useState('ALL')

  const items = Array.isArray(projects.data) ? projects.data : []

  const filteredItems = items.filter(p => {
    if (filter === 'ALL') return true
    if (filter === 'FEATURED') return p.featured
    const techLower = (p.technologies || '').toLowerCase()
    if (filter === 'BACKEND') return techLower.includes('spring') || techLower.includes('java') || techLower.includes('backend') || techLower.includes('postgres')
    if (filter === 'DATA') return techLower.includes('data') || techLower.includes('flink') || techLower.includes('kafka') || techLower.includes('pipeline')
    return true
  })

  return (
    <main>
      <PageHero
        eyebrow="My Portfolio"
        title="Dự án đã thực hiện"
        description="Các sản phẩm phần mềm, hệ thống backend microservices và giải pháp xử lý dữ liệu tôi đã trực tiếp xây dựng."
        icon={FolderKanban}
        tone="primary"
        image="/images/projects_3d_cover.png"
      />

      <section className="section">
        <div className="content-shell">
          {/* Filter Pills */}
          <div className="filter-pill-bar">
            <button
              className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              Tất cả ({items.length})
            </button>
            <button
              className={`filter-btn ${filter === 'FEATURED' ? 'active' : ''}`}
              onClick={() => setFilter('FEATURED')}
            >
              <Star style={{ width: 14, height: 14 }} /> Nổi bật
            </button>
            <button
              className={`filter-btn ${filter === 'BACKEND' ? 'active' : ''}`}
              onClick={() => setFilter('BACKEND')}
            >
              Backend &amp; Services
            </button>
            <button
              className={`filter-btn ${filter === 'DATA' ? 'active' : ''}`}
              onClick={() => setFilter('DATA')}
            >
              Data &amp; Pipeline
            </button>
          </div>

          {projects.isLoading ? (
            <CardsSkeleton count={6} />
          ) : filteredItems.length === 0 ? (
            <div className="empty-state-box">
              <FolderKanban className="empty-icon" />
              <h3>Chưa có dự án trong danh mục này</h3>
              <p>Vui lòng chọn danh mục khác hoặc cập nhật dữ liệu từ trang quản trị.</p>
            </div>
          ) : (
            <div className="projects-grid-container">
              {filteredItems.map((p, index) => {
                const techs = parseTechnologies(p.technologies)
                const isOdd = index % 2 !== 0

                return (
                  <TiltCard key={p.id} className="modern-project-card reveal">
                    {/* Card Cover with gradient & 3D look */}
                    <div className={`project-card-cover ${isOdd ? 'cover-alt' : ''}`}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="cover-image" />
                      ) : (
                        <div className="cover-fallback">
                          <FolderKanban className="fallback-icon" />
                          <span className="cover-title-badge">{p.title.slice(0, 3).toUpperCase()}</span>
                        </div>
                      )}

                      {p.featured && (
                        <span className="featured-corner-badge">
                          <Sparkles style={{ width: 12, height: 12 }} /> Nổi bật
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="project-card-body">
                      <div className="project-card-header">
                        <h3>{p.title}</h3>
                      </div>

                      <p className="project-card-desc">
                        {p.description?.replace(/<[^>]*>?/gm, '').slice(0, 140)}…
                      </p>

                      {techs.length > 0 && (
                        <div className="project-card-tags">
                          {techs.slice(0, 4).map((t, idx) => (
                            <span key={idx} className="project-tag">
                              {t}
                            </span>
                          ))}
                          {techs.length > 4 && (
                            <span className="project-tag more">+{techs.length - 4}</span>
                          )}
                        </div>
                      )}

                      <div className="project-card-actions">
                        <Link to={`/projects/${p.id}`} className="btn-card-detail">
                          <span>Chi tiết dự án</span>
                          <ArrowRight style={{ width: 14, height: 14 }} />
                        </Link>
                        {p.demoUrl && (
                          <a
                            href={p.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-card-icon"
                            title="Xem Demo"
                          >
                            <ExternalLink style={{ width: 15, height: 15 }} />
                          </a>
                        )}
                        {p.sourceUrl && (
                          <a
                            href={p.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-card-icon"
                            title="Xem Mã nguồn"
                          >
                            <GithubIcon style={{ width: 15, height: 15 }} />
                          </a>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export function ProjectDetailPage() {
  const { id } = useParams()
  const project = useApiResource(() => getProject(id), id)
  const [activeTocId, setActiveTocId] = useState('')

  const data = project.data
  const techs = data ? parseTechnologies(data.technologies) : []

  const cleanSummary = useMemo(() => {
    if (!data) return ''
    return extractCleanSummary(data.description, data.summary)
  }, [data])

  const { processedHtml, tocItems } = useMemo(() => {
    if (!data || !data.description) return { processedHtml: '', tocItems: [] }
    return processHtmlWithToc(data.description)
  }, [data])

  function handleScrollTo(e, targetId) {
    e.preventDefault()
    setActiveTocId(targetId)
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (project.isLoading) {
    return (
      <main className="section">
        <div className="content-shell">
          <LinesSkeleton count={5} />
        </div>
      </main>
    )
  }

  if (project.error || !data) {
    return (
      <main className="section">
        <div className="content-shell empty-state-box">
          <h2>Không tìm thấy dự án</h2>
          <p>Dự án này không tồn tại hoặc đã được gỡ bỏ.</p>
          <Link to="/projects" className="btn primary">
            <ArrowLeft /> Quay lại danh sách dự án
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="project-detail-page">
      {/* Project Detail Hero Banner */}
      <section className="detail-hero-banner tone-primary">
        <div className="hero-banner-mesh" />
        <div className="hero-banner-glow" />

        <div className="content-shell hero-banner-content">
          <div className="hero-top-nav">
            <Link to="/projects" className="hero-back-btn">
              <ArrowLeft size={16} /> <span>Tất cả dự án</span>
            </Link>
            <span className="hero-category-badge">
              <FolderKanban style={{ width: 14, height: 14 }} />
              {data.featured ? 'Dự án nổi bật' : 'Dự án đã thực hiện'}
            </span>
          </div>

          <h1 className="hero-main-title font-display">{data.title}</h1>

          {/* Concise Summary Paragraph Only */}
          <div className="hero-summary-box">
            <p>{cleanSummary}</p>
          </div>

          {/* Direct Action Buttons */}
          <div className="hero-cta-group">
            {data.demoUrl && (
              <a
                href={data.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="btn light"
              >
                <ExternalLink style={{ width: 16, height: 16 }} /> Xem Live Demo
              </a>
            )}
            {data.sourceUrl && (
              <a
                href={data.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="btn outline-light"
              >
                <GithubIcon style={{ width: 16, height: 16 }} /> Xem Source Code
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Project Detail Content Grid (Wider Architecture Section & Dynamic Table of Contents) */}
      <section className="section detail-content-section">
        <div className="content-shell detail-layout-grid">
          {/* Main Article (Wider Column) */}
          <article className="detail-main-article">
            <div className="detail-article-header">
              <Sparkles className="sparkle-accent" />
              <h2 className="font-display text-xl md:text-2xl font-bold text-white">
                Chi tiết kiến trúc &amp; Giải pháp kỹ thuật
              </h2>
            </div>

            {/* Dynamic Architecture Content */}
            <div
              className="prose-content-body rich-content"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
          </article>

          {/* Sticky Sidebar */}
          <aside className="detail-sidebar-card">
            {/* Sidebar Table of Contents */}
            {tocItems.length > 0 && (
              <div className="sidebar-toc-block">
                <div className="sidebar-card-header">
                  <List size={16} className="text-emerald-400" />
                  <h4 className="font-display text-sm font-bold text-white">Mục lục dự án</h4>
                </div>
                <nav className="sidebar-toc-list">
                  {tocItems.map((item, idx) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleScrollTo(e, item.id)}
                      className={`sidebar-toc-item ${activeTocId === item.id ? 'active' : ''}`}
                    >
                      <span className="toc-bullet">{idx + 1}</span>
                      <span className="toc-label">{item.text}</span>
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Project Specs */}
            <div className="sidebar-card-header">
              <Layers style={{ width: 18, height: 18, color: 'var(--primary)' }} />
              <h4 className="font-display font-bold">Thông số dự án</h4>
            </div>

            <div className="sidebar-info-list">
              <div className="sidebar-info-row">
                <small>Vai trò đảm nhiệm</small>
                <b>Full-stack / Backend Developer</b>
              </div>
              <div className="sidebar-info-row">
                <small>Trạng thái dự án</small>
                <b className="status-badge-active">
                  <CheckCircle2 style={{ width: 14, height: 14 }} /> Hoàn thành
                </b>
              </div>
              <div className="sidebar-info-row">
                <small>Độ ưu tiên</small>
                <b>{data.featured ? '⭐ Nổi bật trên Home' : 'Chuẩn'}</b>
              </div>
            </div>

            {techs.length > 0 && (
              <div className="sidebar-tech-section">
                <small className="tech-section-title">
                  <Code2 style={{ width: 14, height: 14 }} /> Công nghệ sử dụng:
                </small>
                <div className="sidebar-tech-cloud">
                  {techs.map((t, idx) => (
                    <span key={idx} className="sidebar-tech-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="sidebar-cta-box">
              <p>Bạn muốn xây dựng một dự án tương tự?</p>
              <Link to="/contact" className="btn primary full-width">
                <MessageSquare style={{ width: 15, height: 15 }} /> Kết nối với tôi
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
