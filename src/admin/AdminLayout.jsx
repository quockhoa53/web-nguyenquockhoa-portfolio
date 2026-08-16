import { useEffect, useState } from 'react'
import { BarChart3, BookOpen, BriefcaseBusiness, ExternalLink, FolderKanban, Heart, LogOut, Mail, MessageSquare, Route, ShieldCheck, Sparkles, UserRound, Users } from 'lucide-react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { adminLogout, adminMe, checkAdminAccess } from '../services/adminApi'
import { AdminAccessDenied } from './AdminAccessDenied'
import { ErrorBoundary } from '../components/common/ErrorBoundary'

const links = [
  ['', 'Dashboard', BarChart3],
  ['users', 'Tài khoản & IP', ShieldCheck],
  ['profile', 'Profile', UserRound],
  ['skills', 'Năng lực kỹ thuật', BriefcaseBusiness],
  ['experiences', 'Kinh nghiệm', Route],
  ['projects', 'Dự án', FolderKanban],
  ['categories', 'Danh mục', BookOpen],
  ['articles', 'Kiến thức', BookOpen],
  ['work-items', 'Quá trình làm việc', Route],
  ['comments', 'Bình luận', MessageSquare],
  ['likes', 'Lượt yêu thích', Heart],
  ['contacts', 'Liên hệ', Mail],
  ['guests', 'Khách truy cập', Users],
]

export function AdminLayout() {
  const [admin, setAdmin] = useState(null)
  const [access, setAccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminAccess()
      .then(result => {
        setAccess(result)
        if (!result.allowed) return null
        return adminMe().then(setAdmin).catch(() => setAdmin(false))
      })
      .catch(() => setAccess({ allowed: false, ip: 'Không xác định' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-loading">Đang kiểm tra phiên quản trị…</div>
  if (!access?.allowed) return <AdminAccessDenied ip={access?.ip} />
  if (!admin) return <Navigate to="/admin/login" replace />

  async function logout() {
    await adminLogout().catch(() => { })
    navigate('/admin/login')
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>&lt;/&gt;</span>
          <div><b>NQK Admin</b><small>Portfolio workspace</small></div>
        </div>

        <div className="admin-nav-label">Workspace</div>
        <nav>
          {links.map(([to, label, Icon]) => (
            <NavLink end={to === ''} key={label} to={to}>
              <Icon /><span>{label}</span><i />
            </NavLink>
          ))}
        </nav>

        <div className="admin-account">
          <div className="admin-avatar">{admin.displayName?.charAt(0)?.toUpperCase() || 'A'}</div>
          <div><b>{admin.displayName}</b><small>@{admin.username}</small></div>
          <button onClick={logout} title="Đăng xuất"><LogOut /></button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar-tag">Admin Mode</span>
            <b>Trang quản trị danh mục &amp; nội dung</b>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-topbar-ip">IP: {access.ip}</span>
            <a href="/" target="_blank" rel="noreferrer"><ExternalLink /><span>Xem trang chủ</span></a>
          </div>
        </header>

        <section className="admin-workspace">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </section>
      </div>
    </div>
  )
}
