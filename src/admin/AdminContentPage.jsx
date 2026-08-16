import { Check, Edit3, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '../components/common/ToastContext'
import { createAdminItem, deleteAdminItem, getAdminArticles, getAdminComments, getAdminContacts, getAdminGuests, getAdminLikes, getAdminWorkItems, moderateComment, updateAdminItem, updateProfile } from '../services/adminApi'
import { getExperiences, getKnowledgeCategories, getProfile, getProjects, getSkills } from '../services/portfolioApi'
import { RichEditor } from './RichEditor'

const SKILL_CATEGORIES = [
  'Backend & Architecture',
  'Database',
  'Data Processing',
  'AI & Tools'
]

const configs = {
  likes: { title: 'Người đã yêu thích', load: getAdminLikes, readonly: true },
  profile: { title: 'Thông tin Profile & Liên hệ', single: true, load: getProfile, resource: 'profile', fields: [['fullName', 'Họ và tên'], ['headline', 'Chức danh'], ['email', 'Email liên hệ', 'email'], ['phone', 'Số điện thoại'], ['location', 'Địa chỉ / Tỉnh thành'], ['facebookUrl', 'Link Facebook (URL)'], ['githubUrl', 'Link GitHub (URL)'], ['linkedinUrl', 'Link LinkedIn (URL)'], ['avatarUrl', 'Ảnh đại diện (URL)'], ['shortBio', 'Mô tả ngắn trên trang chủ', 'textarea'], ['bio', 'Nội dung chi tiết Profile', 'rich']] },
  skills: { title: 'Năng lực kỹ thuật', load: getSkills, resource: 'skills', fields: [['name', 'Tên kỹ năng'], ['category', 'Nhóm kỹ năng', 'select', SKILL_CATEGORIES], ['proficiency', 'Mức độ (%)', 'number'], ['displayOrder', 'Thứ tự hiển thị', 'number']] },
  experiences: { title: 'Kinh nghiệm', load: getExperiences, resource: 'experiences', fields: [['company', 'Công ty'], ['position', 'Vị trí'], ['startDate', 'Ngày bắt đầu', 'date'], ['endDate', 'Ngày kết thúc', 'date'], ['description', 'Mô tả', 'rich'], ['displayOrder', 'Thứ tự', 'number']] },
  projects: { title: 'Dự án', load: getProjects, resource: 'projects', fields: [['title', 'Tên dự án'], ['description', 'Nội dung', 'rich'], ['technologies', 'Công nghệ'], ['imageUrl', 'Ảnh'], ['demoUrl', 'Demo URL'], ['sourceUrl', 'Source URL'], ['featured', 'Nổi bật', 'checkbox'], ['displayOrder', 'Thứ tự', 'number']] },
  categories: { title: 'Danh mục kiến thức', load: getKnowledgeCategories, resource: 'knowledge/categories', fields: [['name', 'Tên'], ['slug', 'Slug'], ['description', 'Mô tả', 'rich'], ['displayOrder', 'Thứ tự', 'number']] },
  articles: { title: 'Bài viết kiến thức', load: getAdminArticles, resource: 'knowledge/articles', fields: [['categoryId', 'Category ID', 'number'], ['title', 'Tiêu đề'], ['slug', 'Slug'], ['summary', 'Tóm tắt', 'rich'], ['content', 'Nội dung', 'rich'], ['thumbnailUrl', 'Ảnh bìa'], ['status', 'Trạng thái', 'select', ['DRAFT', 'PUBLISHED', 'ARCHIVED']], ['featured', 'Nổi bật', 'checkbox']] },
  'work-items': { title: 'Quá trình làm việc', load: getAdminWorkItems, resource: 'work-items', fields: [['title', 'Tiêu đề công việc'], ['slug', 'Slug (Tùy chọn)'], ['period', 'Thời gian (vd: 2024 - Hiện tại)'], ['role', 'Vai trò / Chức danh'], ['company', 'Công ty / Tổ chức'], ['summary', 'Tóm tắt công việc', 'rich'], ['content', 'Chi tiết công việc', 'rich'], ['technologies', 'Công nghệ (dấu phẩy phân cách)'], ['displayOrder', 'Thứ tự hiển thị', 'number'], ['published', 'Đã xuất bản', 'checkbox']] },
  comments: { title: 'Kiểm duyệt bình luận', load: getAdminComments, readonly: true },
  contacts: { title: 'Tin nhắn liên hệ', load: getAdminContacts, readonly: true },
  guests: { title: 'Khách truy cập', load: getAdminGuests, readonly: true }
}

function renderCellText(val) {
  if (val === null || val === undefined) return ''
  if (typeof val === 'object') {
    return val.name || val.title || val.slug || val.displayName || String(val.id || '')
  }
  return String(val)
}

export function AdminContentPage() {
  const { section } = useParams()
  const config = configs[section] || configs.projects
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const data = await config.load()
      if (config.single) {
        setItems(data ? [data] : [])
      } else {
        setItems(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu: ' + (err.message || 'Không xác định'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    setCategoryFilter('ALL')
    setSearch('')
  }, [section])

  const filtered = useMemo(() => {
    if (!Array.isArray(items)) return []
    return items.filter(item => {
      if (!item || typeof item !== 'object') return false
      
      // Filter by category for skills
      if (section === 'skills' && categoryFilter !== 'ALL') {
        if (item.category !== categoryFilter) return false
      }

      if (!search.trim()) return true
      const query = search.toLowerCase()
      try {
        return JSON.stringify(item).toLowerCase().includes(query)
      } catch {
        return false
      }
    })
  }, [items, search, categoryFilter, section])

  async function save(e) {
    e.preventDefault()
    try {
      if (config.single) {
        await updateProfile(editing)
        toast.success('Cập nhật Thông tin Profile thành công!')
      } else if (editing.id) {
        await updateAdminItem(config.resource, editing.id, editing)
        toast.success(`Cập nhật ${config.title} thành công!`)
      } else {
        await createAdminItem(config.resource, editing)
        toast.success(`Thêm mới ${config.title} thành công!`)
      }
      setEditing(null)
      load()
    } catch (err) {
      toast.error('Lưu dữ liệu thất bại: ' + (err.message || 'Có lỗi xảy ra'))
    }
  }

  async function remove(id) {
    if (!confirm('Bạn chắc chắn muốn xóa dữ liệu này?')) return
    try {
      await deleteAdminItem(config.resource, id)
      toast.success(`Đã xóa ${config.title} thành công!`)
      load()
    } catch (err) {
      toast.error('Xóa dữ liệu thất bại: ' + (err.message || 'Có lỗi xảy ra'))
    }
  }

  async function moderate(item, status) {
    try {
      await moderateComment(item.type, item.id, status)
      toast.success(status === 'APPROVED' ? 'Đã phê duyệt bình luận!' : 'Đã từ chối bình luận!')
      load()
    } catch (err) {
      toast.error('Xử lý bình luận thất bại: ' + (err.message || 'Có lỗi xảy ra'))
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-heading">
        <div>
          <span>CONTENT MANAGEMENT</span>
          <h1>{config.title}</h1>
        </div>
        {!config.readonly && (
          <button onClick={() => setEditing(config.single ? (items[0] || {}) : section === 'skills' ? { category: SKILL_CATEGORIES[0] } : { published: true, displayOrder: items.length + 1 })}>
            <Plus /> {config.single ? 'Chỉnh sửa' : 'Thêm mới'}
          </button>
        )}
      </div>

      <div className="admin-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <Search />
            <input placeholder="Tìm kiếm dữ liệu..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {section === 'skills' && (
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">🔍 Tất cả nhóm kỹ năng</option>
              {SKILL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
        <span>{filtered.length} bản ghi</span>
      </div>

      {loading ? (
        <div className="admin-table-skeleton" />
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nội dung chính</th>
                <th>Thông tin</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Chưa có bản ghi nào.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const itemTitle = renderCellText(item.title || item.name || item.fullName || item.displayName || item.subject) || 'Bản ghi'
                  const rawSub = item.slug || item.email || item.headline || (typeof item.content === 'string' ? item.content.replace(/<[^>]*>?/gm, '').slice(0, 80) : '')
                  const itemSub = renderCellText(rawSub)
                  const itemInfo = renderCellText(item.category || item.company || item.type || item.technologies || item.location) || '—'
                  const itemStatus = renderCellText(item.status) || 'ACTIVE'

                  return (
                    <tr key={item.id || index}>
                      <td>#{item.id || index + 1}</td>
                      <td>
                        <b>{itemTitle}</b>
                        {itemSub && <small>{itemSub}</small>}
                      </td>
                      <td>{itemInfo}</td>
                      <td>
                        <span className={`status status-${itemStatus.toLowerCase()}`}>
                          {itemStatus}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          {section === 'comments' ? (
                            <>
                              <button className="approve" title="Phê duyệt" onClick={() => moderate(item, 'APPROVED')}>
                                <Check />
                              </button>
                              <button className="reject" title="Từ chối" onClick={() => moderate(item, 'REJECTED')}>
                                <X />
                              </button>
                            </>
                          ) : (
                            !config.readonly && (
                              <>
                                <button title="Chỉnh sửa" onClick={() => setEditing({ ...item })}>
                                  <Edit3 />
                                </button>
                                {!config.single && (
                                  <button className="danger" title="Xóa" onClick={() => remove(item.id)}>
                                    <Trash2 />
                                  </button>
                                )}
                              </>
                            )
                          )}
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

      {editing && (
        <div className="admin-modal">
          <form onSubmit={save}>
            <header>
              <div>
                <span>EDITOR</span>
                <h2>{editing.id ? 'Cập nhật' : 'Thêm mới'} {config.title}</h2>
              </div>
              <button type="button" onClick={() => setEditing(null)}>
                <X />
              </button>
            </header>
            <div className="admin-form-grid">
              {config.fields.map(([key, label, type = 'text', options]) => (
                <label className={type === 'rich' || type === 'textarea' ? 'wide' : ''} key={key}>
                  {type !== 'checkbox' && <span>{label}</span>}
                  {type === 'rich' ? (
                    <RichEditor value={editing[key]} onChange={value => setEditing({ ...editing, [key]: value })} />
                  ) : type === 'textarea' ? (
                    <textarea rows="4" value={editing[key] || ''} onChange={e => setEditing({ ...editing, [key]: e.target.value })} />
                  ) : type === 'select' ? (
                    <select value={editing[key] || options[0]} onChange={e => setEditing({ ...editing, [key]: e.target.value })}>
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : type === 'checkbox' ? (
                    <span className="check-field">
                      <input type="checkbox" checked={!!editing[key]} onChange={e => setEditing({ ...editing, [key]: e.target.checked })} />
                      {label}
                    </span>
                  ) : (
                    <input type={type} value={editing[key] ?? ''} onChange={e => setEditing({ ...editing, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} />
                  )}
                </label>
              ))}
            </div>
            <footer>
              <button type="button" onClick={() => setEditing(null)}>
                Hủy
              </button>
              <button className="save">
                <Check /> Lưu thay đổi
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}
