import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Lock,
  Unlock,
  Plus,
  Globe,
  Wifi,
  Clock,
  Calendar,
  AlertCircle,
  X,
  Edit2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  addAdminUserIp,
  deleteAdminUserIp,
  checkAdminAccess,
} from '../services/adminApi'
import { useToast } from '../components/common/ToastContext'

export function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [currentIp, setCurrentIp] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(null)
  const [showAddIpModal, setShowAddIpModal] = useState(null)

  // Forms state
  const [createForm, setCreateForm] = useState({ username: '', password: '', displayName: '', allowedIps: '' })
  const [editForm, setEditForm] = useState({ displayName: '', password: '', enabled: true })
  const [ipForm, setIpForm] = useState({ ipAddress: '', description: '' })

  const toast = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, accessData] = await Promise.all([
        getAdminUsers(),
        checkAdminAccess().catch(() => ({ ip: '' })),
      ])
      setUsers(usersData || [])
      if (accessData?.ip) setCurrentIp(accessData.ip)
    } catch (err) {
      toast.error('Lỗi khi tải danh sách quản trị viên: ' + (err.message || 'Không xác định'))
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
      await createAdminUser(createForm)
      toast.success('Tạo tài khoản quản trị thành công!')
      setShowCreateModal(false)
      setCreateForm({ username: '', password: '', displayName: '', allowedIps: '' })
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
    if (!showEditModal) return
    setSaving(true)
    try {
      await updateAdminUser(showEditModal.id, {
        displayName: editForm.displayName,
        enabled: editForm.enabled,
        password: editForm.password ? editForm.password : undefined,
      })
      toast.success('Cập nhật tài khoản thành công!')
      setShowEditModal(null)
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

  // Handle Add IP to Admin
  const handleAddIp = async (e) => {
    e.preventDefault()
    if (!showAddIpModal) return
    setSaving(true)
    try {
      await addAdminUserIp(showAddIpModal.id, ipForm)
      toast.success(`Đã thêm IP ${ipForm.ipAddress} cho @${showAddIpModal.username}!`)
      setShowAddIpModal(null)
      setIpForm({ ipAddress: '', description: '' })
      loadData()
    } catch (err) {
      toast.error('Lỗi thêm IP: ' + (err.message || 'Thất bại'))
    } finally {
      setSaving(false)
    }
  }

  // Handle Quick Add Current IP
  const handleQuickAddCurrentIp = async (user) => {
    if (!currentIp) {
      toast.error('Không tìm thấy IP hiện tại của bạn!')
      return
    }
    try {
      await addAdminUserIp(user.id, {
        ipAddress: currentIp,
        description: 'Wi-Fi hiện tại của bạn',
      })
      toast.success(`Đã cấp quyền IP hiện tại (${currentIp}) cho @${user.username}!`)
      loadData()
    } catch (err) {
      toast.error('Lỗi thêm IP: ' + (err.message || 'IP đã tồn tại hoặc lỗi'))
    }
  }

  // Handle Delete IP
  const handleDeleteIp = async (userId, ipId, ipAddress) => {
    if (!window.confirm(`Bạn có chắc muốn xóa quyền truy cập của IP ${ipAddress}?`)) return
    try {
      await deleteAdminUserIp(userId, ipId)
      toast.success(`Đã gỡ quyền IP ${ipAddress}!`)
      loadData()
    } catch (err) {
      toast.error('Lỗi khi xóa IP: ' + (err.message || 'Thất bại'))
    }
  }

  return (
    <div className="admin-content-view">
      {/* Header */}
      <div className="admin-header-flex">
        <div>
          <h2>Quản trị viên & Phân quyền IP</h2>
          <p className="admin-desc">
            Quản lý tài khoản quản trị hệ thống và kiểm soát danh sách địa chỉ IP mạng được phép truy cập (IP Whitelist).
          </p>
        </div>
        <button
          className="admin-btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <UserPlus size={18} />
          <span>Tạo Admin Mới</span>
        </button>
      </div>

      {/* Current IP Banner */}
      <div className="admin-ip-banner">
        <div className="admin-ip-banner-info">
          <Wifi className="text-cyan-400" size={24} />
          <div>
            <div className="font-semibold text-white">Địa chỉ IP mạng của bạn hiện tại:</div>
            <div className="text-cyan-300 font-mono text-base font-bold">{currentIp || 'Đang nhận diện...'}</div>
          </div>
        </div>
        <div className="text-xs text-slate-400 max-w-md">
          Chỉ các thiết bị kết nối vào mạng có IP được cấp quyền trong danh sách dưới đây mới có thể mở trang quản trị.
        </div>
      </div>

      {/* Admin Users Grid */}
      {loading ? (
        <div className="admin-loading">Đang tải danh sách quản trị viên...</div>
      ) : users.length === 0 ? (
        <div className="admin-empty">Chưa có tài khoản quản trị nào.</div>
      ) : (
        <div className="admin-users-grid">
          {users.map((user) => {
            const hasCurrentIp = user.allowedIps?.some((ip) => ip.ipAddress === currentIp || ip.ipAddress === '*')

            return (
              <div key={user.id} className={`admin-user-card ${!user.enabled ? 'admin-user-disabled' : ''}`}>
                <div className="admin-user-card-header">
                  <div className="admin-user-avatar">
                    {user.displayName?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="admin-user-info">
                    <div className="admin-user-name-row">
                      <h3 className="admin-user-name">{user.displayName}</h3>
                      {user.enabled ? (
                        <span className="admin-badge-active">
                          <CheckCircle2 size={12} /> Hoạt động
                        </span>
                      ) : (
                        <span className="admin-badge-locked">
                          <Lock size={12} /> Đã khóa
                        </span>
                      )}
                    </div>
                    <div className="admin-user-username">@{user.username}</div>
                  </div>
                  <div className="admin-user-actions">
                    <button
                      className="admin-icon-btn"
                      title="Sửa thông tin / Đổi mật khẩu"
                      onClick={() => {
                        setEditForm({ displayName: user.displayName, enabled: user.enabled, password: '' })
                        setShowEditModal(user)
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="admin-icon-btn admin-icon-btn-danger"
                      title="Xóa tài khoản"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Meta info */}
                <div className="admin-user-meta">
                  <div title="Ngày tạo">
                    <Calendar size={13} />
                    <span>Tạo: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}</span>
                  </div>
                  <div title="Đăng nhập gần nhất">
                    <Clock size={13} />
                    <span>Đăng nhập: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</span>
                  </div>
                </div>

                {/* Allowed IPs Section */}
                <div className="admin-user-ips-section">
                  <div className="admin-user-ips-header">
                    <div className="flex items-center gap-1.5 font-medium text-slate-300 text-xs uppercase tracking-wider">
                      <Globe size={14} className="text-indigo-400" />
                      <span>IP được cấp quyền ({user.allowedIps?.length || 0})</span>
                    </div>
                    <button
                      className="admin-text-btn"
                      onClick={() => {
                        setIpForm({ ipAddress: '', description: '' })
                        setShowAddIpModal(user)
                      }}
                    >
                      <Plus size={13} /> Thêm IP
                    </button>
                  </div>

                  <div className="admin-ips-list">
                    {(!user.allowedIps || user.allowedIps.length === 0) ? (
                      <div className="admin-no-ips">
                        <AlertCircle size={14} /> Chưa có IP nào. Tài khoản này không thể truy cập nếu chế độ IP Whitelist bật.
                      </div>
                    ) : (
                      user.allowedIps.map((ip) => (
                        <div key={ip.id} className="admin-ip-chip">
                          <div className="admin-ip-chip-content">
                            <span className="font-mono font-semibold text-cyan-300 text-xs">{ip.ipAddress}</span>
                            {ip.description && (
                              <span className="text-slate-400 text-xs">({ip.description})</span>
                            )}
                            {ip.ipAddress === currentIp && (
                              <span className="admin-chip-current-tag">IP hiện tại</span>
                            )}
                          </div>
                          <button
                            className="admin-ip-del-btn"
                            title="Xóa IP này"
                            onClick={() => handleDeleteIp(user.id, ip.id, ip.ipAddress)}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick Add Current IP Button if not yet in list */}
                  {!hasCurrentIp && currentIp && (
                    <button
                      className="admin-quick-add-ip-btn"
                      onClick={() => handleQuickAddCurrentIp(user)}
                    >
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Cấp quyền nhanh cho IP hiện tại ({currentIp})</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL: Create Admin User */}
      {showCreateModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="flex items-center gap-2">
                <UserPlus className="text-indigo-400" size={20} />
                <h3>Tạo Tài Khoản Quản Trị Mới</h3>
              </div>
              <button className="admin-modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Tên đăng nhập (Username) *</label>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: admin_khoa, assistant_01"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Tên hiển thị (Display Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: Nguyễn Quốc Khoa (Admin)"
                  value={createForm.displayName}
                  onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Mật khẩu đăng nhập *</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu mạnh..."
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <div className="flex justify-between items-center mb-1">
                  <label>Danh sách IP cấp quyền ban đầu (tùy chọn)</label>
                  {currentIp && (
                    <button
                      type="button"
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                      onClick={() => {
                        const current = createForm.allowedIps ? `${createForm.allowedIps}, ${currentIp}` : currentIp
                        setCreateForm({ ...createForm, allowedIps: current })
                      }}
                    >
                      + Chèn IP hiện tại ({currentIp})
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="ví dụ: 171.225.8.206, 113.161.50.22 (ngăn cách bằng dấu phẩy)"
                  value={createForm.allowedIps}
                  onChange={(e) => setCreateForm({ ...createForm, allowedIps: e.target.value })}
                />
                <small className="text-slate-400 text-xs">
                  Để trống nếu bạn muốn thêm từng IP sau hoặc cho phép mọi IP (*).
                </small>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? 'Đang tạo...' : 'Tạo Quản Trị Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Admin User */}
      {showEditModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditModal(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="flex items-center gap-2">
                <Edit2 className="text-indigo-400" size={20} />
                <h3>Chỉnh sửa: @{showEditModal.username}</h3>
              </div>
              <button className="admin-modal-close" onClick={() => setShowEditModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="admin-modal-form">
              <div className="admin-form-group">
                <label>Tên hiển thị *</label>
                <input
                  type="text"
                  required
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Đổi mật khẩu mới (để trống nếu không đổi)</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới nếu muốn thay đổi..."
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
              </div>

              <div className="admin-form-checkbox">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={editForm.enabled}
                    onChange={(e) => setEditForm({ ...editForm, enabled: e.target.checked })}
                  />
                  <span>Tài khoản đang hoạt động (Bỏ tích để khóa tài khoản)</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowEditModal(null)}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add IP to Admin */}
      {showAddIpModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowAddIpModal(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="flex items-center gap-2">
                <Globe className="text-cyan-400" size={20} />
                <h3>Cấp quyền IP cho: @{showAddIpModal.username}</h3>
              </div>
              <button className="admin-modal-close" onClick={() => setShowAddIpModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddIp} className="admin-modal-form">
              <div className="admin-form-group">
                <div className="flex justify-between items-center mb-1">
                  <label>Địa chỉ IP mạng *</label>
                  {currentIp && (
                    <button
                      type="button"
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                      onClick={() => setIpForm({ ...ipForm, ipAddress: currentIp, description: 'Wi-Fi hiện tại của tôi' })}
                    >
                      Điền IP hiện tại ({currentIp})
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="ví dụ: 171.225.8.206 hoặc *"
                  value={ipForm.ipAddress}
                  onChange={(e) => setIpForm({ ...ipForm, ipAddress: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Ghi chú / Nhãn mạng (tùy chọn)</label>
                <input
                  type="text"
                  placeholder="ví dụ: Wi-Fi Nhà, Mạng Công Ty, 4G Dự Phòng"
                  value={ipForm.description}
                  onChange={(e) => setIpForm({ ...ipForm, description: e.target.value })}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowAddIpModal(null)}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? 'Đang thêm...' : 'Cấp Quyền IP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
