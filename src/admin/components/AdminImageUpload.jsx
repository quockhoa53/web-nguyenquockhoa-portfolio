import { useState, useRef } from 'react'
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { uploadFileToCloudinary } from '../../services/adminApi'
import { useToast } from '../../components/common/ToastContext'

export function AdminImageUpload({
  label = 'Ảnh đại diện / Thumbnail',
  value = '',
  onChange,
  folder = 'portfolio/images'
}) {
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('upload') // 'upload' | 'url'
  const fileInputRef = useRef(null)
  const toast = useToast()

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP, SVG).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 10MB.')
      return
    }

    setUploading(true)
    try {
      const res = await uploadFileToCloudinary(file, folder)
      const uploadedUrl = res.fileUrl || res.url || res.secure_url || res.data?.url
      if (uploadedUrl) {
        onChange(uploadedUrl)
        toast.success('Tải ảnh lên thành công!')
      } else {
        throw new Error('Không nhận được URL ảnh từ máy chủ')
      }
    } catch (err) {
      toast.error('Lỗi khi tải ảnh: ' + (err.message || 'Không thể upload'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="admin-image-upload-wrap">
      <div className="admin-upload-header">
        <span className="admin-upload-label">{label}</span>
        <div className="admin-upload-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={13} />
            <span>Tải từ máy tính</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            <LinkIcon size={13} />
            <span>Nhập link URL</span>
          </button>
        </div>
      </div>

      <div className="admin-upload-body">
        {/* Upload Mode */}
        {activeTab === 'upload' && (
          <div
            className={`upload-drop-zone ${uploading ? 'uploading' : ''}`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {uploading ? (
              <div className="upload-state">
                <Loader2 className="animate-spin text-emerald-500" size={26} />
                <span>Đang tải ảnh lên Cloud...</span>
              </div>
            ) : (
              <div className="upload-state">
                <div className="upload-icon-circle">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <strong>Bấm để chọn file ảnh hoặc kéo thả vào đây</strong>
                  <small>Hỗ trợ JPG, PNG, WEBP, SVG (tối đa 10MB)</small>
                </div>
              </div>
            )}
          </div>
        )}

        {/* URL Input Mode */}
        {activeTab === 'url' && (
          <div className="url-input-wrap">
            <input
              type="text"
              placeholder="https://example.com/image.png hoặc /images/projects_3d_cover.png"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        )}

        {/* Live Image Preview Card */}
        {value && (
          <div className="image-preview-card">
            <div className="preview-thumb-box">
              <img
                src={value}
                alt="Preview"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
            <div className="preview-meta">
              <span className="preview-url" title={value}>
                {value}
              </span>
              <div className="preview-actions">
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="preview-btn view"
                  title="Mở ảnh trong tab mới"
                >
                  <ExternalLink size={12} />
                  <span>Xem</span>
                </a>
                <button
                  type="button"
                  className="preview-btn delete"
                  onClick={() => onChange('')}
                  title="Xóa ảnh"
                >
                  <Trash2 size={12} />
                  <span>Gỡ bỏ</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
