import { useEffect, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  FolderKanban,
  Heart,
  LogOut,
  Mail,
  MessageSquare,
  Route,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Compass,
  Zap,
  Globe,
  Sun,
  Moon,
  Palette,
  Check
} from 'lucide-react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { adminLogout, adminMe } from '../services/adminApi'
import { ErrorBoundary } from '../components/common/ErrorBoundary'

const NAV_SECTIONS = [
  {
    group: 'TỔNG QUAN',
    items: [
      ['', 'Dashboard', BarChart3],
      ['users', 'Quản trị viên & 2FA', ShieldCheck],
      ['resumes', 'Quản lý CV & Cloud', FileText],
    ]
  },
  {
    group: 'HỒ SƠ & KINH NGHIỆM',
    items: [
      ['profile', 'Thông tin Profile', UserRound],
      ['skills', 'Năng lực kỹ thuật', BriefcaseBusiness],
      ['experiences', 'Kinh nghiệm làm việc', Route],
      ['work-items', 'Quá trình làm việc', Compass],
    ]
  },
  {
    group: 'DỰ ÁN & BÀI VIẾT',
    items: [
      ['projects', 'Dự án tiêu biểu', FolderKanban],
      ['categories', 'Danh mục kiến thức', BookOpen],
      ['articles', 'Bài viết kiến thức', FileText],
      ['ai-facts', 'Bộ nhớ AI Assistant', Sparkles],
    ]
  },
  {
    group: 'TƯƠNG TÁC & LIÊN HỆ',
    items: [
      ['comments', 'Kiểm duyệt bình luận', MessageSquare],
      ['likes', 'Lượt yêu thích', Heart],
      ['contacts', 'Tin nhắn liên hệ', Mail],
      ['guests', 'Khách truy cập', Users],
    ]
  }
]

const PALETTES = [
  { id: 'purple', name: 'Electric Violet (Tím Neon Pro)', color: '#a855f7', bg: '#09090e' },
  { id: 'gold', name: 'Cyber Gold (Vàng Ánh Kim)', color: '#f59e0b', bg: '#0c0b08' },
  { id: 'cyan', name: 'Ice Cyan (Xanh Băng Sapphire)', color: '#06b6d4', bg: '#060d14' },
  { id: 'rose', name: 'Crimson Ruby (Đỏ Hồng Ruby)', color: '#f43f5e', bg: '#0f080b' },
  { id: 'emerald', name: 'Deep Emerald (Ngọc Lục Bảo)', color: '#10b981', bg: '#060f0c' }
]

export function AdminLayout() {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(() => localStorage.getItem('portfolio-theme') !== 'light')
  const [palette, setPalette] = useState(() => localStorage.getItem('admin-color-palette') || 'purple')
  const [showPaletteMenu, setShowPaletteMenu] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    localStorage.setItem('admin-color-palette', palette)
  }, [palette])

  useEffect(() => {
    adminMe()
      .then(setAdmin)
      .catch(() => setAdmin(false))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
      </div>
    )
  }
  if (!admin) return <Navigate to="/admin/login" replace />

  async function logout() {
    await adminLogout().catch(() => { })
    navigate('/admin/login')
  }

  return (
    <div className="admin-app" data-palette={palette}>
      {/* Luxury Sidebar */}
      <aside className="admin-sidebar">
        {/* Brand Header */}
        <div className="admin-logo">
          <div className="admin-logo-monogram">
            <Zap size={18} />
          </div>
          <div className="admin-logo-meta">
            <b>NQK Admin Pro</b>
            <small>Workspace &amp; Content Engine</small>
          </div>
        </div>

        {/* Grouped Nav Items */}
        <nav className="admin-nav-list">
          {NAV_SECTIONS.map((section) => (
            <div key={section.group} className="admin-nav-group">
              <span className="admin-nav-label">{section.group}</span>
              {section.items.map(([to, label, Icon]) => (
                <NavLink
                  end={to === ''}
                  key={label}
                  to={to}
                  className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  <span className="active-glow-indicator" />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User Footer Card */}
        <div className="admin-account">
          <div className="admin-avatar">
            {admin.displayName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="admin-user-info">
            <b>{admin.displayName}</b>
            <small>@{admin.username}</small>
          </div>
          <button onClick={logout} className="admin-logout-btn" title="Đăng xuất khỏi hệ thống">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-topbar-tag">Admin Console</span>
            <b>Hệ thống Quản trị Nội dung &amp; Trí tuệ Nhân tạo</b>
          </div>

          <div className="admin-topbar-actions">
            {/* Color Palette Switcher */}
            <div className="palette-picker-wrap">
              <button
                type="button"
                className="admin-palette-btn"
                onClick={() => setShowPaletteMenu(!showPaletteMenu)}
                title="Đổi phong cách màu sắc giao diện"
              >
                <Palette size={15} />
                <span className="palette-color-dot" style={{ background: PALETTES.find(p => p.id === palette)?.color }} />
                <span>Màu giao diện</span>
              </button>

              {showPaletteMenu && (
                <div className="palette-dropdown-menu" onClick={e => e.stopPropagation()}>
                  <div className="palette-dropdown-header">
                    <span>CHỌN TÔNG MÀU QUẢN TRỊ</span>
                  </div>
                  <div className="palette-options-list">
                    {PALETTES.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className={`palette-opt-btn ${palette === p.id ? 'active' : ''}`}
                        onClick={() => {
                          setPalette(p.id)
                          setShowPaletteMenu(false)
                        }}
                      >
                        <span className="opt-color-circle" style={{ background: p.color }} />
                        <span className="opt-name">{p.name}</span>
                        {palette === p.id && <Check size={14} className="opt-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button (Light / Dark) */}
            <button
              type="button"
              className="admin-theme-toggle-btn"
              onClick={() => setDark(!dark)}
              title={dark ? 'Chuyển sang Giao diện Sáng (Light Mode)' : 'Chuyển sang Giao diện Tối Độc Bản (Dark Mode)'}
            >
              {dark ? <Sun size={15} className="theme-icon sun" /> : <Moon size={15} className="theme-icon moon" />}
              <span className="theme-text">{dark ? 'Chế độ Sáng' : 'Chế độ Tối'}</span>
            </button>

            <div className="system-live-pill">
              <span className="live-dot" />
              <span>Production Live</span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="view-site-btn"
              title="Xem trang Portfolio ngoài client"
            >
              <Globe size={14} />
              <span>Xem trang chủ</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </header>

        {/* Workspace Body */}
        <section className="admin-workspace" onClick={() => showPaletteMenu && setShowPaletteMenu(false)}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </section>
      </div>
    </div>
  )
}
