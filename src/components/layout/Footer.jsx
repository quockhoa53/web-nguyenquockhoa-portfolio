import { ArrowUpCircle, BriefcaseBusiness as Linkedin, Code2 as Github, Mail, MapPin, Phone, Users as Facebook } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApiResource } from '../../hooks/useApiResource'
import { getProfile } from '../../services/portfolioApi'

export function Footer() {
  const profileState = useApiResource(getProfile)
  const profile = profileState.data || {
    fullName: 'Nguyễn Quốc Khoa',
    email: 'hello@example.com',
    phone: '0969 895 549',
    location: 'Đồng Tháp, Việt Nam',
    githubUrl: 'https://github.com/',
    linkedinUrl: 'https://linkedin.com/',
    facebookUrl: 'https://facebook.com/'
  }

  const phoneHref = (profile.phone || '0969895549').replace(/\s+/g, '')

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            NQK<span>Portfolio</span>
          </div>
          <p>
            Cảm ơn bạn đã ghé thăm portfolio. Hãy kết nối nếu bạn có dự án thú vị hoặc cơ hội muốn hợp tác!
          </p>
          <div className="social-row">
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" aria-label="Github">
                <Github />
              </a>
            )}
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Linkedin />
              </a>
            )}
            {profile.facebookUrl && (
              <a href={profile.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3>Liên kết nhanh</h3>
          <div className="footer-links">
            <Link to="/">Trang chủ</Link>
            <Link to="/projects">Dự án</Link>
            <Link to="/knowledge">Kho kiến thức</Link>
            <Link to="/work-process">Quá trình làm việc</Link>
            <Link to="/contact">Liên hệ</Link>
          </div>
        </div>

        <div>
          <h3>Liên hệ</h3>
          <div className="footer-contact">
            {profile.location && (
              <span>
                <MapPin /> {profile.location}
              </span>
            )}
            {profile.phone && (
              <a href={`tel:${phoneHref}`}>
                <Phone /> {profile.phone}
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`}>
                <Mail /> {profile.email}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {profile.fullName || 'Nguyễn Quốc Khoa'}. Thiết kế & phát triển bởi chính chủ.
        </span>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ArrowUpCircle /> Lên đầu trang
        </button>
      </div>
    </footer>
  )
}
