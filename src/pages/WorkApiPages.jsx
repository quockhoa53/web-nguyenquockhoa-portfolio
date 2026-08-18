import { ArrowLeft, ArrowRight, Briefcase, Calendar, CheckCircle2, ChevronRight, Code2, ExternalLink, Layers, MessageSquare, Route, Sparkles } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/common/PageHero'
import { LinesSkeleton } from '../components/common/Skeletons'
import { TiltCard } from '../components/common/TiltCard'
import { useApiResource } from '../hooks/useApiResource'
import { getWorkItem, getWorkItems } from '../services/portfolioApi'

function parseTechnologies(tech) {
  if (Array.isArray(tech)) return tech.map(t => String(t).trim()).filter(Boolean)
  if (typeof tech === 'string') return tech.split(',').map(t => t.trim()).filter(Boolean)
  return []
}

export function WorkProcessPage() {
  const state = useApiResource(getWorkItems)
  const items = Array.isArray(state.data) ? state.data : []

  return (
    <main>
      <PageHero
        eyebrow="Process & Architecture"
        title="Quá trình làm việc"
        description="Các mảng công việc thực chiến, từ thiết kế kiến trúc Backend, tối ưu hóa Database đến xử lý dữ liệu luồng và tích hợp AI."
        icon={Route}
        tone="emerald"
        image="/images/projects_3d_cover.png"
      />

      <section className="section">
        <div className="content-shell">
          {state.isLoading ? (
            <div className="work-timeline-container">
              <LinesSkeleton count={4} />
            </div>
          ) : state.error || items.length === 0 ? (
            <div className="empty-state-box">
              <Route className="empty-icon" />
              <h3>Chưa có dữ liệu Quá trình làm việc</h3>
              <p>Vui lòng cập nhật và xuất bản các mục công việc trong trang Admin.</p>
            </div>
          ) : (
            <div className="work-timeline-container">
              <div className="timeline-track-line" />
              {items.map((w, i) => {
                const techs = parseTechnologies(w.technologies)
                const slugOrId = w.slug || w.id

                return (
                  <article key={w.id || i} className="work-timeline-item reveal">
                    {/* Glowing Marker Node */}
                    <div className="work-timeline-node">
                      <span className="node-number">{String(i + 1).padStart(2, '0')}</span>
                      <span className="node-pulse" />
                    </div>

                    {/* Work Content Card */}
                    <TiltCard className="work-timeline-card">
                      <div className="work-card-header">
                        <div className="meta-pill-group">
                          <span className="meta-pill period">
                            <Calendar className="pill-icon" />
                            {w.period}
                          </span>
                          <span className="meta-pill role">
                            <Briefcase className="pill-icon" />
                            {w.role}
                          </span>
                          <span className="meta-pill company">
                            <b>{w.company}</b>
                          </span>
                        </div>
                      </div>

                      <div className="work-card-title-row">
                        <div className="code-icon-badge">
                          <Code2 />
                        </div>
                        <h2>{w.title}</h2>
                      </div>

                      {w.summary && (
                        <div
                          className="work-card-summary"
                          dangerouslySetInnerHTML={{ __html: w.summary }}
                        />
                      )}

                      {techs.length > 0 && (
                        <div className="work-card-techs">
                          {techs.map((t, idx) => (
                            <span key={idx} className="tech-badge">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="work-card-footer">
                        <Link to={`/work-process/${slugOrId}`} className="work-detail-btn">
                          <span>Xem chi tiết công việc</span>
                          <ArrowRight className="btn-arrow" />
                        </Link>
                      </div>
                    </TiltCard>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export function WorkDetailPage() {
  const { slug } = useParams()
  const state = useApiResource(() => getWorkItem(slug), slug)

  if (state.isLoading) {
    return (
      <main className="section">
        <div className="content-shell">
          <LinesSkeleton count={5} />
        </div>
      </main>
    )
  }

  if (state.error || !state.data) {
    return (
      <main className="section">
        <div className="content-shell empty-state-box">
          <h2>Không tìm thấy chi tiết công việc</h2>
          <p>Mục công việc này không tồn tại hoặc đã bị ẩn.</p>
          <Link to="/work-process" className="btn primary">
            <ArrowLeft /> Quay lại Quá trình làm việc
          </Link>
        </div>
      </main>
    )
  }

  const item = state.data
  const techs = parseTechnologies(item.technologies)

  return (
    <main>
      {/* Detail Header Banner */}
      <section className="detail-hero-banner tone-emerald">
        <div className="hero-banner-mesh" />
        <div className="hero-banner-glow" />

        <div className="content-shell hero-banner-content">
          <div className="hero-top-nav">
            <Link to="/work-process" className="hero-back-btn">
              <ArrowLeft /> Quay lại Quá trình làm việc
            </Link>
            <span className="hero-category-badge">
              <Route style={{ width: 14, height: 14 }} /> Quá trình làm việc
            </span>
          </div>

          <div className="hero-meta-strip">
            <span className="hero-pill">
              <Calendar style={{ width: 14, height: 14 }} /> {item.period}
            </span>
            <span className="hero-pill">
              <Briefcase style={{ width: 14, height: 14 }} /> {item.role}
            </span>
            <span className="hero-pill company-pill">
              {item.company}
            </span>
          </div>

          <h1 className="hero-main-title">{item.title}</h1>

          {item.summary && (
            <div
              className="hero-summary-box"
              dangerouslySetInnerHTML={{ __html: item.summary }}
            />
          )}
        </div>
      </section>

      {/* Main Detail Body & Sidebar */}
      <section className="section detail-content-section">
        <div className="content-shell detail-layout-grid">
          {/* Main Rich Content */}
          <article className="detail-main-article">
            <div className="detail-article-header">
              <Sparkles className="sparkle-accent" />
              <h3>Nội dung & Trách nhiệm thực hiện</h3>
            </div>
            
            <div
              className="prose-content-body rich-content"
              dangerouslySetInnerHTML={{ __html: item.content || item.summary }}
            />
          </article>

          {/* Sidebar Overview Card */}
          <aside className="detail-sidebar-card">
            <div className="sidebar-card-header">
              <Layers style={{ width: 18, height: 18, color: '#10b981' }} />
              <h4>Tổng quan công việc</h4>
            </div>

            <div className="sidebar-info-list">
              <div className="sidebar-info-row">
                <small>Thời gian thực hiện</small>
                <b>{item.period}</b>
              </div>
              <div className="sidebar-info-row">
                <small>Vai trò / Vị trí</small>
                <b>{item.role}</b>
              </div>
              <div className="sidebar-info-row">
                <small>Công ty / Đơn vị</small>
                <b>{item.company}</b>
              </div>
              <div className="sidebar-info-row">
                <small>Trạng thái</small>
                <b className="status-badge-active">
                  <CheckCircle2 style={{ width: 14, height: 14 }} /> Đã xuất bản
                </b>
              </div>
            </div>

            {techs.length > 0 && (
              <div className="sidebar-tech-section">
                <small className="tech-section-title">
                  <Code2 style={{ width: 14, height: 14 }} /> Công nghệ & Công cụ:
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
              <p>Bạn quan tâm đến giải pháp kỹ thuật này?</p>
              <Link to="/contact" className="btn primary full-width">
                <MessageSquare style={{ width: 15, height: 15 }} /> Trao đổi & Hợp tác
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
