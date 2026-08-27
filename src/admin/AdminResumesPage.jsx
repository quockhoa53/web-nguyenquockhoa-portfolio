import { useState, useEffect, useMemo, useRef } from 'react'
import {
  FileText,
  UploadCloud,
  Plus,
  Star,
  Download,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Check,
  Loader2,
  X,
  Layers,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import {
  getAdminResumes,
  createAdminResume,
  updateAdminResume,
  deleteAdminResume,
  setPrimaryResume,
  uploadFileToCloudinary
} from '../services/adminApi'
import { useToast } from '../components/common/ToastContext'
import { AdminPagination } from './components/AdminPagination'
import { AdminStatusBadge } from './components/AdminStatusBadge'

const ROLE_OPTIONS = [
  { value: 'BACKEND', label: 'Java / Backend Engineer', color: '#10b981' },
  { value: 'FULLSTACK', label: 'Full-stack Developer', color: '#06b6d4' },
  { value: 'AI_ENGINEER', label: 'AI / LLM Specialist', color: '#8b5cf6' },
  { value: 'GENERAL', label: 'CV Tổng quát (General)', color: '#64748b' }
]

export function AdminResumesPage() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fileInputRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    loadResumes()
  }, [])

  async function loadResumes(isManual = false) {
    if (isManual) setIsRefreshing(true)
    else setLoading(true)

    try {
      const data = await getAdminResumes()
      setResumes(Array.isArray(data) ? data : [])
      if (isManual) toast.success('Đã làm mới danh sách CV!')
    } catch (err) {
      toast.error('Lỗi khi tải danh sách CV: ' + (err.message || 'Không xác định'))
      if (!isManual) setResumes([])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const filtered = useMemo(() => {
    if (!Array.isArray(resumes)) return []
    return resumes.filter(r => {
      if (roleFilter !== 'ALL' && r.targetRole !== roleFilter) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.targetRole && r.targetRole.toLowerCase().includes(q)) ||
        (r.summary && r.summary.toLowerCase().includes(q))
      )
    })
  }, [resumes, search, roleFilter])

  const paginatedResumes = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, roleFilter])

  function handleOpenCreate() {
    setEditing({
      title: '',
      targetRole: 'BACKEND',
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      summary: '',
      isPrimary: resumes.length === 0,
      isActive: true
    })
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await uploadFileToCloudinary(file, 'portfolio/resumes')
      const uploadedUrl = result.fileUrl || result.url || result.secure_url
      setEditing(prev => ({
        ...prev,
        fileUrl: uploadedUrl,
        fileName: file.name,
        fileSize: file.size,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }))
      toast.success('Đã tải file lên Cloudinary thành công!')
    } catch (err) {
      toast.error('Lỗi khi upload Cloudinary: ' + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!editing.title?.trim()) {
      toast.error('Vui lòng nhập tiêu đề CV')
      return
    }
    if (!editing.fileUrl?.trim()) {
      toast.error('Vui lòng upload hoặc nhập link file CV')
      return
    }

    setIsSaving(true)
    try {
      if (editing.id) {
        const updated = await updateAdminResume(editing.id, editing)
        setResumes(prev => prev.map(r => r.id === editing.id ? { ...r, ...editing, ...(updated || {}) } : r))
        toast.success('Đã cập nhật thông tin CV!')
      } else {
        const created = await createAdminResume(editing)
        setResumes(prev => [created || { ...editing, id: Date.now() }, ...prev])
        toast.success('Đã thêm mới bản CV!')
      }
      setEditing(null)
      loadResumes()
    } catch (err) {
      toast.error('Thao tác thất bại: ' + (err.message || 'Lỗi'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa CV "${item.title}"?`)) return
    try {
      await deleteAdminResume(item.id)
      setResumes(prev => prev.filter(r => r.id !== item.id))
      toast.success('Đã xóa bản CV thành công!')
      loadResumes()
    } catch (err) {
      toast.error('Không thể xóa CV: ' + err.message)
    }
  }

  async function handleSetPrimary(id) {
    try {
      await setPrimaryResume(id)
      setResumes(prev => prev.map(r => ({ ...r, isPrimary: r.id === id })))
      toast.success('Đã đặt làm CV chính hiển thị ngoài trang chủ!')
      loadResumes()
    } catch (err) {
      toast.error('Không thể đặt làm CV chính: ' + err.message)
    }
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="admin-page">
      {/* Heading */}
      <div className="admin-heading">
        <div className="admin-heading-left">
          <span className="admin-badge-category">
            <Layers size={11} /> CLOUDINARY &amp; RESUME STORAGE
          </span>
          <h1>Quản Lý CV &amp; Hồ Sơ Năng Lực</h1>
        </div>

        <div className="admin-heading-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => loadResumes(true)}
            disabled={isRefreshing || loading}
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button className="admin-btn-primary" type="button" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Thêm CV mới</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-search-box">
            <Search size={15} />
            <input
              placeholder="Tìm kiếm CV theo tiêu đề, chuyên môn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="clear-search-btn" onClick={() => setSearch('')}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className="admin-filter-select-wrap">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Tất cả chuyên môn</option>
              {ROLE_OPTIONS.map(ro => (
                <option key={ro.value} value={ro.value}>{ro.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-toolbar-right">
          <span className="record-count-badge">
            <b>{filtered.length}</b> bản ghi
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-table-skeleton">
          <div className="admin-skeleton-row" />
          <div className="admin-skeleton-row" />
          <div className="admin-skeleton-row" />
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: 'center' }}>STT</th>
                  <th style={{ width: 68, textAlign: 'center' }}>Chính</th>
                  <th>Tiêu đề CV &amp; File</th>
                  <th>Chuyên môn</th>
                  <th>Dung lượng</th>
                  <th style={{ textAlign: 'center' }}>Lượt tải</th>
                  <th style={{ textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ width: 120, textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResumes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="admin-empty-table-cell">
                      <Sparkles size={28} className="empty-icon" />
                      <strong>Chưa có bản CV nào</strong>
                      <p>Bấm nút "Thêm CV mới" ở trên để tải lên hồ sơ PDF đầu tiên.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedResumes.map((r, index) => {
                    const stt = (currentPage - 1) * pageSize + index + 1
                    const roleConfig = ROLE_OPTIONS.find(ro => ro.value === r.targetRole) || ROLE_OPTIONS[3]

                    return (
                      <tr key={r.id} className="admin-table-row">
                        <td className="stt-cell">
                          <span className="stt-number">{stt}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {r.isPrimary ? (
                            <span title="CV chính (Primary) hiển thị trang chủ" className="primary-star-badge">
                              <Star size={16} fill="#fbbf24" color="#fbbf24" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="set-primary-star-btn"
                              onClick={() => handleSetPrimary(r.id)}
                              title="Bấm để đặt làm CV chính"
                            >
                              <Star size={15} />
                            </button>
                          )}
                        </td>
                        <td className="main-content-cell">
                          <div className="cell-title-wrap">
                            <strong className="cell-title">{r.title}</strong>
                            {r.fileName && <span className="cell-id-badge">{r.fileName}</span>}
                          </div>
                          {r.summary && <span className="cell-subtitle">{r.summary}</span>}
                        </td>
                        <td>
                          <span
                            className="role-badge"
                            style={{
                              color: roleConfig.color,
                              background: `${roleConfig.color}15`,
                              borderColor: `${roleConfig.color}30`
                            }}
                          >
                            {roleConfig.label}
                          </span>
                        </td>
                        <td>
                          <span className="file-size-badge">{formatBytes(r.fileSize)}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="download-count-badge">
                            <Download size={11} /> {r.downloadCount || 0}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <AdminStatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="row-actions">
                            {r.fileUrl && (
                              <a
                                href={r.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="row-btn view"
                                title="Xem / Tải file CV"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                            <button
                              type="button"
                              className="row-btn edit"
                              onClick={() => setEditing({ ...r })}
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className="row-btn danger"
                              onClick={() => handleDelete(r)}
                              title="Xóa bản CV"
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
            totalItems={filtered.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50]}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setCurrentPage(1)
            }}
          />
        </div>
      )}

      {/* Spacious Modal */}
      {editing && (
        <div className="admin-modal-backdrop" onClick={() => !isSaving && setEditing(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <header className="modal-header">
                <div>
                  <span className="modal-tag">RESUME BUILDER</span>
                  <h2>{editing.id ? 'Cập Nhật Hồ Sơ CV' : 'Tải Lên Hồ Sơ CV Mới'}</h2>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  disabled={isSaving}
                  onClick={() => setEditing(null)}
                >
                  <X size={18} />
                </button>
              </header>

              <div className="modal-body">
                <div className="admin-form-grid-modern">
                  {/* Title */}
                  <div className="form-field-group">
                    <label className="field-label"><span>Tiêu đề CV *</span></label>
                    <input
                      className="admin-text-input"
                      type="text"
                      placeholder="vd: CV Nguyen Quoc Khoa - Senior Java Backend"
                      value={editing.title || ''}
                      onChange={e => setEditing({ ...editing, title: e.target.value })}
                      required
                    />
                  </div>

                  {/* Target Role */}
                  <div className="form-field-group">
                    <label className="field-label"><span>Vị trí ứng tuyển mục tiêu *</span></label>
                    <select
                      className="admin-select-input"
                      value={editing.targetRole || 'BACKEND'}
                      onChange={e => setEditing({ ...editing, targetRole: e.target.value })}
                    >
                      {ROLE_OPTIONS.map(ro => (
                        <option key={ro.value} value={ro.value}>{ro.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cloudinary File Upload Box */}
                  <div className="form-field-group full-width">
                    <label className="field-label"><span>File CV (PDF / DOCX) *</span></label>
                    <div
                      className={`upload-drop-zone ${uploading ? 'uploading' : ''}`}
                      onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                      {uploading ? (
                        <div className="upload-state">
                          <Loader2 className="animate-spin text-emerald-500" size={26} />
                          <span>Đang tải CV lên Cloudinary...</span>
                        </div>
                      ) : (
                        <div className="upload-state">
                          <div className="upload-icon-circle">
                            <UploadCloud size={20} />
                          </div>
                          <div>
                            <strong>Bấm để tải file PDF / DOCX từ máy tính</strong>
                            <small>Tự động lưu trữ vĩnh viễn trên Cloudinary</small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct File URL (Auto-filled or manual) */}
                  <div className="form-field-group full-width">
                    <label className="field-label"><span>Đường dẫn File URL</span></label>
                    <input
                      className="admin-text-input"
                      type="url"
                      placeholder="https://res.cloudinary.com/..."
                      value={editing.fileUrl || ''}
                      onChange={e => setEditing({ ...editing, fileUrl: e.target.value })}
                      required
                    />
                  </div>

                  {/* Summary */}
                  <div className="form-field-group full-width">
                    <label className="field-label"><span>Mô tả ngắn về bản CV này</span></label>
                    <textarea
                      className="admin-textarea-input"
                      rows="3"
                      placeholder="Ghi chú thêm: Tối ưu cho công ty outsource / product, nhấn mạnh vào Spring Cloud và RAG AI..."
                      value={editing.summary || ''}
                      onChange={e => setEditing({ ...editing, summary: e.target.value })}
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="form-field-group">
                    <label className="admin-checkbox-card">
                      <input
                        type="checkbox"
                        checked={!!editing.isPrimary}
                        onChange={e => setEditing({ ...editing, isPrimary: e.target.checked })}
                      />
                      <span className="checkbox-text">
                        <strong>Đặt làm CV chính (Primary)</strong>
                        <small>Hiển thị nút tải nhanh ngoài trang chủ</small>
                      </span>
                    </label>
                  </div>

                  <div className="form-field-group">
                    <label className="admin-checkbox-card">
                      <input
                        type="checkbox"
                        checked={!!editing.isActive}
                        onChange={e => setEditing({ ...editing, isActive: e.target.checked })}
                      />
                      <span className="checkbox-text">
                        <strong>Kích hoạt công khai (Active)</strong>
                        <small>Cho phép nhà tuyển dụng xem và tải về</small>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  disabled={isSaving}
                  onClick={() => setEditing(null)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="modal-btn-save"
                  disabled={isSaving || uploading}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Lưu bản CV</span>
                    </>
                  )}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
