import { ArrowRight, BriefcaseBusiness, Code2, Database, Download, Layers3, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CardsSkeleton, HeroSkeleton } from '../components/common/Skeletons'
import { useApiResource } from '../hooks/useApiResource'
import { getProfile, getProjects, getSkills } from '../services/portfolioApi'
import { FrontendProfileEditor } from '../admin/FrontendProfileEditor'

const skillGroups = [
  [Code2, 'Backend & Architecture'],
  [Database, 'Database'],
  [Layers3, 'Data Processing'],
  [Sparkles, 'AI & Tools'],
]

function getCategorySkills(allSkills, groupTitle) {
  if (!Array.isArray(allSkills)) return []
  
  const titleLower = groupTitle.trim().toLowerCase()
  return allSkills
    .filter(s => {
      if (!s || !s.category) return false
      const catLower = s.category.trim().toLowerCase()
      return catLower === titleLower
    })
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map(s => s.name)
    .filter(Boolean)
    .slice(0, 10) // Giới hạn tối đa 10 kỹ năng mỗi nhóm từ Database
}

export function HomePage() {
  const profileState = useApiResource(getProfile)
  const projectsState = useApiResource(getProjects)
  const skillsState = useApiResource(getSkills)

  const featuredProjects = projectsState.data?.filter(p => p.featured).length
    ? projectsState.data.filter(p => p.featured).slice(0, 3)
    : projectsState.data?.slice(0, 3) || []

  function handleWebIDESaved() {
    profileState.retry()
    projectsState.retry()
    skillsState.retry()
  }

  return (
    <main>
      {profileState.isLoading || profileState.error ? (
        <HeroSkeleton />
      ) : (
        <>
          <Hero profile={profileState.data} projectCount={projectsState.data?.length} />
          <FrontendProfileEditor profile={profileState.data} onSaved={handleWebIDESaved} />
        </>
      )}

      <section className="section muted">
        <div className="content-shell">
          <header className="section-heading">
            <span>Selected work</span>
            <h2>Dự án nổi bật</h2>
            <p>Các sản phẩm backend và full-stack tiêu biểu</p>
          </header>
          {projectsState.isLoading || projectsState.error ? (
            <CardsSkeleton />
          ) : (
            <>
              <div className="card-grid">
                {featuredProjects.map(p => (
                  <article className="project-card reveal" key={p.id}>
                    <div className="project-cover">
                      <BriefcaseBusiness />
                      <span>{p.featured ? 'Nổi bật' : 'Hoàn thành'}</span>
                    </div>
                    <div className="card-body">
                      <small>{p.technologies}</small>
                      <h3>{p.title}</h3>
                      <p>{p.description?.replace(/<[^>]*>?/gm, '')}</p>
                      <Link to={`/projects/${p.id}`}>Xem chi tiết <ArrowRight /></Link>
                    </div>
                  </article>
                ))}
              </div>
              <div className="center-action">
                <Link className="btn secondary" to="/projects">Xem tất cả dự án</Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <div className="content-shell">
          <header className="section-heading">
            <span>Technical expertise</span>
            <h2>Năng lực kỹ thuật</h2>
            <p>Stack công nghệ đã sử dụng trong backend, dữ liệu và AI</p>
          </header>
          {skillsState.isLoading || skillsState.error ? (
            <CardsSkeleton count={4} />
          ) : (
            <div className="skill-grid">
              {skillGroups.map(([Icon, title]) => {
                const list = getCategorySkills(skillsState.data, title)
                return (
                  <article className="skill-panel reveal" key={title}>
                    <div>
                      <Icon />
                      <h3>{title}</h3>
                    </div>
                    <ul>
                      {list.length === 0 ? (
                        <li style={{ color: '#94a3b8', fontStyle: 'italic', listStyle: 'none' }}>
                          Chưa có kỹ năng
                        </li>
                      ) : (
                        list.map((skillName, i) => (
                          <li key={skillName + i}>{skillName}</li>
                        ))
                      )}
                    </ul>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="cta">
        <div className="content-shell">
          <h2>Sẵn sàng xây dựng điều gì đó hữu ích?</h2>
          <p>Hãy trao đổi về dự án, cơ hội hợp tác hoặc một ý tưởng backend thú vị.</p>
          <div>
            <Link className="btn light" to="/contact">Bắt đầu trò chuyện <ArrowRight /></Link>
            <button className="btn outline-light"><Download />Tải CV</button>
          </div>
        </div>
      </section>
    </main>
  )
}

function Hero({ profile, projectCount = 0 }) {
  return (
    <section className="hero">
      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />
      <div className="content-shell hero-grid">
        <div className="hero-copy reveal">
          <span className="availability"><i />Available for work</span>
          <h1>Xin chào, tôi là<br /><strong>{profile.fullName}</strong></h1>
          <div className="typing-line">{profile.headline}<span /></div>
          <p>{profile.shortBio || plainText(profile.bio)}</p>
          <div className="hero-actions">
            <Link className="btn primary" to="/profile">Xem Profile</Link>
            <Link className="btn secondary" to="/contact">Liên hệ tôi</Link>
            <Link className="btn ghost" to="/work-process">Quá trình làm việc</Link>
          </div>
          <div className="hero-stats">
            <div><b>{projectCount}+</b><span>Dự án</span></div>
            <div><b>4+</b><span>Mảng thực chiến</span></div>
            <div><b>10+</b><span>Công nghệ</span></div>
          </div>
        </div>
        <div className="hero-visual reveal">
          <div className="avatar-ring">
            <div className="avatar">
              <img src={profile.avatarUrl || '/images/user_character.svg'} alt={profile.fullName} />
            </div>
            <span className="float-tag tag-one"><Code2 />Java Developer</span>
            <span className="float-tag tag-two"><Sparkles />AI Agent</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function plainText(html = '') {
  const element = document.createElement('div')
  element.innerHTML = html
  return element.textContent || ''
}
