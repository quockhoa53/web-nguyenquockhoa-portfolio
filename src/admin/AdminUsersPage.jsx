import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  Calendar,
  AlertCircle,
  X,
  Edit2,
  CheckCircle2,
  Sparkles,
  Users,
  Smartphone,
  QrCode,
  Copy,
  Check,
  RotateCcw,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  adminReset2Fa,
  adminMe,
} from '../services/adminApi'
import { useToast } from '../components/common/ToastContext'

export function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [adminInfo, setAdminInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, meData] = await Promise.all([
        getAdminUsers().catch(() => []),
        adminMe().catch(() => null),
      ])
      setUsers(usersData || [])
      setAdminInfo(meData)
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu: ' + (err.message || 'Không xác định'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle Create Admin User
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createAdminUser(createUserForm)
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
      await updateAdminUser(showEditUserModal.id, {
        displayName: editUserForm.displayName,
        enabled: editUserForm.enabled,
        password: editUserForm.password ? editUserForm.password : undefined,
      })
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
      toast.success('Đã xóa tài khoản!')
      loadData()
    } catch (err) {
      toast.error('Lỗi khi xóa: ' + (err.message || 'Không thể xóa'))
    }
  }

  // Handle Reset 2FA
  const handleTriggerReset2Fa = async () => {
    if (!window.confirm('Bạn có muốn tạo lại mã QR 2FA? Mã cũ trên Google Authenticator sẽ không còn dùng được.')) return
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
      toast.success('Đã sao chép khóa bí mật vào clipboard!')
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="admin-page">
      {/* Page Heading */}
      <div className="admin-heading">
        <div>
          <span>Bảo Mật & Quản Trị Hệ Thống</span>
          <h1>Tài Khoản & Xác Thực 2 Lớp (2FA)</h1>
        </div>
        <small>Bảo mật cấp doanh nghiệp với Google Authenticator (RFC 6238 TOTP)</small>
      </div>

      {/* ================= SECTION 1: 2FA TOTP SECURITY CARD ================= */}
      <div className="admin-section-box">
        <div className="admin-section-header">
          <div className="flex items-center gap-2">
            <Smartphone className="text-emerald-500" size={22} />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Xác Thực 2 Lớp Google Authenticator (TOTP 2FA)</h2>
              <p className="text-xs text-slate-500">Mã OTP 6 chữ số sinh động trên điện thoại di động mỗi 30 giây.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={handleTriggerReset2Fa}
              disabled={saving}
            >
              <RotateCcw size={15} />
              <span>Cài đặt lại QR trên điện thoại mới</span>
            </button>
          </div>
        </div>

        {/* 2FA Status Banner */}
        <div className="admin-ip-strip">
          <div className="flex items-center gap-3">
            <div className="admin-ip-icon-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Trạng thái bảo mật Admin: </span>
              <strong className="text-sm text-emerald-700 ml-1">Đang được bảo vệ bằng 2FA TOTP</strong>
            </div>
          </div>
          <span className="admin-badge-active">
            <CheckCircle2 size={13} /> Không phụ thuộc IP mạng · Chống 100% rò rỉ mật khẩu
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-3 text-xs text-slate-600 leading-relaxed">
          💡 <strong>Hướng dẫn:</strong> Khi đăng nhập từ bất kỳ thiết bị hay mạng Wi-Fi/4G nào, sau khi nhập username & password, bạn chỉ cần mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Microsoft Authenticator</strong> trên điện thoại và nhập mã 6 số hiển thị trên màn hình.
        </div>
      </div>

      {/* ================= SECTION 2: ADMIN USERS ================= */}
      <div className="admin-section-box mt-8">
        <div className="admin-section-header">
          <div className="flex items-center gap-2">
            <Users className="text-indigo-600" size={22} />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Danh Sách Tài Khoản Quản Trị Viên</h2>
              <p className="text-xs text-slate-500">Các tài khoản có quyền truy cập và quản lý hệ thống.</p>
            </div>
          </div>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => {
              setCreateUserForm({ username: '', password: '', displayName: '' })
              setShowCreateUserModal(true)
            }}
          >
            <UserPlus size={16} />
            <span>Tạo Admin Mới</span>
          </button>
        </div>

        {/* Users Table */}
        <div className="admin-table-wrap mt-3">
          <table>
            <thead>
              <tr>
                <th>Tài khoản & Tên hiển thị</th>
                <th style={{ width: '130px' }}>Trạng thái</th>
                <th style={{ width: '180px' }}>Ngày tạo</th>
                <th style={{ width: '190px' }}>Đăng nhập gần nhất</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-slate-400">
                    Chưa có tài khoản quản trị nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="admin-user-avatar-sm">
                          {user.displayName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <b className="text-slate-800 text-sm block">{user.displayName}</b>
                          <small className="text-slate-500 font-mono">@{user.username}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.enabled ? (
                        <span className="admin-badge-active">
                          <CheckCircle2 size={12} /> Hoạt động
                        </span>
                      ) : (
                        <span className="admin-badge-locked">
                          <Lock size={12} /> Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="text-slate-500 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}
                    </td>
                    <td className="text-slate-500 text-xs">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : <span className="text-slate-400 italic">Chưa đăng nhập</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="row-actions justify-center">
                        <button
                          title="Sửa thông tin / Đổi mật khẩu"
                          onClick={() => {
                            setEditUserForm({ displayName: user.displayName, enabled: user.enabled, password: '' })
                            setShowEditUserModal(user)
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="danger"
                          title="Xóa tài khoản admin"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: RESET 2FA QR CODE ================= */}
      {showReset2FaModal && reset2FaData && (
        <div className="admin-modal" onClick={() => setShowReset2FaModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center' }}>
            <header>
              <div>
                <span>Cài Đặt Lại Google Authenticator</span>
                <h2>Quét Mã QR 2FA Mới</h2>
              </div>
              <button type="button" onClick={() => setShowReset2FaModal(false)}><X size={18} /></button>
            </header>

            <div style={{ padding: '24px' }}>
              <p className="text-xs text-slate-500 mb-4">
                Mở ứng dụng <strong>Google Authenticator</strong> trên điện thoại ➔ Thêm tài khoản mới ➔ Quét mã QR:
              </p>

              <div className="qr-code-wrapper" style={{ margin: '0 auto 16px', display: 'inline-block' }}>
                <QRCodeSVG
                  value={reset2FaData.otpAuthUri}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#0a0f1d"
                  level="Q"
                  includeMargin
                />
              </div>

              <div className="secret-copy-box" style={{ marginTop: '12px', textAlign: 'left' }}>
                <span className="secret-label">Khóa bí mật thủ công:</span>
                <div className="secret-row">
                  <input
                    type={showResetSecret ? 'text' : 'password'}
                    readOnly
                    value={reset2FaData.totpSecret}
                    className="secret-input font-mono"
                    aria-label="Khóa bí mật 2FA"
                  />
                  <button
                    type="button"
                    className="secret-action-btn"
                    onClick={() => setShowResetSecret(!showResetSecret)}
                    title={showResetSecret ? 'Ẩn mã khóa' : 'Xem mã khóa'}
                  >
                    {showResetSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    type="button"
                    className="secret-action-btn"
                    onClick={handleCopySecret}
                    title="Sao chép khóa bí mật"
                  >
                    {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <footer>
              <button type="button" className="save" onClick={() => setShowReset2FaModal(false)}>
                Đã Quét Xong & Hoàn Tất
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE ADMIN USER ================= */}
      {showCreateUserModal && (
        <div className="admin-modal" onClick={() => setShowCreateUserModal(false)}>
          <form onSubmit={handleCreateUser} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <header>
              <div>
                <span>Bảo Mật Quản Trị</span>
                <h2>Tạo Tài Khoản Admin Mới</h2>
              </div>
              <button type="button" onClick={() => setShowCreateUserModal(false)}><X size={18} /></button>
            </header>

            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr', padding: '20px 24px' }}>
              <label>
                <span>Tên đăng nhập (Username) *</span>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: admin_khoa, assistant_01"
                  value={createUserForm.username}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, username: e.target.value })}
                />
              </label>

              <label>
                <span>Tên hiển thị (Display Name) *</span>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: Nguyễn Quốc Khoa (Admin)"
                  value={createUserForm.displayName}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, displayName: e.target.value })}
                />
              </label>

              <label>
                <span>Mật khẩu đăng nhập *</span>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu mạnh..."
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                />
              </label>
            </div>

            <footer>
              <button type="button" onClick={() => setShowCreateUserModal(false)}>Hủy</button>
              <button type="submit" className="save" disabled={saving}>
                {saving ? 'Đang tạo...' : 'Tạo Tài Khoản'}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/* ================= MODAL: EDIT ADMIN USER ================= */}
      {showEditUserModal && (
        <div className="admin-modal" onClick={() => setShowEditUserModal(null)}>
          <form onSubmit={handleUpdateUser} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <header>
              <div>
                <span>Chỉnh Sửa Tài Khoản</span>
                <h2>@{showEditUserModal.username}</h2>
              </div>
              <button type="button" onClick={() => setShowEditUserModal(null)}><X size={18} /></button>
            </header>

            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr', padding: '20px 24px' }}>
              <label>
                <span>Tên hiển thị *</span>
                <input
                  type="text"
                  required
                  value={editUserForm.displayName}
                  onChange={(e) => setEditUserForm({ ...editUserForm, displayName: e.target.value })}
                />
              </label>

              <label>
                <span>Đổi mật khẩu mới (để trống nếu giữ nguyên)</span>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới nếu muốn thay đổi..."
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                />
              </label>

              <div className="check-field" style={{ paddingTop: '8px' }}>
                <input
                  id="user-enabled"
                  type="checkbox"
                  checked={editUserForm.enabled}
                  onChange={(e) => setEditUserForm({ ...editUserForm, enabled: e.target.checked })}
                />
                <label htmlFor="user-enabled" style={{ cursor: 'pointer', margin: 0 }}>
                  Kích hoạt tài khoản này (Bỏ chọn để khóa đăng nhập)
                </label>
              </div>
            </div>

            <footer>
              <button type="button" onClick={() => setShowEditUserModal(null)}>Hủy</button>
              <button type="submit" className="save" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}
