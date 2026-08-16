import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
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
  Users,
} from 'lucide-react'
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAllowedIps,
  createAllowedIp,
  deleteAllowedIp,
  checkAdminAccess,
} from '../services/adminApi'
import { useToast } from '../components/common/ToastContext'

export function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [allowedIps, setAllowedIps] = useState([])
  const [currentIp, setCurrentIp] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modals state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(null)
  const [showAddIpModal, setShowAddIpModal] = useState(false)

  // Forms state
  const [createUserForm, setCreateUserForm] = useState({ username: '', password: '', displayName: '' })
  const [editUserForm, setEditUserForm] = useState({ displayName: '', password: '', enabled: true })
  const [ipForm, setIpForm] = useState({ ipAddress: '', description: '' })

  const toast = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, ipsData, accessData] = await Promise.all([
        getAdminUsers().catch(() => []),
        getAllowedIps().catch(() => []),
        checkAdminAccess().catch(() => ({ ip: '' })),
      ])
      setUsers(usersData || [])
      setAllowedIps(ipsData || [])
      if (accessData?.ip) setCurrentIp(accessData.ip)
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

  // Handle Add Global Allowed IP
  const handleAddIp = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createAllowedIp(ipForm)
      toast.success(`Đã thêm IP ${ipForm.ipAddress} vào danh sách cấp quyền!`)
      setShowAddIpModal(false)
      setIpForm({ ipAddress: '', description: '' })
      loadData()
    } catch (err) {
      toast.error('Lỗi thêm IP: ' + (err.message || 'Thất bại'))
    } finally {
      setSaving(false)
    }
  }

  // Handle Quick Add Current IP to Global Whitelist
  const handleQuickAddCurrentIp = async () => {
    if (!currentIp) {
      toast.error('Không xác định được IP hiện tại!')
      return
    }
    try {
      await createAllowedIp({
        ipAddress: currentIp,
        description: 'Wi-Fi hiện tại của bạn',
      })
      toast.success(`Đã thêm nhanh IP hiện tại (${currentIp}) vào hệ thống!`)
      loadData()
    } catch (err) {
      toast.error('Lỗi thêm IP: ' + (err.message || 'IP đã tồn tại hoặc lỗi'))
    }
  }

  // Handle Delete Global IP
  const handleDeleteIp = async (ip) => {
    if (!window.confirm(`Bạn có chắc muốn xóa quyền truy cập của IP ${ip.ipAddress}?`)) return
    try {
      await deleteAllowedIp(ip.id)
      toast.success(`Đã xóa IP ${ip.ipAddress}!`)
      loadData()
    } catch (err) {
      toast.error('Lỗi khi xóa IP: ' + (err.message || 'Thất bại'))
    }
  }

  const isCurrentIpAllowed = allowedIps.some(ip => ip.ipAddress === currentIp || ip.ipAddress === '*' || ip.ipAddress === '0.0.0.0')

  return (
    <div className="admin-page">
      {/* Page Heading */}
      <div className="admin-heading">
        <div>
          <span>Bảo Mật & Quản Trị Hệ Thống</span>
          <h1>Tài Khoản & IP Whitelist</h1>
        </div>
        <small>IP Whitelist áp dụng dùng chung cho toàn bộ tài khoản quản trị</small>
      </div>

      {/* ================= SECTION 1: GLOBAL IP WHITELIST ================= */}
      <div className="admin-section-box">
        <div className="admin-section-header">
          <div className="flex items-center gap-2">
            <Globe className="text-indigo-600" size={22} />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Danh Sách IP Được Cấp Quyền (IP Whitelist)</h2>
              <p className="text-xs text-slate-500">Các địa chỉ IP mạng được phép mở trang quản trị Admin và đăng nhập.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCurrentIpAllowed && currentIp && (
              <button
                type="button"
                className="admin-btn-accent"
                onClick={handleQuickAddCurrentIp}
              >
                <Sparkles size={15} />
                <span>+ Thêm IP hiện tại ({currentIp})</span>
              </button>
            )}
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => {
                setIpForm({ ipAddress: '', description: '' })
                setShowAddIpModal(true)
              }}
            >
              <Plus size={16} />
              <span>Thêm IP Mới</span>
            </button>
          </div>
        </div>

        {/* Current IP Alert Strip */}
        <div className="admin-ip-strip">
          <div className="flex items-center gap-3">
            <div className="admin-ip-icon-badge">
              <Wifi size={18} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">IP Wi-Fi hiện tại của bạn: </span>
              <strong className="text-sm font-mono text-indigo-700 ml-1">{currentIp || 'Đang nhận diện...'}</strong>
            </div>
          </div>
          {isCurrentIpAllowed ? (
            <span className="admin-badge-active">
              <CheckCircle2 size={13} /> Mạng hiện tại đã được cấp quyền
            </span>
          ) : (
            <span className="admin-badge-locked">
              <AlertCircle size={13} /> Mạng hiện tại chưa nằm trong Whitelist
            </span>
          )}
        </div>

        {/* Allowed IPs Table */}
        <div className="admin-table-wrap mt-3">
          <table>
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Địa chỉ IP mạng</th>
                <th>Mô tả / Nhãn gợi nhớ</th>
                <th style={{ width: '120px' }}>Trạng thái</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {allowedIps.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-400">
                    Chưa có IP nào trong danh sách. Hệ thống sẽ mở cho tất cả IP hoặc chỉ xác thực bằng mật khẩu.
                  </td>
                </tr>
              ) : (
                allowedIps.map((ip) => {
                  const isCurrent = ip.ipAddress === currentIp

                  return (
                    <tr key={ip.id} className={isCurrent ? 'admin-row-highlight' : ''}>
                      <td>
                        <div className="flex items-center gap-2">
                          <code className="admin-ip-code">{ip.ipAddress}</code>
                          {isCurrent && <span className="admin-chip-current-tag">IP hiện tại</span>}
                          {ip.ipAddress === '*' && <span className="admin-chip-all-tag">Tất cả IP (*)</span>}
                        </div>
                      </td>
                      <td className="text-slate-600 font-medium">
                        {ip.description || <span className="text-slate-400 italic">Không có mô tả</span>}
                      </td>
                      <td>
                        <span className="admin-badge-active">
                          <CheckCircle2 size={12} /> Cho phép
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="row-actions justify-center">
                          <button
                            className="danger"
                            title="Xóa quyền truy cập IP này"
                            onClick={() => handleDeleteIp(ip)}
                          >
                            <Trash2 size={15} />
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
      </div>

      {/* ================= SECTION 2: ADMIN USERS ================= */}
      <div className="admin-section-box mt-8">
        <div className="admin-section-header">
          <div className="flex items-center gap-2">
            <Users className="text-indigo-600" size={22} />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Danh Sách Tài Khoản Quản Trị Viên</h2>
              <p className="text-xs text-slate-500">Các tài khoản có quyền truy cập và thao tác trên Admin Portal.</p>
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

      {/* ================= MODAL: ADD GLOBAL ALLOWED IP ================= */}
      {showAddIpModal && (
        <div className="admin-modal" onClick={() => setShowAddIpModal(false)}>
          <form onSubmit={handleAddIp} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <header>
              <div>
                <span>IP Whitelist Hệ Thống</span>
                <h2>Cấp Quyền Địa Chỉ IP</h2>
              </div>
              <button type="button" onClick={() => setShowAddIpModal(false)}><X size={18} /></button>
            </header>

            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr', padding: '20px 24px' }}>
              <label>
                <div className="flex justify-between items-center mb-1">
                  <span>Địa chỉ IP mạng *</span>
                  {currentIp && (
                    <button
                      type="button"
                      className="text-xs text-indigo-600 hover:text-indigo-700 underline font-medium"
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
              </label>

              <label>
                <span>Ghi chú / Nhãn gợi nhớ (tùy chọn)</span>
                <input
                  type="text"
                  placeholder="ví dụ: Wi-Fi Nhà, Mạng Công Ty, 4G Viettel..."
                  value={ipForm.description}
                  onChange={(e) => setIpForm({ ...ipForm, description: e.target.value })}
                />
              </label>
            </div>

            <footer>
              <button type="button" onClick={() => setShowAddIpModal(false)}>Hủy</button>
              <button type="submit" className="save" disabled={saving}>
                {saving ? 'Đang thêm...' : 'Cấp Quyền IP'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}
