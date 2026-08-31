import { Mail, MapPin, Phone } from 'lucide-react'
import { FacebookIcon } from '../components/common/BrandIcons'
import { PageHero } from '../components/common/PageHero'
import { ContactSection } from '../features/contact/ContactSection'
import { useApiResource } from '../hooks/useApiResource'
import { getProfile } from '../services/portfolioApi'

export function ContactPage() {
  const profileState = useApiResource(getProfile)
  const profile = profileState.data || {
    fullName: 'Nguyễn Quốc Khoa',
    email: 'hello@example.com',
    phone: '0969 895 549',
    location: 'Đồng Tháp, Việt Nam',
    facebookUrl: 'https://facebook.com/nguyenquockhoa5549',
    githubUrl: 'https://github.com/quockhoa53',
    linkedinUrl: 'https://linkedin.com/in/quockhoa53'
  }

  return (
    <main>
      <PageHero
        eyebrow="Get in touch"
        title="Liên hệ với tôi"
        description="Hãy gửi tin nhắn hoặc kết nối trực tiếp qua các kênh liên lạc bên dưới, tôi sẽ phản hồi sớm nhất có thể."
        tone="rose"
        icon={Mail}
        image="/images/projects_3d_cover.png"
      />

      <section className="contact-strip-section">
        <div className="content-shell contact-info-strip">
          {profile.phone && (
            <a href={`tel:${profile.phone.replace(/\s+/g, '')}`} title="Gọi điện">
              <Phone />
              <span>
                <small>Điện thoại</small>
                {profile.phone}
              </span>
            </a>
          )}

          {profile.email && (
            <a href={`mailto:${profile.email}`} title="Gửi email">
              <Mail />
              <span>
                <small>Email</small>
                {profile.email}
              </span>
            </a>
          )}

          {profile.location && (
            <span>
              <MapPin />
              <span>
                <small>Địa chỉ</small>
                {profile.location}
              </span>
            </span>
          )}

          {profile.facebookUrl && (
            <a href={profile.facebookUrl} target="_blank" rel="noreferrer" title="Facebook cá nhân">
              <FacebookIcon size={18} />
              <span>
                <small>Facebook</small>
                {profile.fullName || 'Nguyễn Quốc Khoa'}
              </span>
            </a>
          )}
        </div>
      </section>

      <ContactSection profile={profile} />
    </main>
  )
}
