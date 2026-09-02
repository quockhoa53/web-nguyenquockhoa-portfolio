import {
  Briefcase,
  Calendar,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Sparkles,
  UserRound
} from 'lucide-react'
import { PageHero } from '../components/common/PageHero'
import { LinesSkeleton } from '../components/common/Skeletons'
import { SkillsCategoryGrid } from '../components/portfolio/SkillsCategoryGrid'
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

export function ProfilePage() {
  const profile = useApiResource(getProfile)
  const skills = useApiResource(getSkills)
  const experiences = useApiResource(getExperiences)

  const experienceItems = Array.isArray(experiences.data) ? experiences.data : []

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

      {/* Technical Capabilities & Stack Section (Categorized Badges - Unified with HomePage) */}
      <section className="section profile-skills-section">
        <div className="content-shell">
          <header className="section-heading">
            <span>KỸ NĂNG CHUYÊN MÔN</span>
            <h2>Năng lực kỹ thuật</h2>
            <p>Tổng hợp các ngôn ngữ lập trình, hệ quản trị cơ sở dữ liệu, kiến trúc hệ thống và công cụ AI.</p>
          </header>

          {skills.isLoading || skills.error ? (
            <LinesSkeleton count={4} />
          ) : (
            <SkillsCategoryGrid skills={skills.data} />
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
