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
  TrendingUp
} from 'lucide-react'
import { useToast } from '../components/common/ToastContext'
import {
  createAdminItem,
  deleteAdminItem,
  getAdminAiFacts,
  getAdminArticles,
  getAdminComments,
  getAdminContacts,
  getAdminGuests,
  getAdminLikes,
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
    single: true,
    load: getProfile,
    resource: 'profile',
    fields: [
      ['fullName', 'Họ và tên'],
      ['headline', 'Chức danh'],
      ['email', 'Email liên hệ', 'email'],
      ['phone', 'Số điện thoại'],
      ['location', 'Địa chỉ / Tỉnh thành'],
      ['avatarUrl', 'Ảnh đại diện', 'image_upload', 'portfolio/avatars'],
      ['facebookUrl', 'Link Facebook (URL)'],
      ['githubUrl', 'Link GitHub (URL)'],
      ['linkedinUrl', 'Link LinkedIn (URL)'],
      ['shortBio', 'Mô tả ngắn trên trang chủ', 'textarea'],
      ['education', 'Học vấn & Bằng cấp (JSON/Text)', 'textarea'],
      ['bio', 'Nội dung chi tiết Profile', 'rich']
    ]
  },
  skills: {
    title: 'Năng Lực Kỹ Thuật',
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
    load: getProjects,
    resource: 'projects',
    fields: [
      ['title', 'Tên dự án'],
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
    load: getKnowledgeCategories,
    resource: 'knowledge/categories',
    fields: [
      ['name', 'Tên danh mục'],
      ['slug', 'Slug định danh URL (Tùy chọn)'],
      ['displayOrder', 'Thứ tự hiển thị', 'number'],
      ['description', 'Mô tả danh mục', 'rich']
    ]
  },
  articles: {
    title: 'Bài Viết Kiến Thức',
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
  const CHATBOT_API = import.meta.env.VITE_CHATBOT_API_URL || 'https://chatbot-nguyenquockhoa-portfolio.onrender.com'

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
      const res = await fetch(`${CHATBOT_API}/api/admin/ai-insights`)
      const data = await res.json()
      if (data.data) {
        setAiInsights(data.data)
      }
    } catch {
      // ignore
    } finally {
      setLoadingInsights(false)
    }
  }, [CHATBOT_API])

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
        setItems(Array.isArray(data) ? data : [])
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
      // Default: If displayOrder exists use it, otherwise newest first
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
    if (config.single) {
      setEditing(items[0] || {})
    } else if (section === 'skills') {
      setEditing({ category: SKILL_CATEGORIES[0], proficiency: 85, displayOrder: items.length + 1 })
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
    e.preventDefault()
    setIsSaving(true)
    try {
      if (config.single) {
        const updated = await updateProfile(editing)
        setItems([updated || editing])
        toast.success('Cập nhật Thông tin Profile thành công!')
      } else if (editing.id) {
        const updated = await updateAdminItem(config.resource, editing.id, editing)
        // Instant optimistic local update
        setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...editing, ...(updated || {}) } : i))
        toast.success(`Cập nhật ${config.title} thành công!`)
      } else {
        const created = await createAdminItem(config.resource, editing)
        // Instant optimistic insert
        setItems(prev => [created || { ...editing, id: Date.now() }, ...prev])
        toast.success(`Thêm mới ${config.title} thành công!`)
      }
      setEditing(null)
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
      // Instant optimistic removal
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success(`Đã xóa ${config.title} thành công!`)
      load()
    } catch (err) {
      toast.error('Xóa dữ liệu thất bại: ' + (err.message || 'Có lỗi xảy ra'))
    }
  }

  async function moderate(item, status) {
    try {
      await moderateComment(item.type, item.id, status)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status } : i))
      toast.success(status === 'APPROVED' ? 'Đã phê duyệt bình luận!' : 'Đã từ chối bình luận!')
      load()
    } catch (err) {
      toast.error('Xử lý bình luận thất bại: ' + (err.message || 'Có lỗi xảy ra'))
    }
  }

  return (
    <div className="admin-page">
      {/* Heading Bar */}
      <div className="admin-heading">
        <div className="admin-heading-left">
          <span className="admin-badge-category">
            <Layers size={11} /> QUẢN TRỊ DỮ LIỆU
          </span>
          <h1>{config.title}</h1>
        </div>

        <div className="admin-heading-actions">
          {/* Refresh Button */}
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => load(true)}
            disabled={isRefreshing || loading}
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          {/* Test Mail Button */}
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
              <span>{config.single ? 'Chỉnh sửa hồ sơ' : 'Thêm mới'}</span>
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
                <h3>Trung Tâm Trí Tuệ & Tự Học Của AI Assistant</h3>
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
                    <MessageSquare size={13} /> Hội thoại & Tin nhắn
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
          {!config.single && (
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
          )}
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
          <div className="admin-skeleton-row" />
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '68px', textAlign: 'center' }}>STT</th>
                  <th>Nội dung chính</th>
                  <th>Phân loại / Thông tin</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="admin-empty-table-cell">
                      <Sparkles size={28} className="empty-icon" />
                      <strong>Không tìm thấy bản ghi nào</strong>
                      <p>Thử tìm kiếm với từ khóa khác hoặc bấm nút Thêm mới bên trên.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => {
                    // STT chuẩn xác tính theo trang
                    const stt = (currentPage - 1) * pageSize + index + 1

                    const itemTitle = renderCellText(item.title || item.name || item.fullName || item.displayName || item.subject) || 'Bản ghi'
                    const rawSub = item.slug || item.email || item.headline || (typeof item.content === 'string' ? item.content.replace(/<[^>]*>?/gm, '').slice(0, 80) : '')
                    const itemSub = renderCellText(rawSub)

                    // Phân loại thông tin
                    let itemInfo = '—'
                    if (section === 'articles' && item.categoryId) {
                      const matchedCat = categoriesList.find(c => c.id === item.categoryId)
                      itemInfo = matchedCat ? matchedCat.name : `Danh mục #${item.categoryId}`
                    } else {
                      itemInfo = renderCellText(item.category || item.company || item.type || item.technologies || item.location) || '—'
                    }

                    // Trạng thái
                    const rawStatus = item.status || (item.published === false ? 'DRAFT' : 'ACTIVE')

                    return (
                      <tr key={item.id || index} className="admin-table-row">
                        <td className="stt-cell">
                          <span className="stt-number">{stt}</span>
                        </td>
                        <td className="main-content-cell">
                          <div className="cell-title-wrap">
                            <strong className="cell-title">{itemTitle}</strong>
                            {item.id && <span className="cell-id-badge" title={`ID: ${item.id}`}>#{item.id}</span>}
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
                                  {!config.single && (
                                    <button className="row-btn danger" title="Xóa bản ghi" onClick={() => remove(item.id)}>
                                      <Trash2 size={14} />
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

          {/* Pagination */}
          {!config.single && (
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
          )}
        </div>
      )}

      {/* Spacious 900px Edit / Create Modal */}
      {editing && (
        <div className="admin-modal-backdrop" onClick={() => !isSaving && setEditing(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <form onSubmit={save}>
              {/* Modal Header */}
              <header className="modal-header">
                <div>
                  <span className="modal-tag">EDITOR PANEL</span>
                  <h2>{editing.id ? 'Cập Nhật' : 'Thêm Mới'} {config.title}</h2>
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

              {/* Modal Body with 2-Column Grid */}
              <div className="modal-body">
                <div className="admin-form-grid-modern">
                  {config.fields.map(([key, label, type = 'text', options, uploadFolder]) => {
                    const isWide = type === 'rich' || type === 'textarea' || type === 'image_upload'

                    return (
                      <div
                        className={`form-field-group ${isWide ? 'full-width' : ''}`}
                        key={key}
                      >
                        {type !== 'checkbox' && type !== 'image_upload' && (
                          <label className="field-label">
                            <span>{label}</span>
                          </label>
                        )}

                        {/* Category Select */}
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
                        ) : type === 'image_upload' ? (
                          /* Image Upload Component */
                          <AdminImageUpload
                            label={label}
                            value={editing[key] || ''}
                            folder={uploadFolder || 'portfolio/images'}
                            onChange={(url) => setEditing({ ...editing, [key]: url })}
                          />
                        ) : type === 'rich' ? (
                          /* Rich Text Editor */
                          <div className="rich-editor-wrap">
                            <RichEditor
                              value={editing[key] || ''}
                              onChange={value => setEditing({ ...editing, [key]: value })}
                            />
                          </div>
                        ) : type === 'textarea' ? (
                          <textarea
                            className="admin-textarea-input"
                            rows="4"
                            placeholder={`Nhập ${label.toLowerCase()}...`}
                            value={editing[key] || ''}
                            onChange={e => setEditing({ ...editing, [key]: e.target.value })}
                          />
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
                    )
                  })}
                </div>
              </div>

              {/* Sticky Footer */}
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
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {viewingItem && (
        <div className="admin-modal-backdrop" onClick={() => setViewingItem(null)}>
          <div className="admin-modal-card" style={{ maxWidth: 960 }} onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <div>
                <span className="modal-tag">CHI TIẾT DỮ LIỆU</span>
                <h2>{viewingItem.title || viewingItem.name || viewingItem.company || config.title} {viewingItem.id && `#${viewingItem.id}`}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setViewingItem(null)}
              >
                <X size={18} />
              </button>
            </header>

            <div className="modal-body">
              {/* Meta summary grid */}
              <div className="detail-view-meta-grid">
                {viewingItem.id && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-label">Mã ID</span>
                    <span className="detail-meta-val">#{viewingItem.id}</span>
                  </div>
                )}
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Trạng thái</span>
                  <div>
                    <AdminStatusBadge status={viewingItem.status || (viewingItem.published === false ? 'DRAFT' : 'ACTIVE')} />
                  </div>
                </div>
                {(viewingItem.category || viewingItem.categoryId) && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-label">Chuyên mục</span>
                    <span className="detail-meta-val">
                      {categoriesList.find(c => c.id === viewingItem.categoryId)?.name || viewingItem.category || '—'}
                    </span>
                  </div>
                )}
                {viewingItem.createdAt && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-label">Ngày tạo</span>
                    <span className="detail-meta-val">{new Date(viewingItem.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
                {viewingItem.updatedAt && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-label">Cập nhật lần cuối</span>
                    <span className="detail-meta-val">{new Date(viewingItem.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
                {viewingItem.slug && (
                  <div className="detail-meta-item">
                    <span className="detail-meta-label">Đường dẫn Slug</span>
                    <span className="detail-meta-val" style={{ fontFamily: 'monospace', fontSize: 12 }}>{viewingItem.slug}</span>
                  </div>
                )}
              </div>

              {/* Cover / Image Preview */}
              {(viewingItem.thumbnailUrl || viewingItem.coverUrl || viewingItem.imageUrl || viewingItem.avatarUrl) && (
                <div className="detail-view-image-preview">
                  <img
                    src={viewingItem.thumbnailUrl || viewingItem.coverUrl || viewingItem.imageUrl || viewingItem.avatarUrl}
                    alt="Preview"
                  />
                </div>
              )}

              {/* Summary */}
              {viewingItem.summary && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tóm tắt ngắn gọn</h4>
                  <p style={{ margin: 0, padding: 14, background: 'var(--adm-surface-subtle)', borderRadius: 10, border: '1px solid var(--adm-border)', fontSize: 13.5, lineHeight: 1.6 }}>
                    {viewingItem.summary}
                  </p>
                </div>
              )}

              {/* Full Rich Content or Raw Content */}
              {(viewingItem.content || viewingItem.description || viewingItem.message) && (
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--adm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nội dung chi tiết</h4>
                  <div
                    className="detail-view-rich-content"
                    dangerouslySetInnerHTML={{ __html: viewingItem.content || viewingItem.description || viewingItem.message }}
                  />
                </div>
              )}
            </div>

            <footer className="modal-footer">
              {/* Public view button */}
              {section === 'articles' && viewingItem.slug && (
                <a
                  href={`/knowledge/${viewingItem.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn-secondary"
                >
                  <ExternalLink size={14} />
                  <span>Xem trang bài viết</span>
                </a>
              )}
              {section === 'projects' && viewingItem.id && (
                <a
                  href={`/projects/${viewingItem.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn-secondary"
                >
                  <ExternalLink size={14} />
                  <span>Xem trang dự án</span>
                </a>
              )}
              {section === 'work-items' && (viewingItem.slug || viewingItem.id) && (
                <a
                  href={`/work-process/${viewingItem.slug || viewingItem.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn-secondary"
                >
                  <ExternalLink size={14} />
                  <span>Xem quy trình</span>
                </a>
              )}
              {!config.readonly && (
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => {
                    const toEdit = { ...viewingItem }
                    setViewingItem(null)
                    setEditing(toEdit)
                  }}
                >
                  <Edit3 size={14} />
                  <span>Chỉnh sửa bản ghi</span>
                </button>
              )}
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setViewingItem(null)}
              >
                Đóng
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
