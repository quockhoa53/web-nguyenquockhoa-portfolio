import { useState, useEffect, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  X,
  Edit2,
  CheckCircle2,
  Users,
  Smartphone,
  Copy,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Layers,
  KeyRound
} from 'lucide-react'
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  adminReset2Fa,
} from '../services/adminApi'
import { useToast } from '../components/common/ToastContext'
import { AdminPagination } from './components/AdminPagination'
import { AdminStatusBadge } from './components/AdminStatusBadge'

export function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Modals state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(null)
  const [showReset2FaModal, setShowReset2FaModal] = useState(false)
  const [showResetSecret, setShowResetSecret] = useState(false)
  const [reset2FaData, setReset2FaData] = useState(null)
  const [copied, setCopied] = useState(false)

  // Forms state
  const [createUserForm, setCreateUserForm] = useState({ username: '', password: '', displayName: '' })
  const [editUserForm, setEditUserForm] = useState({ displayName: '', password: '', enabled: true })

  const toast = useToast()

  const loadData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setLoading(true)

    try {
      const usersData = await getAdminUsers().catch(() => [])
      setUsers(usersData || [])
      if (isManual) toast.success('Đã làm mới danh sách Quản trị viên!')
    } catch (err) {
      toast.error('Lỗi khi tải danh sách: ' + (err.message || 'Không xác định'))
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return users.slice(start, start + pageSize)
  }, [users, currentPage, pageSize])

  // Handle Create Admin User
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await createAdminUser(createUserForm)
      setUsers(prev => [created || { ...createUserForm, id: Date.now() }, ...prev])
      toast.success('Tạo tài khoản quản trị thành công!')
      setShowCreateUserModal(false)
      setCreateUserForm({ username: '', password: '', displayName: '' })
      loadData()
    } catch (err) {
      toast.error('Lỗi tạo tài khoản: ' + (err.message || 'Thất bại'))
    } finally {
      setSaving(false)
    }
  }

  // Handle Update Admin User
  const handleUpdateUser = async (e) => {
    e.preventDefault()
    if (!showEditUserModal) return
    setSaving(true)
    try {
      const updated = await updateAdminUser(showEditUserModal.id, {
        displayName: editUserForm.displayName,
        enabled: editUserForm.enabled,
        password: editUserForm.password ? editUserForm.password : undefined,
      })
      setUsers(prev => prev.map(u => u.id === showEditUserModal.id ? { ...u, ...editUserForm, ...(updated || {}) } : u))
      toast.success('Cập nhật tài khoản thành công!')
      setShowEditUserModal(null)
      loadData()
    } catch (err) {
      toast.error('Lỗi cập nhật: ' + (err.message || 'Thất bại'))
    } finally {
      setSaving(false)
    }
  }

  // Handle Delete Admin User
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.displayName}" (@${user.username})?`)) return
    try {
      await deleteAdminUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
      toast.success('Đã xóa tài khoản thành công!')
      loadData()
    } catch (err) {
      toast.error('Lỗi khi xóa: ' + (err.message || 'Không thể xóa'))
    }
  }

  // Handle Reset 2FA
  const handleTriggerReset2Fa = async () => {
    if (!window.confirm('Bạn có muốn tạo lại mã QR 2FA? Mã trên ứng dụng cũ sẽ không còn dùng được.')) return
    setSaving(true)
    try {
      const res = await adminReset2Fa()
      setReset2FaData(res)
      setShowReset2FaModal(true)
      toast.success('Đã tạo mã QR 2FA mới!')
    } catch (err) {
      toast.error('Lỗi tạo lại 2FA: ' + (err.message || 'Thất bại'))
    } finally {
      setSaving(false)
    }
  }

  const handleCopySecret = () => {
    if (reset2FaData?.totpSecret) {
      navigator.clipboard.writeText(reset2FaData.totpSecret)
      setCopied(true)
      toast.success('Đã sao chép khóa bí mật!')
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="admin-page">
      {/* Page Heading */}
      <div className="admin-heading">
        <div className="admin-heading-left">
          <span className="admin-badge-category">
            <ShieldCheck size={11} /> BẢO MẬT &amp; PHÂN QUYỀN
          </span>
          <h1>Quản Trị Viên &amp; Xác Thực 2FA</h1>
        </div>

        <div className="admin-heading-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => loadData(true)}
            disabled={isRefreshing || loading}
            title="Làm mới danh sách"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => {
              setCreateUserForm({ username: '', password: '', displayName: '' })
              setShowCreateUserModal(true)
            }}
          >
            <UserPlus size={15} />
            <span>Tạo Admin Mới</span>
          </button>
        </div>
      </div>

      {/* 2FA Security Banner Card */}
      <div className="admin-2fa-card">
        <div className="admin-2fa-info">
          <div className="admin-2fa-icon-circle">
            <KeyRound size={22} />
          </div>
          <div>
            <div className="admin-2fa-title-row">
              <h3>Xác Thực 2 Lớp (Google Authenticator 2FA)</h3>
              <AdminStatusBadge status="ACTIVE" label="Đang kích hoạt" />
            </div>
            <p>Mã OTP 6 số bảo vệ toàn diện, chống truy cập trái phép ngay cả khi lộ mật khẩu.</p>
          </div>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={handleTriggerReset2Fa}
          disabled={saving}
        >
          <RotateCcw size={14} />
          <span>Tạo lại mã QR trên máy mới</span>
        </button>
      </div>

      {/* Admin Users Table Box */}
      <div className="admin-table-container">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: 'center' }}>STT</th>
                <th>Tài khoản &amp; Tên hiển thị</th>
                <th style={{ width: 130, textAlign: 'center' }}>Trạng thái</th>
                <th style={{ width: 140 }}>Ngày tạo</th>
                <th style={{ width: 160 }}>Đăng nhập gần nhất</th>
                <th style={{ width: 100, textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-empty-table-cell">
                    <Sparkles size={28} className="empty-icon" />
                    <strong>Chưa có tài khoản quản trị nào</strong>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => {
                  const stt = (currentPage - 1) * pageSize + index + 1
                  return (
                    <tr key={user.id} className="admin-table-row">
                      <td className="stt-cell">
                        <span className="stt-number">{stt}</span>
                      </td>
                      <td className="main-content-cell">
                        <div className="admin-user-avatar-row">
                          <div className="admin-user-avatar-circle">
                            {user.displayName?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <strong className="cell-title">{user.displayName || user.username}</strong>
                            <span className="cell-subtitle">@{user.username}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <AdminStatusBadge status={user.enabled !== false ? 'ACTIVE' : 'INACTIVE'} />
                      </td>
                      <td>
                        <span className="date-pill">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="date-pill">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="row-btn edit"
                            onClick={() => {
                              setShowEditUserModal(user)
                              setEditUserForm({
                                displayName: user.displayName || '',
                                password: '',
                                enabled: user.enabled !== false,
                              })
                            }}
                            title="Sửa thông tin"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="row-btn danger"
                            onClick={() => handleDeleteUser(user)}
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          currentPage={currentPage}
          totalItems={users.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setCurrentPage(1)
          }}
        />
      </div>

      {/* Modal Create Admin */}
      {showCreateUserModal && (
        <div className="admin-modal-backdrop" onClick={() => !saving && setShowCreateUserModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateUser}>
              <header className="modal-header">
                <div>
                  <span className="modal-tag">USER ACCESS</span>
                  <h2>Tạo Tài Khoản Admin Mới</h2>
                </div>
                <button type="button" className="modal-close-btn" onClick={() => setShowCreateUserModal(false)}>
                  <X size={18} />
                </button>
              </header>

              <div className="modal-body">
                <div className="admin-form-grid-modern">
                  <div className="form-field-group full-width">
                    <label className="field-label"><span>Tên hiển thị *</span></label>
                    <input
                      className="admin-text-input"
                      type="text"
                      placeholder="vd: Nguyễn Quốc Khoa"
                      value={createUserForm.displayName}
                      onChange={e => setCreateUserForm({ ...createUserForm, displayName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field-group full-width">
                    <label className="field-label"><span>Tên đăng nhập (Username) *</span></label>
                    <input
                      className="admin-text-input"
                      type="text"
                      placeholder="vd: admin_khoa"
                      value={createUserForm.username}
                      onChange={e => setCreateUserForm({ ...createUserForm, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field-group full-width">
                    <label className="field-label"><span>Mật khẩu khởi tạo *</span></label>
                    <input
                      className="admin-text-input"
                      type="password"
                      placeholder="Nhập mật khẩu an toàn (tối thiểu 8 ký tự)"
                      value={createUserForm.password}
                      onChange={e => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setShowCreateUserModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="modal-btn-save" disabled={saving}>
                  {saving ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Admin */}
      {showEditUserModal && (
        <div className="admin-modal-backdrop" onClick={() => !saving && setShowEditUserModal(null)}>
          <div className="admin-modal-card" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleUpdateUser}>
              <header className="modal-header">
                <div>
                  <span className="modal-tag">USER ACCESS</span>
                  <h2>Sửa Tài Khoản @{showEditUserModal.username}</h2>
                </div>
                <button type="button" className="modal-close-btn" onClick={() => setShowEditUserModal(null)}>
                  <X size={18} />
                </button>
              </header>

              <div className="modal-body">
                <div className="admin-form-grid-modern">
                  <div className="form-field-group full-width">
                    <label className="field-label"><span>Tên hiển thị</span></label>
                    <input
                      className="admin-text-input"
                      type="text"
                      value={editUserForm.displayName}
                      onChange={e => setEditUserForm({ ...editUserForm, displayName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field-group full-width">
                    <label className="field-label"><span>Mật khẩu mới (để trống nếu không đổi)</span></label>
                    <input
                      className="admin-text-input"
                      type="password"
                      placeholder="••••••••"
                      value={editUserForm.password}
                      onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })}
                    />
                  </div>

                  <div className="form-field-group full-width">
                    <label className="admin-checkbox-card">
                      <input
                        type="checkbox"
                        checked={editUserForm.enabled}
                        onChange={e => setEditUserForm({ ...editUserForm, enabled: e.target.checked })}
                      />
                      <span className="checkbox-text">
                        <strong>Kích hoạt tài khoản</strong>
                        <small>Cho phép đăng nhập vào hệ thống quản trị</small>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setShowEditUserModal(null)}>
                  Hủy
                </button>
                <button type="submit" className="modal-btn-save" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset 2FA QR */}
      {showReset2FaModal && reset2FaData && (
        <div className="admin-modal-backdrop" onClick={() => setShowReset2FaModal(false)}>
          <div className="admin-modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <div>
                <span className="modal-tag">2FA AUTHENTICATOR</span>
                <h2>Quét Mã QR 2FA Mới</h2>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowReset2FaModal(false)}>
                <X size={18} />
              </button>
            </header>

            <div className="modal-body text-center" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>
                Mở ứng dụng <b>Google Authenticator</b> hoặc <b>Authy</b> trên điện thoại để quét mã bên dưới:
              </p>

              <div style={{ display: 'inline-block', padding: 14, background: '#ffffff', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
                <QRCodeSVG value={reset2FaData.qrCodeUrl || ''} size={190} />
              </div>

              <div style={{ marginTop: 18, background: '#1e293b', padding: '12px 16px', borderRadius: 10 }}>
                <small style={{ color: '#94a3b8', display: 'block', marginBottom: 4 }}>Khóa bí mật thủ công (Secret Key):</small>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <code style={{ color: '#10b981', fontWeight: 700, letterSpacing: '0.1em' }}>
                    {showResetSecret ? reset2FaData.totpSecret : '•••• •••• •••• ••••'}
                  </code>
                  <button
                    type="button"
                    onClick={() => setShowResetSecret(!showResetSecret)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showResetSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    style={{ background: 'none', border: 'none', color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer' }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <footer className="modal-footer">
              <button type="button" className="modal-btn-save" style={{ width: '100%' }} onClick={() => setShowReset2FaModal(false)}>
                Hoàn tất &amp; Đóng
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
