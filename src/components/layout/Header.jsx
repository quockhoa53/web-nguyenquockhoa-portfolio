import { useEffect, useState } from 'react'
import { BookOpen, BriefcaseBusiness, House, Mail, Menu, Moon, Phone, Route, Sun, X, Sparkles, Search } from 'lucide-react'
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
  const [dark, setDark] = useState(() => localStorage.getItem('portfolio-theme') !== 'light')
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
        <div className="brand-group">
          <NavLink to="/" className="brand" onClick={() => setOpen(false)} title="Nguyễn Quốc Khoa - Trang chủ">
            <div className="brand-mark-wrapper">
              <span className="brand-mark">&lt;/&gt;</span>
            </div>
            <div className="brand-text-col">
              <div className="brand-title">
                <b>NQK</b>
                <span className="brand-dot">·</span>
                <span className="brand-name">Quốc Khoa</span>
              </div>
              <span className="brand-subtitle">Backend &amp; AI Systems</span>
            </div>
          </NavLink>

          <div className="brand-status-badge" title="Sẵn sàng nhận dự án & cơ hội hợp tác">
            <span className="status-pulse-dot">
              <span className="pulse-ring" />
              <span className="pulse-core" />
            </span>
            <span className="status-badge-text">Available for hire</span>
          </div>
        </div>

        <nav className="desktop-nav">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="cmd-trigger-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            title="Tìm kiếm nhanh (Ctrl + K / ⌘K)"
            aria-label="Tìm kiếm nhanh"
          >
            <Search size={14} />
            <span className="cmd-trigger-text">Tìm kiếm</span>
            <kbd className="cmd-trigger-kbd">⌘K</kbd>
          </button>

          <a className="quick-call" href={`tel:${phoneHref}`}>
            <Phone size={15} /> <span>Gọi ngay</span>
          </a>
          <button
            className="icon-btn"
            onClick={() => setDark(!dark)}
            aria-label="Đổi giao diện sáng tối"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            className="icon-btn mobile-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Mở menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mobile-nav">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
