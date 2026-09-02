import { useMemo } from 'react'
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  GraduationCap,
  Layers3,
  MapPin,
  Server,
  Sparkles,
  UserRound,
  Wrench
} from 'lucide-react'
import { PageHero } from '../components/common/PageHero'
import { LinesSkeleton } from '../components/common/Skeletons'
import { useApiResource } from '../hooks/useApiResource'
import { getExperiences, getProfile, getSkills } from '../services/portfolioApi'

function formatSchoolName(edu) {
  if (!edu) return 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)'
  if (typeof edu === 'object') {
    return edu.school || edu.university || edu.name || `${edu.degree || ''} ${edu.major || ''}`.trim() || 'Học viện Công nghệ Bưu chính Viễn thông (PTIT)'
  }
  if (typeof edu === 'string') {
    const trimmed = edu.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        return parsed.school || parsed.university || parsed.name || `${parsed.degree || ''} ${parsed.major || ''}`.trim() || trimmed
      } catch (e) {
        return trimmed
      }
    }
    return trimmed
  }
  return String(edu)
}

const CATEGORY_META = {
  'backend & architecture': {
    icon: Server,
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    label: 'Backend & Kiến trúc hệ thống'
  },
  'database': {
    icon: Database,
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.1)',
    label: 'Cơ sở dữ liệu & Tối ưu hóa'
  },
  'data processing': {
    icon: Layers3,
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    label: 'Xử lý dữ liệu & Streaming'
  },
  'ai & tools': {
    icon: Sparkles,
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.1)',
    label: 'AI, DevOps & Công cụ'
  },
  'frontend': {
    icon: Code2,
    color: '#ea580c',
    bgColor: 'rgba(234, 88, 12, 0.1)',
    label: 'Frontend & Giao diện'
  },
  'devops & cloud': {
    icon: Cpu,
    color: '#0d9488',
    bgColor: 'rgba(13, 148, 136, 0.1)',
    label: 'DevOps & Hạ tầng Cloud'
  }
}

export function ProfilePage() {
  const profile = useApiResource(getProfile)
  const skills = useApiResource(getSkills)
  const experiences = useApiResource(getExperiences)

  const skillItems = Array.isArray(skills.data) ? skills.data : []
  const experienceItems = Array.isArray(experiences.data) ? experiences.data : []

  // Group skills by category without percentages
  const categorizedSkills = useMemo(() => {
    const groups = {}
    skillItems.forEach((s) => {
      const cat = s.category || 'Kỹ năng chuyên môn'
      if (!groups[cat]) {
        groups[cat] = []
      }
      groups[cat].push(s)
    })
    // Sort items within each category by displayOrder
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    })
    return groups
  }, [skillItems])

  return (
    <main>
      <PageHero
        eyebrow="About Me & Experience"
        title="Hồ sơ cá nhân"
        description="Software Developer đam mê thiết kế hệ thống Backend, xử lý dữ liệu và xây dựng các giải pháp công nghệ ổn định, hiệu năng cao."
        icon={UserRound}
        tone="indigo"
        image="/images/projects_3d_cover.png"
      />

      {/* Profile Overview & Story */}
      <section className="section profile-story-section">
        <div className="content-shell">
          {profile.isLoading || profile.error ? (
            <LinesSkeleton count={3} />
          ) : (
            <div className="profile-grid">
              {/* Profile Card */}
              <aside className="profile-card reveal">
                <div className="profile-avatar-wrapper">
                  <div className="profile-avatar-ring">
                    {profile.data?.avatarUrl ? (
                      <img src={profile.data.avatarUrl} alt={profile.data.fullName} />
                    ) : (
                      <span>{profile.data?.fullName?.charAt(0) || 'K'}</span>
                    )}
                  </div>
                </div>

                <h2>{profile.data?.fullName}</h2>
                <p className="profile-headline">{profile.data?.headline}</p>

                <div className="profile-meta-list">
                  {profile.data?.location && (
                    <span>
                      <MapPin style={{ width: 16, height: 16 }} /> {profile.data.location}
                    </span>
                  )}
                  <span>
                    <GraduationCap style={{ width: 16, height: 16 }} /> {formatSchoolName(profile.data?.education)}
                  </span>
                  <span className="avail-status">
                    <CheckCircle2 style={{ width: 16, height: 16, color: '#10b981' }} /> Sẵn sàng nhận dự án / cơ hội mới
                  </span>
                </div>
              </aside>

              {/* Story Article */}
              <article className="prose-card profile-article reveal">
                <header>
                  <span className="eyebrow">
                    <Sparkles style={{ width: 14, height: 14 }} /> Câu chuyện của tôi
                  </span>
                  <h2>{profile.data?.headline}</h2>
                  {profile.data?.shortBio && (
                    <p className="short-bio-highlight">{profile.data.shortBio}</p>
                  )}
                </header>

                <div
                  className="rich-content"
                  dangerouslySetInnerHTML={{ __html: profile.data?.bio }}
                />
              </article>
            </div>
          )}
        </div>
      </section>

      {/* Technical Capabilities & Stack Section (Categorized Badges - No Percentages) */}
      <section className="section profile-skills-section">
        <div className="content-shell">
          <header className="section-heading">
            <span>KỸ NĂNG CHUYÊN MÔN</span>
            <h2>Năng lực kỹ thuật</h2>
            <p>Tổng hợp các ngôn ngữ lập trình, hệ quản trị cơ sở dữ liệu, kiến trúc hệ thống và công cụ AI.</p>
          </header>

          {skills.isLoading || skills.error ? (
            <LinesSkeleton count={4} />
          ) : Object.keys(categorizedSkills).length === 0 ? (
            <div className="empty-state-box">
              <Code2 className="empty-icon" />
              <h3>Chưa có dữ liệu Kỹ năng</h3>
              <p>Vui lòng cập nhật thông tin trong trang Quản trị Admin.</p>
            </div>
          ) : (
            <div className="skills-category-grid">
              {Object.entries(categorizedSkills).map(([catName, items]) => {
                const catKey = catName.trim().toLowerCase()
                const meta = CATEGORY_META[catKey] || {
                  icon: Wrench,
                  color: '#059669',
                  bgColor: 'rgba(5, 150, 105, 0.1)',
                  label: catName
                }
                const IconComponent = meta.icon

                return (
                  <div className="skill-category-card reveal" key={catName}>
                    <div className="skill-cat-header">
                      <div className="skill-cat-icon-box" style={{ color: meta.color, background: meta.bgColor }}>
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <h3 className="skill-cat-title">{meta.label || catName}</h3>
                        <span className="skill-cat-count">{items.length} công nghệ</span>
                      </div>
                    </div>
                    <div className="skill-chips-wrap">
                      {items.map((s) => (
                        <div className="skill-tech-chip" key={s.id || s.name}>
                          <span className="skill-chip-dot" style={{ background: meta.color }} />
                          <span className="skill-chip-name">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Experience Timeline Section */}
      <section className="section profile-experience-section">
        <div className="content-shell">
          <header className="section-heading">
            <span>CAREER PATH</span>
            <h2>Kinh nghiệm làm việc</h2>
            <p>Các cột mốc công tác và đóng góp chuyên môn tại các tổ chức, doanh nghiệp.</p>
          </header>

          {experiences.isLoading || experiences.error ? (
            <LinesSkeleton count={3} />
          ) : experienceItems.length === 0 ? (
            <div className="empty-state-box">
              <Briefcase className="empty-icon" />
              <h3>Chưa có dữ liệu Kinh nghiệm làm việc</h3>
              <p>Vui lòng cập nhật thông tin trong trang Quản trị Admin.</p>
            </div>
          ) : (
            <div className="experience-timeline-container">
              <div className="exp-track-line" />
              {experienceItems.map((e, idx) => (
                <article key={e.id || idx} className="exp-timeline-item reveal">
                  <div className="exp-node">
                    <span className="exp-node-dot" />
                  </div>
                  <div className="exp-card">
                    <div className="exp-card-header">
                      <span className="exp-date-badge">
                        <Calendar style={{ width: 13, height: 13 }} />
                        {e.startDate} — {e.endDate || 'Hiện tại'}
                      </span>
                      <h3>{e.position}</h3>
                      <b className="exp-company-name">{e.company}</b>
                    </div>

                    <div
                      className="exp-card-body rich-content"
                      dangerouslySetInnerHTML={{ __html: e.description }}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
