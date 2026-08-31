import { ArrowUpCircle, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FacebookIcon, GithubIcon, LinkedInIcon, TikTokIcon, ZaloIcon } from '../common/BrandIcons'
import { useApiResource } from '../../hooks/useApiResource'
import { getProfile } from '../../services/portfolioApi'

export function Footer() {
  const profileState = useApiResource(getProfile)
  const profile = profileState.data || {
    fullName: 'Nguyễn Quốc Khoa',
    email: 'hello@example.com',
    phone: '0969 895 549',
    location: 'Đồng Tháp, Việt Nam',
    githubUrl: 'https://github.com/quockhoa53',
    linkedinUrl: 'https://linkedin.com/in/quockhoa53',
    facebookUrl: 'https://facebook.com/nguyenquockhoa5549',
    tiktokUrl: 'https://tiktok.com/@nguyenquockhoa.dev',
    zaloUrl: 'https://zalo.me/0969895549'
  }

  const phoneHref = (profile.phone || '0969895549').replace(/\s+/g, '')
  const githubLink = profile.githubUrl || 'https://github.com/quockhoa53'
  const linkedinLink = profile.linkedinUrl || 'https://linkedin.com/in/quockhoa53'
  const facebookLink = profile.facebookUrl || 'https://facebook.com/nguyenquockhoa5549'
  const tiktokLink = profile.tiktokUrl || 'https://tiktok.com/@nguyenquockhoa.dev'
  const zaloLink = profile.zaloUrl || `https://zalo.me/${phoneHref}`

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link to="/" className="footer-brand" title="Trang chủ">
            <img src="/logo.png" alt="NQK Logo" className="footer-logo-img" />
          </Link>
          <p>
            Cảm ơn bạn đã ghé thăm portfolio. Hãy kết nối nếu bạn có dự án thú vị hoặc cơ hội muốn hợp tác!
          </p>
          <div className="social-row">
            {facebookLink && (
              <a
                href={facebookLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="social-facebook"
                title="Facebook: Nguyễn Quốc Khoa"
              >
                <FacebookIcon size={20} />
              </a>
            )}
            {linkedinLink && (
              <a
                href={linkedinLink}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="social-linkedin"
                title="LinkedIn: Nguyễn Quốc Khoa"
              >
                <LinkedInIcon size={20} />
              </a>
            )}
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="social-github"
                title="GitHub: quockhoa53"
              >
                <GithubIcon size={20} />
              </a>
            )}
            {tiktokLink && (
              <a
                href={tiktokLink}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="social-tiktok"
                title="TikTok: @nguyenquockhoa.dev"
              >
                <TikTokIcon size={20} />
              </a>
            )}
            {zaloLink && (
              <a
                href={zaloLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Zalo"
                className="social-zalo"
                title="Zalo: 0969 895 549"
              >
                <ZaloIcon size={20} />
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
