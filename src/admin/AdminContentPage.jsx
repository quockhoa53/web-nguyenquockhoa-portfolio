import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Check,
  X,
  RefreshCw,
  Mail,
  Loader2,
  ArrowUpDown,
  Filter,
  Layers,
  Sparkles,
  Eye,
  ExternalLink,
  Bot,
  BrainCircuit,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  Workflow,
  ArrowLeft,
  Calendar,
  Link2,
  FileText,
  Image as ImageIcon,
  Sliders,
  Save,
  CheckCircle2,
  Clock,
  Globe,
  Star
} from 'lucide-react'
import { useToast } from '../components/common/ToastContext'
import {
  createAdminItem,
  deleteAdminItem,
  getAdminAiFacts,
  getAdminAiInsights,
  adoptAdminAiFact,
  getAdminArticles,
  getAdminComments,
  getAdminContacts,
  getAdminGuests,
  getAdminLikes,
  getAdminProfiles,
  publishAdminProfile,
  getAdminWorkItems,
  moderateComment,
  updateAdminItem,
  updateProfile,
  testSendEmail
} from '../services/adminApi'
import {
  getExperiences,
  getKnowledgeCategories,
  getProfile,
  getProjects,
  getSkills
} from '../services/portfolioApi'
import { RichEditor } from './RichEditor'
import { AdminPagination } from './components/AdminPagination'
import { AdminImageUpload } from './components/AdminImageUpload'
import { AdminStatusBadge } from './components/AdminStatusBadge'
import { InteractiveHtmlContent } from '../components/common/InteractiveHtmlContent'

const SKILL_CATEGORIES = [
  'Backend & Architecture',
  'Database',
  'Data Processing',
  'AI & Tools'
]

const AI_FACT_CATEGORIES = [
  'Đời tư & Mối quan hệ',
  'Sở thích & Đời sống cá nhân',
  'Giải thưởng & Thành tựu',
  'Quan điểm & Phong cách làm việc',
  'Thú cưng & Gia đình',
  'Khác'
]

const configs = {
  likes: { title: 'Lượt Yêu Thích', load: getAdminLikes, readonly: true },
  profile: {
    title: 'Hồ Sơ & Thông Tin Cá Nhân',
    modal: false,
    load: getAdminProfiles,
    resource: 'profiles',
    fields: [
      ['versionName', 'Tên phiên bản hồ sơ (vd: Software Engineer, Lead Developer, AI Specialist...)'],
      ['fullName', 'Họ và tên'],
      ['headline', 'Chức danh'],
      ['email', 'Email liên hệ', 'email'],
      ['phone', 'Số điện thoại'],
      ['location', 'Địa chỉ / Tỉnh thành'],
      ['avatarUrl', 'Ảnh đại diện', 'image_upload', 'portfolio/avatars'],
      ['facebookUrl', 'Link Facebook (URL)'],
      ['githubUrl', 'Link GitHub (URL)'],
      ['linkedinUrl', 'Link LinkedIn (URL)'],
      ['isPublished', 'Đặt làm hồ sơ chính thức hiển thị ngoài trang chủ Portfolio', 'checkbox'],
      ['shortBio', 'Mô tả ngắn trên trang chủ', 'textarea'],
      ['education', 'Học vấn & Bằng cấp (JSON/Text)', 'textarea'],
      ['bio', 'Nội dung chi tiết Profile', 'rich']
    ]
  },
  skills: {
    title: 'Năng Lực Kỹ Thuật',
    modal: true,
    load: getSkills,
    resource: 'skills',
    fields: [
      ['name', 'Tên kỹ năng'],
      ['category', 'Nhóm kỹ năng', 'select', SKILL_CATEGORIES],
      ['proficiency', 'Mức độ thông thạo (%)', 'number'],
      ['displayOrder', 'Thứ tự hiển thị', 'number']
    ]
  },
  experiences: {
    title: 'Kinh Nghiệm Làm Việc',
    modal: false,
    load: getExperiences,
    resource: 'experiences',
    fields: [
      ['company', 'Công ty / Tổ chức'],
      ['position', 'Vị trí công việc'],
      ['startDate', 'Ngày bắt đầu', 'date'],
      ['endDate', 'Ngày kết thúc (để trống nếu hiện tại)', 'date'],
      ['displayOrder', 'Thứ tự hiển thị', 'number'],
      ['description', 'Mô tả chi tiết kinh nghiệm', 'rich']
    ]
  },
  projects: {
    title: 'Dự Án Tiêu Biểu',
    modal: false,
    load: getProjects,
    resource: 'projects',
    fields: [
      ['title', 'Tên dự án'],
      ['summary', 'Mô tả ngắn dự án (hiển thị trên thẻ card & đầu trang chi tiết)', 'textarea'],
      ['technologies', 'Công nghệ sử dụng (vd: Spring Boot, PostgreSQL, Docker)'],
      ['imageUrl', 'Ảnh bìa dự án', 'image_upload', 'portfolio/projects'],
      ['demoUrl', 'Link Demo / Live Web (URL)'],
      ['sourceUrl', 'Link Source Code (GitHub URL)'],
      ['displayOrder', 'Thứ tự hiển thị', 'number'],
      ['featured', 'Đánh dấu nổi bật trên trang chủ', 'checkbox'],
      ['description', 'Nội dung chi tiết dự án', 'rich']
    ]
  },
  categories: {
    title: 'Danh Mục Kiến Thức',
    modal: true,
    load: getKnowledgeCategories,
    resource: 'knowledge/categories',
    fields: [
      ['name', 'Tên danh mục'],
      ['slug', 'Slug định danh URL (Tùy chọn)'],
      ['displayOrder', 'Thứ tự hiển thị', 'number'],
      ['description', 'Mô tả danh mục', 'textarea']
    ]
  },
  articles: {
    title: 'Bài Viết Kiến Thức',
    modal: false,
    load: getAdminArticles,
    resource: 'knowledge/articles',
    fields: [
      ['categoryId', 'Danh mục bài viết', 'category_select'],
      ['title', 'Tiêu đề bài viết'],
      ['thumbnailUrl', 'Ảnh bìa bài viết', 'image_upload', 'portfolio/articles'],
      ['status', 'Trạng thái bài viết', 'select', ['PUBLISHED', 'DRAFT', 'ARCHIVED']],
      ['featured', 'Đánh dấu bài viết nổi bật', 'checkbox'],
      ['summary', 'Tóm tắt ngắn gọn', 'textarea'],
      ['content', 'Nội dung chi tiết bài viết', 'rich']
    ]
  },
  'work-items': {
    title: 'Quá Trình Làm Việc',
    modal: false,
    load: getAdminWorkItems,
    resource: 'work-items',
    fields: [
      ['title', 'Tiêu đề công việc'],
      ['slug', 'Slug định danh URL (Tùy chọn)'],
      ['period', 'Thời gian (vd: 2024 - Hiện tại)'],
      ['role', 'Vai trò / Chức vụ'],
      ['company', 'Công ty / Tổ chức'],
      ['technologies', 'Công nghệ liên quan'],
      ['displayOrder', 'Thứ tự hiển thị', 'number'],
      ['published', 'Đã xuất bản lên web', 'checkbox'],
      ['summary', 'Tóm tắt công việc', 'rich'],
      ['content', 'Chi tiết quá trình làm việc', 'rich']
    ]
  },
  'ai-facts': {
    title: 'Bộ Nhớ AI (AI Persona Facts)',
    modal: true,
    load: getAdminAiFacts,
    resource: 'ai-facts',
    fields: [
      ['category', 'Phân loại chủ đề', 'select', AI_FACT_CATEGORIES],
      ['title', 'Tiêu đề / Chủ đề (Ví dụ: Sở thích, Học vấn, Quan điểm...)'],
      ['displayOrder', 'Thứ tự ưu tiên', 'number'],
      ['isActive', 'Kích hoạt cho AI đọc', 'checkbox'],
      ['content', 'Nội dung chi tiết nạp cho AI Assistant', 'textarea']
    ]
  },
  comments: { title: 'Kiểm Duyệt Bình Luận', load: getAdminComments, readonly: true },
  contacts: { title: 'Tin Nhắn Khách Hàng', load: getAdminContacts, readonly: true },
  guests: { title: 'Khách Truy Cập', load: getAdminGuests, readonly: true }
}

export function AdminContentPage() {
  const { section } = useParams()
  const config = configs[section] || configs.projects
  const [items, setItems] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
  const [editing, setEditing] = useState(null)
  const [viewingItem, setViewingItem] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('DEFAULT') // 'DEFAULT' | 'NEWEST' | 'ORDER'
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [testingMail, setTestingMail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const toast = useToast()

  const DEFAULT_AI_INSIGHTS = useMemo(() => ({
    total_conversations: 0,
    total_messages: 0,
    positive_ratings: 0,
    negative_ratings: 0,
    satisfaction_rate: 100,
    top_inquiries: [],
    suggested_facts: []
  }), [])

  const [aiInsights, setAiInsights] = useState(DEFAULT_AI_INSIGHTS)
  const [loadingInsights, setLoadingInsights] = useState(false)

  const fetchLiveInsights = useCallback(async () => {
    setLoadingInsights(true)
    try {
      const data = await getAdminAiInsights()
      if (data) {
        setAiInsights(data.data || data)
      }
    } catch {
      // ignore
    } finally {
      setLoadingInsights(false)
    }
  }, [])

  // Fetch AI Learning Insights when on ai-facts section
  useEffect(() => {
    if (section === 'ai-facts') {
      fetchLiveInsights()
    }
  }, [section, fetchLiveInsights])

  async function handleAdoptFact(fact) {
    try {
      const created = await createAdminItem('ai-facts', {
        category: fact.category,
        title: fact.title,
        content: fact.content,
        isActive: true,
        displayOrder: items.length + 1
      })
      setItems(prev => [created || { ...fact, id: Date.now(), isActive: true }, ...prev])
      toast.success(`Đã nạp thành công "${fact.title}" vào Bộ nhớ AI!`)
      setAiInsights(prev => prev ? {
        ...prev,
        suggested_facts: prev.suggested_facts.filter(f => f.title !== fact.title)
      } : null)
    } catch (err) {
      toast.error('Lỗi khi nạp Fact: ' + err.message)
    }
  }

  function handleRejectFact(factTitle) {
    setAiInsights(prev => prev ? {
      ...prev,
      suggested_facts: prev.suggested_facts.filter(f => f.title !== factTitle)
    } : null)
    toast.success('Đã bỏ qua gợi ý Fact này!')
  }

  function handleEditSuggestedFact(fact) {
    setEditing({
      category: fact.category,
      title: fact.title,
      content: fact.content,
      isActive: true,
      displayOrder: items.length + 1
    })
  }

  async function handlePublishProfile(id) {
    try {
      await publishAdminProfile(id)
      setItems(prev => prev.map(p => ({ ...p, isPublished: p.id === id })))
      toast.success('Đã xuất bản phiên bản hồ sơ này ra ngoài trang chủ Portfolio!')
      load()
    } catch (err) {
      toast.error('Không thể xuất bản hồ sơ: ' + (err.message || 'Lỗi server'))
    }
  }

  async function handleTestMail() {
    setTestingMail(true)
    try {
      const res = await testSendEmail()
      toast.success(res?.message || 'Đã gửi email test thành công! Vui lòng kiểm tra hộp thư.')
    } catch (err) {
      toast.error('Lỗi khi gửi email test: ' + (err.message || 'Không thể gửi'))
    } finally {
      setTestingMail(false)
    }
  }

  // Load categories list for dropdown mapping
  useEffect(() => {
    getKnowledgeCategories()
      .then(cats => setCategoriesList(Array.isArray(cats) ? cats : []))
      .catch(() => setCategoriesList([]))
  }, [])

  async function load(isManualRefresh = false) {
    if (isManualRefresh) setIsRefreshing(true)
    else setLoading(true)

    try {
      const data = await config.load()
      if (config.single) {
        setItems(data ? [data] : [])
      } else {
        setItems(Array.isArray(data) ? data : (data ? [data] : []))
      }
      if (isManualRefresh) {
        toast.success(`Đã làm mới danh sách ${config.title}!`)
      }
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu: ' + (err.message || 'Không xác định'))
      if (!isManualRefresh) setItems([])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    setCategoryFilter('ALL')
    setSearch('')
    setCurrentPage(1)
    setSortBy('DEFAULT')
    setEditing(null)
    setViewingItem(null)
  }, [section])

  // Filter and Sort Data
  const sortedAndFiltered = useMemo(() => {
    if (!Array.isArray(items)) return []

    let list = items.filter(item => {
      if (!item || typeof item !== 'object') return false

      if (section === 'skills' && categoryFilter !== 'ALL') {
        if (item.category !== categoryFilter) return false
      }

      if (section === 'articles' && categoryFilter !== 'ALL') {
        if (String(item.categoryId) !== String(categoryFilter)) return false
      }

      if (!search.trim()) return true
      const query = search.toLowerCase()
      try {
        return JSON.stringify(item).toLowerCase().includes(query)
      } catch {
        return false
      }
    })

    // Sắp xếp OrderBy
    return list.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return (b.id || 0) - (a.id || 0)
      }
      if (sortBy === 'ORDER') {
        return (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
      }
      // Default: If isPublished is available, place published first
      if (a.isPublished !== undefined && b.isPublished !== undefined) {
        if (a.isPublished && !b.isPublished) return -1
        if (!a.isPublished && b.isPublished) return 1
      }
      if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
        return a.displayOrder - b.displayOrder
      }
      return (b.id || 0) - (a.id || 0)
    })
  }, [items, search, categoryFilter, sortBy, section])

  // Paginated Sliced Data
  const paginatedItems = useMemo(() => {
    if (config.single) return sortedAndFiltered
    const start = (currentPage - 1) * pageSize
    return sortedAndFiltered.slice(start, start + pageSize)
  }, [sortedAndFiltered, currentPage, pageSize, config.single])

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter, sortBy])

  function handleOpenCreate() {
    if (section === 'profile') {
      setEditing({
        versionName: `Phiên bản #${items.length + 1}`,
        fullName: items[0]?.fullName || 'Nguyễn Quốc Khoa',
        headline: items[0]?.headline || 'Software Engineer',
        email: items[0]?.email || 'hello@example.com',
        phone: items[0]?.phone || '',
        location: items[0]?.location || '',
        avatarUrl: items[0]?.avatarUrl || '',
        facebookUrl: items[0]?.facebookUrl || '',
        githubUrl: items[0]?.githubUrl || '',
        linkedinUrl: items[0]?.linkedinUrl || '',
        isPublished: false,
        shortBio: items[0]?.shortBio || '',
        education: items[0]?.education || '',
        bio: items[0]?.bio || ''
      })
    } else if (section === 'skills') {
      setEditing({ category: SKILL_CATEGORIES[0], proficiency: 85, displayOrder: items.length + 1 })
    } else if (section === 'categories') {
      setEditing({ name: '', slug: '', displayOrder: items.length + 1, description: '' })
    } else if (section === 'ai-facts') {
      setEditing({ category: AI_FACT_CATEGORIES[0], title: '', displayOrder: items.length + 1, isActive: true, content: '' })
    } else if (section === 'articles') {
      setEditing({
        categoryId: categoriesList[0]?.id || 1,
        title: '',
        summary: '',
        content: '',
        thumbnailUrl: '',
        status: 'PUBLISHED',
        featured: false
      })
    } else if (section === 'work-items') {
      setEditing({ published: true, displayOrder: items.length + 1, period: '', role: '', company: '', title: '', summary: '', content: '', technologies: '' })
    } else {
      setEditing({ published: true, displayOrder: items.length + 1 })
    }
  }

  async function save(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (!editing) return

    setIsSaving(true)
    try {
      if (editing.id) {
        const updated = await updateAdminItem(config.resource, editing.id, editing)
        // Instant optimistic local update
        setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...editing, ...(updated || {}) } : i))
        toast.success(`Cập nhật ${config.title} thành công!`)
        setEditing(null)
      } else {
        const created = await createAdminItem(config.resource, editing)
        // Instant optimistic insert
        setItems(prev => [created || { ...editing, id: Date.now() }, ...prev])
        toast.success(`Thêm mới ${config.title} thành công!`)
        setEditing(null)
      }
      // Background sync
      load()
    } catch (err) {
      toast.error('Lưu dữ liệu thất bại: ' + (err.message || 'Có lỗi xảy ra'))
    } finally {
      setIsSaving(false)
    }
  }

  async function remove(id) {
    if (!confirm('Bạn chắc chắn muốn xóa bản ghi này? Thao tác này không thể hoàn tác.')) return
    try {
      await deleteAdminItem(config.resource, id)
      setItems(items.filter(i => i.id !== id))
      toast.success('Xóa bản ghi thành công!')
    } catch (err) {
      toast.error('Xóa thất bại: ' + (err.message || 'Có lỗi xảy ra'))
    }
  }

  async function moderate(comment, status) {
    try {
      await moderateComment(comment.id, status)
      setItems(items.map(i => (i.id === comment.id ? { ...i, status } : i)))
      toast.success(`Đã cập nhật trạng thái bình luận: ${status}!`)
    } catch (err) {
      toast.error('Cập nhật trạng thái thất bại: ' + (err.message || 'Có lỗi xảy ra'))
    }
  }

  // ================= 1. DETAIL VIEW =================
  if (viewingItem) {
    const rawDetailStatus = viewingItem.status || (viewingItem.isPublished !== undefined ? (viewingItem.isPublished ? 'PUBLISHED' : 'DRAFT') : (viewingItem.published === false ? 'DRAFT' : (viewingItem.isActive === false ? 'INACTIVE' : 'ACTIVE')))

    // 1A. COMPACT MODAL DETAIL VIEW (For skills, categories, ai-facts)
    if (config.modal) {
      return (
        <div className="admin-modal-backdrop" onClick={() => setViewingItem(null)}>
          <div className="admin-modal-card-compact" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-tag">CHI TIẾT • {config.title.toUpperCase()}</span>
                <h2>{viewingItem.name || viewingItem.title || config.title} {viewingItem.id && `#${viewingItem.id}`}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setViewingItem(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="detail-spec-list">
                {viewingItem.id && (
                  <div className="detail-spec-row">
                    <span>Mã định danh (ID)</span>
                    <b>#{viewingItem.id}</b>
                  </div>
                )}
                {viewingItem.name && (
                  <div className="detail-spec-row">
                    <span>Tên</span>
                    <b>{viewingItem.name}</b>
                  </div>
                )}
                {viewingItem.title && (
                  <div className="detail-spec-row">
                    <span>Tiêu đề</span>
                    <b>{viewingItem.title}</b>
                  </div>
                )}
                {viewingItem.category && (
                  <div className="detail-spec-row">
                    <span>Phân loại nhóm</span>
                    <b>{viewingItem.category}</b>
                  </div>
                )}
                {viewingItem.proficiency !== undefined && (
                  <div className="detail-spec-row">
                    <span>Mức độ thông thạo</span>
                    <b>{viewingItem.proficiency}%</b>
                  </div>
                )}
                {viewingItem.displayOrder !== undefined && (
                  <div className="detail-spec-row">
                    <span>Thứ tự hiển thị</span>
                    <b>{viewingItem.displayOrder}</b>
                  </div>
                )}
                {viewingItem.slug && (
                  <div className="detail-spec-row">
                    <span>Slug URL</span>
                    <b>{viewingItem.slug}</b>
                  </div>
                )}
                <div className="detail-spec-row">
                  <span>Trạng thái</span>
                  <AdminStatusBadge status={rawDetailStatus} />
                </div>
              </div>

              {viewingItem.content && (
                <div>
                  <label className="field-label-small" style={{ marginBottom: 6, display: 'block' }}>Nội dung chi tiết:</label>
                  <div className="detail-summary-text">{viewingItem.content}</div>
                </div>
              )}

              {viewingItem.description && (
                <div>
                  <label className="field-label-small" style={{ marginBottom: 6, display: 'block' }}>Mô tả:</label>
                  <div className="detail-summary-text">{viewingItem.description}</div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setViewingItem(null)}
              >
                Đóng
              </button>
              {!config.readonly && (
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => {
                    setEditing({ ...viewingItem })
                    setViewingItem(null)
                  }}
                >
                  <Edit3 size={14} />
                  <span>Chỉnh sửa</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    // 1B. FULL-PAGE DETAIL VIEW (For profile, projects, articles, work-items, experiences)
    return (
      <div className="admin-fullpage-detail-layout">
        {/* Header Bar */}
        <div className="admin-fullpage-header">
          <div className="fullpage-header-left">
            <button
              type="button"
              className="btn-back-to-list"
              onClick={() => setViewingItem(null)}
            >
              <ArrowLeft size={16} />
              <span>Quay lại danh sách</span>
            </button>

            <div className="fullpage-title-wrap">
              <span className="fullpage-eyebrow">CHI TIẾT BẢN GHI • {config.title.toUpperCase()}</span>
              <h2>{viewingItem.versionName || viewingItem.title || viewingItem.name || viewingItem.company || viewingItem.fullName || config.title} {viewingItem.id && `#${viewingItem.id}`}</h2>
            </div>
          </div>

          <div className="fullpage-header-right">
            {section === 'profile' && !viewingItem.isPublished && (
              <button
                type="button"
                className="admin-btn-secondary"
                style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.12))', borderColor: '#10b981', color: '#059669' }}
                onClick={() => {
                  handlePublishProfile(viewingItem.id)
                  setViewingItem(prev => ({ ...prev, isPublished: true }))
                }}
              >
                <Star size={15} fill="#10b981" color="#10b981" />
                <span>Đặt làm Profile chính thức</span>
              </button>
            )}

            {!config.readonly && (
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => {
                  setEditing({ ...viewingItem })
                  setViewingItem(null)
                }}
              >
                <Edit3 size={15} />
                <span>Chỉnh sửa bản ghi</span>
              </button>
            )}
          </div>
        </div>

        {/* Detail Content Body */}
        <div className="admin-fullpage-body">
          <div className="admin-detail-grid-modern">
            {/* Left Main Content */}
            <div className="admin-detail-main">
              {/* Cover Preview */}
              {(viewingItem.thumbnailUrl || viewingItem.coverUrl || viewingItem.imageUrl || viewingItem.avatarUrl) && (
                <div className="admin-detail-cover-card">
                  <img
                    src={viewingItem.thumbnailUrl || viewingItem.coverUrl || viewingItem.imageUrl || viewingItem.avatarUrl}
                    alt="Cover"
                  />
                </div>
              )}

              {/* Summary / Headline */}
              {(viewingItem.summary || viewingItem.shortBio || viewingItem.headline) && (
                <div className="admin-editor-card">
                  <h4 className="detail-card-heading">
                    <FileText size={15} /> Tóm tắt / Chức danh
                  </h4>
                  <p className="detail-summary-text">{viewingItem.summary || viewingItem.shortBio || viewingItem.headline}</p>
                </div>
              )}

              {/* Education */}
              {viewingItem.education && (
                <div className="admin-editor-card">
                  <h4 className="detail-card-heading">
                    <Calendar size={15} /> Học vấn &amp; Bằng cấp
                  </h4>
                  <p className="detail-summary-text">{viewingItem.education}</p>
                </div>
              )}

              {/* Rich Body Content */}
              {(viewingItem.content || viewingItem.description || viewingItem.bio) && (
                <div className="admin-editor-card">
                  <h4 className="detail-card-heading">
                    <Sparkles size={15} /> Nội dung chi tiết
                  </h4>
                  <div className="detail-rich-preview">
                    <InteractiveHtmlContent
                      html={viewingItem.content || viewingItem.description || viewingItem.bio}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Meta Sidebar */}
            <div className="admin-detail-sidebar">
              <div className="admin-editor-card">
                <h4 className="detail-card-heading">
                  <Sliders size={15} /> Thông số kỹ thuật
                </h4>

                <div className="detail-spec-list">
                  {viewingItem.id && (
                    <div className="detail-spec-row">
                      <span>Mã định danh (ID)</span>
                      <b>#{viewingItem.id}</b>
                    </div>
                  )}

                  <div className="detail-spec-row">
                    <span>Trạng thái</span>
                    <AdminStatusBadge status={rawDetailStatus} />
                  </div>

                  {viewingItem.fullName && (
                    <div className="detail-spec-row">
                      <span>Họ và tên</span>
                      <b>{viewingItem.fullName}</b>
                    </div>
                  )}

                  {viewingItem.email && (
                    <div className="detail-spec-row">
                      <span>Email</span>
                      <b>{viewingItem.email}</b>
                    </div>
                  )}

                  {viewingItem.phone && (
                    <div className="detail-spec-row">
                      <span>Số điện thoại</span>
                      <b>{viewingItem.phone}</b>
                    </div>
                  )}

                  {viewingItem.location && (
                    <div className="detail-spec-row">
                      <span>Địa chỉ</span>
                      <b>{viewingItem.location}</b>
                    </div>
                  )}

                  {(viewingItem.category || viewingItem.categoryId) && (
                    <div className="detail-spec-row">
                      <span>Chuyên mục</span>
                      <b>{categoriesList.find(c => c.id === viewingItem.categoryId)?.name || viewingItem.category || '—'}</b>
                    </div>
                  )}

                  {viewingItem.technologies && (
                    <div className="detail-spec-row">
                      <span>Công nghệ</span>
                      <b style={{ color: 'var(--adm-primary)' }}>{viewingItem.technologies}</b>
                    </div>
                  )}

                  {viewingItem.proficiency !== undefined && (
                    <div className="detail-spec-row">
                      <span>Độ thông thạo</span>
                      <b>{viewingItem.proficiency}%</b>
                    </div>
                  )}

                  {viewingItem.displayOrder !== undefined && (
                    <div className="detail-spec-row">
                      <span>Thứ tự hiển thị</span>
                      <b>{viewingItem.displayOrder}</b>
                    </div>
                  )}
                </div>

                {/* External Links */}
                {(viewingItem.demoUrl || viewingItem.sourceUrl || viewingItem.facebookUrl || viewingItem.githubUrl || viewingItem.linkedinUrl) && (
                  <div className="detail-links-section">
                    <span className="detail-links-title">
                      <Link2 size={13} /> Liên kết ngoài:
                    </span>
                    <div className="detail-links-list">
                      {viewingItem.demoUrl && (
                        <a href={viewingItem.demoUrl} target="_blank" rel="noreferrer" className="detail-ext-link">
                          <Globe size={13} /> Live Demo URL <ExternalLink size={11} />
                        </a>
                      )}
                      {viewingItem.sourceUrl && (
                        <a href={viewingItem.sourceUrl} target="_blank" rel="noreferrer" className="detail-ext-link">
                          <Link2 size={13} /> Source Code <ExternalLink size={11} />
                        </a>
                      )}
                      {viewingItem.githubUrl && (
                        <a href={viewingItem.githubUrl} target="_blank" rel="noreferrer" className="detail-ext-link">
                          <Globe size={13} /> GitHub Profile <ExternalLink size={11} />
                        </a>
                      )}
                      {viewingItem.linkedinUrl && (
                        <a href={viewingItem.linkedinUrl} target="_blank" rel="noreferrer" className="detail-ext-link">
                          <Globe size={13} /> LinkedIn Profile <ExternalLink size={11} />
                        </a>
                      )}
                      {viewingItem.facebookUrl && (
                        <a href={viewingItem.facebookUrl} target="_blank" rel="noreferrer" className="detail-ext-link">
                          <Globe size={13} /> Facebook Profile <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ================= 2. EDITOR VIEW =================
  if (editing) {
    // 2A. COMPACT MODAL EDITOR (For skills, categories, ai-facts)
    if (config.modal) {
      return (
        <div className="admin-modal-backdrop" onClick={() => !isSaving && setEditing(null)}>
          <div className="admin-modal-card-compact" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-tag">{config.title.toUpperCase()}</span>
                <h2>{editing.id ? 'Cập Nhật' : 'Thêm Mới'} {config.title}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditing(null)}
                disabled={isSaving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={save}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {config.fields.map(([key, label, type = 'text', options, uploadFolder]) => (
                  <div key={key} className="form-field-group">
                    {type !== 'checkbox' && (
                      <label className="field-label">{label}</label>
                    )}

                    {type === 'image_upload' ? (
                      <AdminImageUpload
                        label={label}
                        value={editing[key] || ''}
                        folder={uploadFolder || 'portfolio/images'}
                        onChange={(url) => setEditing({ ...editing, [key]: url })}
                      />
                    ) : type === 'category_select' ? (
                      <select
                        className="admin-select-input"
                        value={editing.categoryId || (categoriesList[0]?.id ?? '')}
                        onChange={e => setEditing({ ...editing, categoryId: Number(e.target.value) })}
                      >
                        {categoriesList.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    ) : type === 'select' ? (
                      <select
                        className="admin-select-input"
                        value={editing[key] || options[0]}
                        onChange={e => setEditing({ ...editing, [key]: e.target.value })}
                      >
                        {options.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : type === 'checkbox' ? (
                      <label className="admin-checkbox-card">
                        <input
                          type="checkbox"
                          checked={!!editing[key]}
                          onChange={e => setEditing({ ...editing, [key]: e.target.checked })}
                        />
                        <span className="checkbox-text">
                          <strong>{label}</strong>
                        </span>
                      </label>
                    ) : type === 'textarea' ? (
                      <textarea
                        className="admin-textarea-input"
                        rows={4}
                        placeholder={`Nhập ${label.toLowerCase()}...`}
                        value={editing[key] || ''}
                        onChange={e => setEditing({ ...editing, [key]: e.target.value })}
                      />
                    ) : (
                      <input
                        className="admin-text-input"
                        type={type}
                        placeholder={`Nhập ${label.toLowerCase()}...`}
                        value={editing[key] ?? ''}
                        onChange={e =>
                          setEditing({
                            ...editing,
                            [key]: type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
                          })
                        }
                        required={key === 'name' || key === 'title'}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setEditing(null)}
                  disabled={isSaving}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="modal-btn-save"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={15} />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>{editing.id ? 'Lưu cập nhật' : 'Tạo mới'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    }

    // 2B. FULL-PAGE EDITOR (For profile, projects, articles, work-items, experiences)
    const mainFields = config.fields.filter(([key, _, type]) => type === 'rich' || type === 'textarea' || key === 'title' || key === 'versionName' || key === 'fullName' || key === 'name' || key === 'company')
    const sideFields = config.fields.filter(([key, _, type]) => !mainFields.some(m => m[0] === key))

    return (
      <div className="admin-fullpage-editor-layout">
        {/* Header Action Bar */}
        <div className="admin-fullpage-header">
          <div className="fullpage-header-left">
            <button
              type="button"
              className="btn-back-to-list"
              onClick={() => setEditing(null)}
              disabled={isSaving}
            >
              <ArrowLeft size={16} />
              <span>Quay lại danh sách</span>
            </button>

            <div className="fullpage-title-wrap">
              <span className="fullpage-eyebrow">
                SOẠN THẢO NỘI DUNG • {config.title.toUpperCase()}
              </span>
              <h2>
                {editing.id ? 'Cập Nhật' : 'Thêm Mới'} {config.title} {editing.id ? `#${editing.id}` : ''}
              </h2>
            </div>
          </div>

          <div className="fullpage-header-right">
            <button
              type="button"
              className="admin-btn-secondary"
              disabled={isSaving}
              onClick={() => setEditing(null)}
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              className="admin-btn-primary"
              disabled={isSaving}
              onClick={save}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Full-Page Editor Body (2 Spacious Columns) */}
        <form onSubmit={save} className="admin-fullpage-body">
          <div className="admin-editor-grid-modern">
            {/* 1. Main Column (70% Width) */}
            <div className="admin-editor-main-col">
              {/* Primary Title / Name input */}
              {config.fields.filter(([key]) => key === 'title' || key === 'versionName' || key === 'fullName' || key === 'name' || key === 'company').map(([key, label, type = 'text']) => (
                <div key={key} className="admin-editor-card title-card">
                  <label className="field-label-large">
                    <span>{label}</span>
                  </label>
                  <input
                    type={type}
                    className="admin-title-hero-input"
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                    value={editing[key] || ''}
                    onChange={e => setEditing({ ...editing, [key]: e.target.value })}
                    required={key === 'title' || key === 'fullName' || key === 'name' || key === 'company'}
                  />
                </div>
              ))}

              {/* Summary / Headline textareas */}
              {config.fields.filter(([key, _, type]) => type === 'textarea' && key !== 'content' && key !== 'bio').map(([key, label]) => (
                <div key={key} className="admin-editor-card">
                  <label className="field-label">
                    <FileText size={14} />
                    <span>{label}</span>
                  </label>
                  <textarea
                    className="admin-textarea-input"
                    rows={4}
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                    value={editing[key] || ''}
                    onChange={e => setEditing({ ...editing, [key]: e.target.value })}
                  />
                </div>
              ))}

              {/* Rich Content / Bio / Description editors */}
              {config.fields.filter(([_, __, type]) => type === 'rich').map(([key, label]) => (
                <div key={key} className="admin-editor-card rich-card">
                  <div className="rich-card-header">
                    <label className="field-label-prominent">
                      <Sparkles size={16} />
                      <span>{label}</span>
                    </label>
                  </div>

                  <div className="rich-editor-fullpage-wrap">
                    <RichEditor
                      value={editing[key] || ''}
                      onChange={value => setEditing({ ...editing, [key]: value })}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Sidebar Column (30% Width) */}
            <div className="admin-editor-side-col">
              {/* Image Uploader */}
              {config.fields.filter(([_, __, type]) => type === 'image_upload').map(([key, label, _, uploadFolder]) => (
                <div key={key} className="admin-editor-card">
                  <AdminImageUpload
                    label={label}
                    value={editing[key] || ''}
                    folder={uploadFolder || 'portfolio/images'}
                    onChange={(url) => setEditing({ ...editing, [key]: url })}
                  />
                </div>
              ))}

              {/* Settings, Categorization & Metadata */}
              <div className="admin-editor-card">
                <h4 className="side-card-heading">
                  <Sliders size={15} /> Thuộc tính &amp; Phân loại
                </h4>

                <div className="side-fields-stack">
                  {sideFields.filter(([_, __, type]) => type !== 'image_upload').map(([key, label, type = 'text', options]) => (
                    <div key={key} className="side-field-group">
                      {type !== 'checkbox' && (
                        <label className="field-label-small">
                          <span>{label}</span>
                        </label>
                      )}

                      {type === 'category_select' ? (
                        <select
                          className="admin-select-input"
                          value={editing.categoryId || (categoriesList[0]?.id ?? '')}
                          onChange={e => setEditing({ ...editing, categoryId: Number(e.target.value) })}
                        >
                          {categoriesList.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      ) : type === 'select' ? (
                        <select
                          className="admin-select-input"
                          value={editing[key] || options[0]}
                          onChange={e => setEditing({ ...editing, [key]: e.target.value })}
                        >
                          {options.map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : type === 'checkbox' ? (
                        <label className="admin-checkbox-card">
                          <input
                            type="checkbox"
                            checked={!!editing[key]}
                            onChange={e => setEditing({ ...editing, [key]: e.target.checked })}
                          />
                          <span className="checkbox-text">
                            <strong>{label}</strong>
                          </span>
                        </label>
                      ) : (
                        <input
                          className="admin-text-input"
                          type={type}
                          placeholder={`Nhập ${label.toLowerCase()}...`}
                          value={editing[key] ?? ''}
                          onChange={e =>
                            setEditing({
                              ...editing,
                              [key]: type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
                            })
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Card Shortcut */}
              <div className="admin-editor-card side-save-card">
                <button
                  type="submit"
                  className="admin-btn-primary full-width"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Lưu thay đổi ngay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }

  // ================= 3. STANDARD DATA TABLE LIST VIEW =================
  return (
    <div className="admin-page">
      {/* Top Header */}
      <div className="admin-heading">
        <div>
          <span className="admin-badge-category">QUẢN TRỊ NỘI DUNG</span>
          <h1>{config.title}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--adm-text-sub)' }}>
            {section === 'profile'
              ? 'Quản lý các phiên bản Profile cá nhân (Chỉ phiên bản được Xuất bản/Publish sẽ hiển thị trên trang Portfolio ngoài client)'
              : `Quản lý, tìm kiếm và cập nhật dữ liệu ${config.title.toLowerCase()} trong hệ thống`}
          </p>
        </div>

        <div className="admin-heading-actions">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => load(true)}
            className="admin-btn-secondary"
            disabled={isRefreshing}
            title="Làm mới dữ liệu từ máy chủ"
          >
            <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={15} />
            <span>Làm mới</span>
          </button>

          {/* Test Email Button for Contacts */}
          {section === 'contacts' && (
            <button
              type="button"
              disabled={testingMail}
              onClick={handleTestMail}
              className="admin-btn-test-mail"
            >
              {testingMail ? <Loader2 className="animate-spin" size={14} /> : <Mail size={14} />}
              <span>{testingMail ? 'Đang gửi test...' : 'Test Gửi Email'}</span>
            </button>
          )}

          {/* Primary Create Button */}
          {!config.readonly && (
            <button className="admin-btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} />
              <span>{section === 'profile' ? 'Tạo phiên bản Profile mới' : 'Thêm mới'}</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Continuous Learning & Intelligence Center Banner (When in ai-facts) */}
      {section === 'ai-facts' && (
        <div className="ai-learning-center">
          <div className="ai-learning-header">
            <div className="ai-learning-title-box">
              <div className="ai-learning-icon-glow">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3>Trung Tâm Trí Tuệ &amp; Tự Học Của AI Assistant</h3>
                <p>Tự động phân tích hội thoại người dùng, phát hiện khoảng trống tri thức và đúc kết Fact mới</p>
              </div>
            </div>
            <button
              type="button"
              className="admin-btn-secondary"
              style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={fetchLiveInsights}
              disabled={loadingInsights}
              title="Phân tích lại hội thoại và làm mới gợi ý từ AI"
            >
              <RefreshCw size={13} className={loadingInsights ? 'animate-spin' : ''} />
              <span>{loadingInsights ? 'Đang phân tích...' : 'Làm mới phân tích AI'}</span>
            </button>
          </div>

          {aiInsights && (
            <>
              {/* Insight Stat Metrics */}
              <div className="ai-insights-grid">
                <div className="ai-insight-card">
                  <span className="ai-insight-label">
                    <MessageSquare size={13} /> Hội thoại &amp; Tin nhắn
                  </span>
                  <span className="ai-insight-val">{aiInsights.total_conversations || 0}</span>
                  <span className="ai-insight-sub">{aiInsights.total_messages || 0} lượt trao đổi ghi nhận</span>
                </div>

                <div className="ai-insight-card">
                  <span className="ai-insight-label">
                    <ThumbsUp size={13} style={{ color: '#10b981' }} /> Độ hài lòng người dùng
                  </span>
                  <span className="ai-insight-val" style={{ color: '#10b981' }}>
                    {aiInsights.satisfaction_rate || 100}%
                  </span>
                  <span className="ai-insight-sub">
                    👍 {aiInsights.positive_ratings || 0} hữu ích &nbsp;|&nbsp; 👎 {aiInsights.negative_ratings || 0} chưa hài lòng
                  </span>
                </div>

                <div className="ai-insight-card">
                  <span className="ai-insight-label">
                    <Lightbulb size={13} style={{ color: 'var(--adm-primary)' }} /> Tri thức đúc kết
                  </span>
                  <span className="ai-insight-val" style={{ color: 'var(--adm-primary)' }}>
                    {aiInsights.suggested_facts?.length || 0}
                  </span>
                  <span className="ai-insight-sub">Đề xuất mới từ câu hỏi thực tế</span>
                </div>
              </div>

              {/* AI Suggested Facts for 1-Click Adoption */}
              {aiInsights.suggested_facts && aiInsights.suggested_facts.length > 0 && (
                <div className="ai-suggestions-section">
                  <div className="ai-suggestions-title">
                    <Sparkles size={14} style={{ color: 'var(--adm-primary)' }} />
                    <span>Gợi ý nạp Fact mới (Đúc kết từ hội thoại của khách truy cập):</span>
                  </div>

                  <div className="ai-suggested-facts-grid">
                    {aiInsights.suggested_facts.map((sug, idx) => (
                      <div key={idx} className="ai-suggested-fact-card">
                        <div>
                          <span className="suggested-fact-tag">{sug.category}</span>
                          <h4 className="suggested-fact-title">{sug.title}</h4>
                          <p className="suggested-fact-content">{sug.content}</p>
                          {sug.reason && (
                            <p className="suggested-fact-reason">
                              <span>💡 {sug.reason}</span>
                            </p>
                          )}
                        </div>

                        <div className="suggested-fact-actions">
                          <button
                            type="button"
                            className="btn-adopt-fact"
                            onClick={() => handleAdoptFact(sug)}
                            title="Chấp thuận và nạp ngay vào Bộ nhớ AI"
                          >
                            <Check size={13} />
                            <span>Chấp thuận</span>
                          </button>
                          <button
                            type="button"
                            className="btn-edit-fact-sug"
                            onClick={() => handleEditSuggestedFact(sug)}
                            title="Chỉnh sửa nội dung trước khi nạp"
                          >
                            <Edit3 size={13} />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            className="btn-reject-fact"
                            onClick={() => handleRejectFact(sug.title)}
                            title="Bỏ qua / Từ chối gợi ý này"
                          >
                            <X size={13} />
                            <span>Bỏ qua</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Inquiries */}
              {aiInsights.top_inquiries && aiInsights.top_inquiries.length > 0 && (
                <div className="ai-top-inquiries-box">
                  <span className="inquiry-label">
                    <TrendingUp size={12} /> Chủ đề khách hay hỏi nhất:
                  </span>
                  {aiInsights.top_inquiries.map((inq, idx) => (
                    <span key={idx} className="inquiry-pill">
                      <span>"{inq.query}"</span>
                      {inq.count > 1 && <span className="inquiry-count">×{inq.count}</span>}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Toolbar (Search, Filter, Sort, Count) */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          {/* Search Box */}
          <div className="admin-search-box">
            <Search size={15} />
            <input
              placeholder="Tìm kiếm dữ liệu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="clear-search-btn" onClick={() => setSearch('')}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Filter for Skills */}
          {section === 'skills' && (
            <div className="admin-filter-select-wrap">
              <Filter size={13} className="filter-icon" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">Tất cả nhóm kỹ năng</option>
                {SKILL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter for Articles */}
          {section === 'articles' && categoriesList.length > 0 && (
            <div className="admin-filter-select-wrap">
              <Filter size={13} className="filter-icon" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">Tất cả danh mục bài viết</option>
                {categoriesList.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By Dropdown */}
          <div className="admin-filter-select-wrap">
            <ArrowUpDown size={13} className="filter-icon" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="DEFAULT">Sắp xếp: Mặc định</option>
              <option value="NEWEST">Sắp xếp: Mới nhất trước</option>
              <option value="ORDER">Sắp xếp: Theo thứ tự hiển thị</option>
            </select>
          </div>
        </div>

        <div className="admin-toolbar-right">
          <span className="record-count-badge">
            <b>{sortedAndFiltered.length}</b> bản ghi
          </span>
        </div>
      </div>

      {/* Main Table */}
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
                  <th>{section === 'profile' ? 'Phiên bản Profile / Họ tên' : 'Nội dung chính'}</th>
                  <th style={{ width: 220 }}>{section === 'profile' ? 'Liên hệ & Chức danh' : 'Thông tin phụ'}</th>
                  <th style={{ width: 150, textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ width: 140, textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-table-cell">
                      <div className="empty-table-wrap">
                        <Layers size={36} className="empty-icon" />
                        <p className="empty-title">Chưa có dữ liệu nào</p>
                        <p className="empty-desc">
                          {search ? 'Không tìm thấy kết quả phù hợp với từ khóa.' : 'Hãy bấm nút "Thêm mới" ở trên để tạo bản ghi đầu tiên.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => {
                    const stt = (currentPage - 1) * pageSize + index + 1
                    const itemTitle = section === 'profile'
                      ? (item.versionName || `${item.fullName} - ${item.headline}`)
                      : (item.title || item.fullName || item.name || item.company || 'Bản ghi #' + item.id)

                    const itemSub = section === 'profile'
                      ? `${item.fullName} • ${item.headline}`
                      : (item.headline || item.role || item.position || item.summary || item.category || (item.email ? `Email: ${item.email}` : ''))

                    const itemInfo = section === 'profile'
                      ? `${item.email || ''} ${item.phone ? '• ' + item.phone : ''}`
                      : (item.technologies || item.category || (item.proficiency ? `Độ thông thạo: ${item.proficiency}%` : '') || (item.period ? `Thời gian: ${item.period}` : '') || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '—'))

                    const rawStatus = section === 'profile'
                      ? (item.isPublished ? 'PUBLISHED' : 'DRAFT')
                      : (item.status || (item.published === false ? 'DRAFT' : (item.isActive === false ? 'INACTIVE' : 'ACTIVE')))

                    return (
                      <tr key={item.id || index} className="admin-table-row">
                        <td className="stt-cell" style={{ textAlign: 'center' }}>
                          <span className="stt-number">{stt}</span>
                        </td>
                        <td className="main-content-cell">
                          <div className="cell-title-wrap">
                            <strong className="cell-title">{itemTitle}</strong>
                            {item.id && <span className="cell-id-badge" title={`ID: ${item.id}`}>#{item.id}</span>}
                            {section === 'profile' && item.isPublished && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  color: '#059669',
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  padding: '2px 7px',
                                  borderRadius: 99
                                }}
                              >
                                🌟 Đang hiển thị Live
                              </span>
                            )}
                          </div>
                          {itemSub && <span className="cell-subtitle">{itemSub}</span>}
                        </td>
                        <td className="info-cell">
                          <span className="info-badge">{itemInfo}</span>
                        </td>
                        <td className="status-cell" style={{ textAlign: 'center' }}>
                          <AdminStatusBadge status={rawStatus} />
                        </td>
                        <td className="action-cell" style={{ textAlign: 'center' }}>
                          <div className="row-actions">
                            {/* Star / Publish Profile Quick Button */}
                            {section === 'profile' && !item.isPublished && (
                              <button
                                type="button"
                                className="row-btn approve"
                                title="Đặt làm hồ sơ chính thức hiển thị ngoài Portfolio"
                                onClick={() => handlePublishProfile(item.id)}
                              >
                                <Star size={14} />
                              </button>
                            )}

                            <button
                              type="button"
                              className="row-btn view"
                              title="Xem chi tiết"
                              onClick={() => setViewingItem(item)}
                            >
                              <Eye size={14} />
                            </button>

                            {section === 'comments' ? (
                              <>
                                <button className="row-btn approve" title="Phê duyệt bình luận" onClick={() => moderate(item, 'APPROVED')}>
                                  <Check size={14} />
                                </button>
                                <button className="row-btn reject" title="Từ chối bình luận" onClick={() => moderate(item, 'REJECTED')}>
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              !config.readonly && (
                                <>
                                  <button className="row-btn edit" title="Chỉnh sửa" onClick={() => setEditing({ ...item })}>
                                    <Edit3 size={14} />
                                  </button>
                                  <button className="row-btn danger" title="Xóa bản ghi" onClick={() => remove(item.id)}>
                                    <Trash2 size={14} />
                                  </button>
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

          {/* Pagination */}
          <AdminPagination
            currentPage={currentPage}
            totalItems={sortedAndFiltered.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setCurrentPage(1)
            }}
          />
        </div>
      )}
    </div>
  )
}
