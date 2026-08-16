import { useEffect, useState } from 'react'
import { BookOpen, BriefcaseBusiness, House, Mail, Menu, Moon, Phone, Route, Sun, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useApiResource } from '../../hooks/useApiResource'
import { getProfile } from '../../services/portfolioApi'

const links = [
  ['/', 'Trang chủ', House],
  ['/projects', 'Dự án', BriefcaseBusiness],
  ['/knowledge', 'Kiến thức', BookOpen],
  ['/work-process', 'Quá trình làm việc', Route],
  ['/contact', 'Liên hệ', Mail],
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('portfolio-theme') === 'dark')
  const profileState = useApiResource(getProfile)

  const phone = profileState.data?.phone || '0969 895 549'
  const phoneHref = phone.replace(/\s+/g, '')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <header className="site-header">
      <div className="nav-shell">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">&lt;/&gt;</span>
          <span>
            <b>NQK</b>
            <small>Backend Portfolio</small>
          </span>
        </NavLink>

        <nav className="desktop-nav">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <a className="quick-call" href={`tel:${phoneHref}`}>
            <Phone size={16} /> Gọi ngay
          </a>
          <button
            className="icon-btn"
            onClick={() => setDark(!dark)}
            aria-label="Đổi giao diện sáng tối"
          >
            {dark ? <Sun /> : <Moon />}
          </button>
          <button
            className="icon-btn mobile-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Mở menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mobile-nav">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
