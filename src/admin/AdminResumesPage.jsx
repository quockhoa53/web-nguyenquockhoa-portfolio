import { useState, useEffect, useRef } from 'react'
import {
  FileText,
  UploadCloud,
  Plus,
  Star,
  Download,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Loader2,
  X,
  FileCheck
} from 'lucide-react'
import {
  getAdminResumes,
  createAdminResume,
  updateAdminResume,
  deleteAdminResume,
  setPrimaryResume,
  uploadFileToCloudinary
} from '../services/adminApi'

const ROLE_OPTIONS = [
  { value: 'BACKEND', label: 'Java / Backend Engineer', color: '#10b981' },
  { value: 'FULLSTACK', label: 'Full-stack Developer', color: '#06b6d4' },
  { value: 'AI_ENGINEER', label: 'AI / LLM Specialist', color: '#8b5cf6' },
  { value: 'GENERAL', label: 'CV Tổng quát (General)', color: '#64748b' }
]

export function AdminResumesPage() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    targetRole: 'BACKEND',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    summary: '',
    isPrimary: false,
    isActive: true
  })

  // Uploading state
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadResumes()
  }, [])

  async function loadResumes() {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminResumes()
      setResumes(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách CV')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenCreate() {
    setEditingId(null)
    setFormData({
      title: '',
      targetRole: 'BACKEND',
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      summary: '',
      isPrimary: resumes.length === 0,
      isActive: true
    })
    setIsModalOpen(true)
  }

  function handleOpenEdit(resume) {
    setEditingId(resume.id)
    setFormData({
      title: resume.title || '',
      targetRole: resume.targetRole || 'BACKEND',
      fileUrl: resume.fileUrl || '',
      fileName: resume.fileName || '',
      fileSize: resume.fileSize || 0,
      summary: resume.summary || '',
      isPrimary: resume.isPrimary || false,
      isActive: resume.isActive !== undefined ? resume.isActive : true
    })
    setIsModalOpen(true)
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const result = await uploadFileToCloudinary(file, 'portfolio/resumes')
      const uploadedUrl = result.fileUrl || result.url || result.secure_url
      setFormData(prev => ({
        ...prev,
        fileUrl: uploadedUrl,
        fileName: file.name,
        fileSize: file.size,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '')
      }))
      setSuccess('Đã upload file lên Cloudinary thành công!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Lỗi khi upload file lên Cloudinary: ' + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề CV')
      return
    }
    if (!formData.fileUrl.trim()) {
      setError('Vui lòng upload hoặc nhập URL file CV')
      return
    }

    try {
      if (editingId) {
        await updateAdminResume(editingId, formData)
        setSuccess('Đã cập nhật CV thành công!')
      } else {
        await createAdminResume(formData)
        setSuccess('Đã thêm mới CV thành công!')
      }
      setIsModalOpen(false)
      loadResumes()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.message || 'Thao tác thất bại')
    }
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa CV "${title}"?`)) return
    try {
      await deleteAdminResume(id)
      setSuccess('Đã xóa CV thành công!')
      loadResumes()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.message || 'Không thể xóa CV')
    }
  }

  async function handleSetPrimary(id) {
    try {
      await setPrimaryResume(id)
      setSuccess('Đã đặt làm CV chính thành công!')
      loadResumes()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.message || 'Không thể đặt làm CV chính')
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
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={26} color="#06b6d4" /> Quản lý CV & Lưu trữ Cloudinary
          </h1>
          <p className="admin-page-desc">
            Quản lý các phiên bản CV theo chuyên môn, tải lên Cloudinary miễn phí và cấp quyền cho AI Chatbot tự động chia sẻ khi có yêu cầu.
          </p>
        </div>
        <button className="admin-btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Thêm CV mới
        </button>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="admin-alert alert-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={18} /> <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="admin-alert alert-success" style={{ marginBottom: 16 }}>
          <CheckCircle2 size={18} /> <span>{success}</span>
          <button className="alert-close" onClick={() => setSuccess('')}><X size={14} /></button>
        </div>
      )}

      {/* Cloudinary Upload Quick Box */}
      <div className="admin-card" style={{ marginBottom: 24, background: 'rgba(6, 182, 212, 0.04)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
              <UploadCloud size={20} color="#06b6d4" /> Tải Lên File Trực Tiếp Lên Đám Mây (Cloudinary)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--sub)' }}>
              Hỗ trợ định dạng PDF, DOCX, PNG, JPG... File được lưu trữ vĩnh viễn trên Cloudinary với băng thông tốc độ cao.
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
            />
            <button
              className="admin-btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Đang tải lên Cloudinary...
                </>
              ) : (
                <>
                  <UploadCloud size={16} /> Chọn File Tải Lên Cloud
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CV List Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--sub)' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p>Đang tải danh sách CV...</p>
          </div>
        ) : resumes.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--sub)' }}>
            <FileText size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 8px', color: 'var(--text)' }}>Chưa có bản CV nào</h3>
            <p style={{ margin: 0, fontSize: 13 }}>Hãy bấm "Thêm CV mới" để tạo bản CV đầu tiên của bạn.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Ưu tiên</th>
                  <th>Tiêu đề CV</th>
                  <th>Chuyên môn (Target Role)</th>
                  <th>Dung lượng</th>
                  <th style={{ textAlign: 'center' }}>Lượt tải</th>
                  <th style={{ textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map(r => {
                  const roleConfig = ROLE_OPTIONS.find(ro => ro.value === r.targetRole) || ROLE_OPTIONS[3]
                  return (
                    <tr key={r.id}>
                      <td style={{ textAlign: 'center' }}>
                        {r.isPrimary ? (
                          <span title="CV chính (Primary)" style={{ color: '#fbbf24', display: 'inline-flex' }}>
                            <Star size={18} fill="#fbbf24" />
                          </span>
                        ) : (
                          <button
                            className="table-action-icon"
                            onClick={() => handleSetPrimary(r.id)}
                            title="Bấm để đặt làm CV chính"
                            style={{ opacity: 0.4 }}
                          >
                            <Star size={16} />
                          </button>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{r.title}</div>
                        {r.summary && (
                          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.summary}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 11.5,
                            fontWeight: 600,
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: `color-mix(in srgb, ${roleConfig.color} 15%, transparent)`,
                            color: roleConfig.color,
                            border: `1px solid color-mix(in srgb, ${roleConfig.color} 30%, transparent)`
                          }}
                        >
                          <Layers size={11} /> {roleConfig.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 12.5, color: 'var(--sub)' }}>
                        {formatBytes(r.fileSize)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="admin-badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Download size={11} /> {r.downloadCount || 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {r.isActive ? (
                          <span className="admin-badge badge-success">Hiển thị</span>
                        ) : (
                          <span className="admin-badge badge-neutral">Ẩn</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          {r.fileUrl && (
                            <a
                              href={r.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="table-action-btn"
                              title="Xem file trên Cloudinary"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            className="table-action-btn"
                            onClick={() => handleOpenEdit(r)}
                            title="Chỉnh sửa CV"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="table-action-btn btn-danger"
                            onClick={() => handleDelete(r.id, r.title)}
                            title="Xóa CV"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCheck size={20} color="#10b981" /> {editingId ? 'Chỉnh sửa thông tin CV' : 'Tạo mới bản CV'}
              </h3>
              <button className="header-icon-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-form" style={{ padding: 20 }}>
              <div className="form-group">
                <label className="form-label">Tiêu đề CV *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Nguyễn Quốc Khoa - Java Backend Engineer CV"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Chuyên môn mục tiêu (Target Role)</label>
                  <select
                    className="form-input"
                    value={formData.targetRole}
                    onChange={e => setFormData({ ...formData, targetRole: e.target.value })}
                  >
                    {ROLE_OPTIONS.map(ro => (
                      <option key={ro.value} value={ro.value}>{ro.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">File Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="NguyenQuocKhoa_CV.pdf"
                    value={formData.fileName}
                    onChange={e => setFormData({ ...formData, fileName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Link File PDF / Cloudinary URL *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://res.cloudinary.com/..."
                    value={formData.fileUrl}
                    onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="admin-btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Upload file mới"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <UploadCloud size={15} /> Upload
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tóm tắt các điểm mạnh chính trong CV (Dành cho AI đọc & tư vấn)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Ví dụ: Tập trung chuyên sâu vào Spring Boot, Clean Architecture, Kafka, PostgreSQL, tối ưu hiệu năng Microservices..."
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: 24, margin: '12px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600 }}>⭐ Đặt làm CV chính</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Hiển thị công khai</span>
                </label>
              </div>

              <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" className="admin-btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn btn-primary">
                  {editingId ? 'Lưu thay đổi' : 'Thêm mới CV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
