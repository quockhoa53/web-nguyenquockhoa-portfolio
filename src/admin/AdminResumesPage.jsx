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
  CheckCircle2,
  Loader2,
  X,
  FileCheck,
  Layers,
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
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    loadResumes()
  }, [])

  async function loadResumes() {
    setLoading(true)
    try {
      const data = await getAdminResumes()
      setResumes(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Lỗi khi tải danh sách CV: ' + (err.message || 'Không xác định'))
      setResumes([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!Array.isArray(resumes)) return []
    if (!search.trim()) return resumes
    const q = search.toLowerCase()
    return resumes.filter(r =>
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.targetRole && r.targetRole.toLowerCase().includes(q)) ||
      (r.summary && r.summary.toLowerCase().includes(q))
    )
  }, [resumes, search])

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

    try {
      if (editing.id) {
        await updateAdminResume(editing.id, editing)
        toast.success('Đã cập nhật thông tin CV!')
      } else {
        await createAdminResume(editing)
        toast.success('Đã thêm mới bản CV!')
      }
      setEditing(null)
      loadResumes()
    } catch (err) {
      toast.error('Thao tác thất bại: ' + (err.message || 'Lỗi'))
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa CV "${item.title}"?`)) return
    try {
      await deleteAdminResume(item.id)
      toast.success('Đã xóa bản CV!')
      loadResumes()
    } catch (err) {
      toast.error('Không thể xóa CV: ' + err.message)
    }
  }

  async function handleSetPrimary(id) {
    try {
      await setPrimaryResume(id)
      toast.success('Đã đặt làm CV chính!')
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
        <div>
          <span>RESUME &amp; CLOUDINARY STORAGE</span>
          <h1>Quản lý CV &amp; Lưu trữ Cloud</h1>
        </div>
        <button onClick={handleOpenCreate}>
          <Plus /> Thêm CV mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <Search />
          <input
            placeholder="Tìm kiếm CV theo tiêu đề, chuyên môn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span>{filtered.length} bản ghi</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-table-skeleton" />
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 48, textAlign: 'center' }}>Ưu tiên</th>
                <th>Tiêu đề CV</th>
                <th>Chuyên môn</th>
                <th>Dung lượng</th>
                <th style={{ textAlign: 'center' }}>Lượt tải</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Chưa có bản CV nào. Hãy bấm "Thêm CV mới" để tải lên file đầu tiên.
                  </td>
                </tr>
              ) : (
                filtered.map(r => {
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
                            type="button"
                            onClick={() => handleSetPrimary(r.id)}
                            title="Bấm để đặt làm CV chính"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: 4
                            }}
                          >
                            <Star size={16} />
                          </button>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text, #0f172a)' }}>{r.title}</div>
                        {r.summary && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.summary}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: `color-mix(in srgb, ${roleConfig.color} 12%, transparent)`,
                            color: roleConfig.color,
                            border: `1px solid color-mix(in srgb, ${roleConfig.color} 25%, transparent)`
                          }}
                        >
                          {roleConfig.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {formatBytes(r.fileSize)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '12px', fontWeight: 600, color: '#0284c7' }}>
                          <Download size={13} /> {r.downloadCount || 0}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {r.isActive ? (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: 'rgba(22, 163, 74, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                            Hiển thị
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                            Ẩn
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          {r.fileUrl && (
                            <a
                              href={r.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Xem file trên Cloudinary"
                              style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', padding: 4 }}
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditing(r)}
                            title="Sửa"
                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            title="Xóa"
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
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
      )}

      {/* Hidden File Input for Cloudinary Upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={handleFileUpload}
      />

      {/* Create / Edit Drawer Modal */}
      {editing && (
        <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="admin-modal-head">
              <h2>{editing.id ? 'Chỉnh sửa bản CV' : 'Tạo mới bản CV'}</h2>
              <button onClick={() => setEditing(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                  Tiêu đề CV *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Quốc Khoa - Java Backend Engineer CV"
                  value={editing.title || ''}
                  onChange={e => setEditing({ ...editing, title: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                    Chuyên môn (Target Role)
                  </label>
                  <select
                    value={editing.targetRole || 'BACKEND'}
                    onChange={e => setEditing({ ...editing, targetRole: e.target.value })}
                    style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, background: '#fff' }}
                  >
                    {ROLE_OPTIONS.map(ro => (
                      <option key={ro.value} value={ro.value}>{ro.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                    Tên File (File Name)
                  </label>
                  <input
                    type="text"
                    placeholder="NguyenQuocKhoa_CV.pdf"
                    value={editing.fileName || ''}
                    onChange={e => setEditing({ ...editing, fileName: e.target.value })}
                    style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                  Link File PDF / Cloudinary URL *
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="url"
                    placeholder="https://res.cloudinary.com/..."
                    value={editing.fileUrl || ''}
                    onChange={e => setEditing({ ...editing, fileUrl: e.target.value })}
                    style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#06b6d4',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Đang tải...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={15} /> Upload Cloud
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                  Tóm tắt điểm nhấn cho AI đọc &amp; tư vấn
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: 3+ năm kinh nghiệm Java/Spring Boot, Clean Architecture, Microservices, Kafka, PostgreSQL, tối ưu hiệu năng..."
                  value={editing.summary || ''}
                  onChange={e => setEditing({ ...editing, summary: e.target.value })}
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', fontSize: 13.5, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    checked={editing.isPrimary || false}
                    onChange={e => setEditing({ ...editing, isPrimary: e.target.checked })}
                  />
                  <span style={{ fontWeight: 700, color: '#334155' }}>⭐ Đặt làm CV chính</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                  <input
                    type="checkbox"
                    checked={editing.isActive !== false}
                    onChange={e => setEditing({ ...editing, isActive: e.target.checked })}
                  />
                  <span style={{ color: '#334155' }}>Hiển thị công khai</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {editing.id ? 'Lưu thay đổi' : 'Thêm mới CV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
