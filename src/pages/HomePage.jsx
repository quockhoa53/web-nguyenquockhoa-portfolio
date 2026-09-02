import { useEffect, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, Code2, Download, Layers3, Server, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CardsSkeleton, HeroSkeleton } from '../components/common/Skeletons'
import { TiltCard } from '../components/common/TiltCard'
import { SkillsCategoryGrid } from '../components/portfolio/SkillsCategoryGrid'
import { useApiResource } from '../hooks/useApiResource'
import { getProfile, getProjects, getSkills } from '../services/portfolioApi'
import { FrontendProfileEditor } from '../admin/FrontendProfileEditor'

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
                  <TiltCard className="project-card reveal" key={p.id}>
                    <div className="project-cover">
                      <BriefcaseBusiness />
                      <span>{p.featured ? 'Nổi bật' : 'Hoàn thành'}</span>
                    </div>
                    <div className="card-body">
                      <small>{p.technologies}</small>
                      <h3>{p.title}</h3>
                      <p>{p.summary || (p.description?.replace(/<[^>]*>?/gm, '').slice(0, 140) + '…')}</p>
                      <Link to={`/projects/${p.id}`}>Xem chi tiết <ArrowRight /></Link>
                    </div>
                  </TiltCard>
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
            <SkillsCategoryGrid skills={skillsState.data} />
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
  const [greetingText, setGreetingText] = useState('')
  const [nameText, setNameText] = useState('')
  const [roleText, setRoleText] = useState('')
  const [typingStage, setTypingStage] = useState(0) // 0: Greeting, 1: Name, 2: Role
  const [visibleTagsCount, setVisibleTagsCount] = useState(0) // 0: None, 1: Java, 2: AI, 3: Microservices, 4: Clean Arch

  const fullGreeting = 'Xin chào, tôi là'
  const fullName = profile.fullName || 'Nguyễn Quốc Khoa'
  const fullRole = profile.headline || 'Full-stack Developer'

  // Typewriter effect sequence
  useEffect(() => {
    let timer

    if (typingStage === 0) {
      if (greetingText.length < fullGreeting.length) {
        timer = setTimeout(() => {
          setGreetingText(fullGreeting.slice(0, greetingText.length + 1))
        }, 45)
      } else {
        timer = setTimeout(() => setTypingStage(1), 180)
      }
    } else if (typingStage === 1) {
      if (nameText.length < fullName.length) {
        timer = setTimeout(() => {
          setNameText(fullName.slice(0, nameText.length + 1))
        }, 55)
      } else {
        timer = setTimeout(() => setTypingStage(2), 220)
      }
    } else if (typingStage === 2) {
      if (roleText.length < fullRole.length) {
        timer = setTimeout(() => {
          setRoleText(fullRole.slice(0, roleText.length + 1))
        }, 45)
      }
    }

    return () => clearTimeout(timer)
  }, [greetingText, nameText, roleText, typingStage, fullGreeting, fullName, fullRole])

  // Sequential Circular Tag Reveal
  useEffect(() => {
    const t1 = setTimeout(() => setVisibleTagsCount(1), 600)
    const t2 = setTimeout(() => setVisibleTagsCount(2), 1300)
    const t3 = setTimeout(() => setVisibleTagsCount(3), 2000)
    const t4 = setTimeout(() => setVisibleTagsCount(4), 2700)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  return (
    <section className="hero">
      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />
      <div className="content-shell hero-grid">
        <div className="hero-copy reveal">
          <span className="availability"><i />Available for work</span>
          
          <h1 className="hero-typewriter-title">
            <span>{greetingText}</span>
            {typingStage === 0 && <span className="typewriter-cursor">|</span>}
            <br />
            {typingStage >= 1 && (
              <>
                <strong>{nameText}</strong>
                {typingStage === 1 && <span className="typewriter-cursor">|</span>}
              </>
            )}
          </h1>

          <div className="typing-line">
            {typingStage >= 2 && (
              <>
                <span>{roleText}</span>
                <span className="typewriter-cursor">_</span>
              </>
            )}
          </div>

          <p>{profile.shortBio || plainText(profile.bio)}</p>

          <div className="hero-actions">
            <Link className="btn primary" to="/profile">Xem Profile</Link>
            <Link className="btn secondary" to="/contact">Liên hệ tôi</Link>
            <Link className="btn ghost" to="/work-process">Quá trình làm việc</Link>
          </div>

          <div className="hero-stats">
            <div>
              <AnimatedCounter end={projectCount || 5} duration={1600} />
              <span>Dự án</span>
            </div>
            <div>
              <AnimatedCounter end={4} duration={1600} />
              <span>Mảng thực chiến</span>
            </div>
            <div>
              <AnimatedCounter end={10} duration={1600} />
              <span>Công nghệ</span>
            </div>
          </div>
        </div>

        <div className="hero-visual reveal">
          <div className="avatar-ring">
            <div className="avatar">
              <img src={profile.avatarUrl || '/images/user_character.svg'} alt={profile.fullName} />
            </div>

            {visibleTagsCount >= 1 && (
              <span className="float-tag tag-one pop-tag">
                <Code2 /> Java Developer
              </span>
            )}

            {visibleTagsCount >= 2 && (
              <span className="float-tag tag-two pop-tag">
                <Sparkles /> AI Agent
              </span>
            )}

            {visibleTagsCount >= 3 && (
              <span className="float-tag tag-three pop-tag">
                <Server /> Microservices
              </span>
            )}

            {visibleTagsCount >= 4 && (
              <span className="float-tag tag-four pop-tag">
                <Layers3 /> Clean Architecture
              </span>
            )}
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

function AnimatedCounter({ end, duration = 1600, suffix = '+' }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp = null
    const target = Number(end) || 0
    if (target <= 0) {
      setCount(0)
      return
    }

    let animationFrameId
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const elapsed = timestamp - startTimestamp
      const progress = Math.min(elapsed / duration, 1)
      // Smooth ease-out cubic curve
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * target))

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }

    animationFrameId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [end, duration])

  return <b>{count}{suffix}</b>
}
