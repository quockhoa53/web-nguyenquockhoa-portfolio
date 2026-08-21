import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Command,
  X,
  House,
  BriefcaseBusiness,
  BookOpen,
  Route,
  Mail,
  User,
  Sparkles,
  Sun,
  Moon,
  Phone,
  FileDown,
  ArrowRight,
  Code2
} from 'lucide-react'
import { getProjects, getKnowledgeArticles, getResumes } from '../../services/portfolioApi'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [projects, setProjects] = useState([])
  const [articles, setArticles] = useState([])
  const [resumes, setResumes] = useState([])
  const [isDark, setIsDark] = useState(() => localStorage.getItem('portfolio-theme') !== 'light')

  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  // Fetch live searchable items once
  useEffect(() => {
    getProjects().then(data => Array.isArray(data) && setProjects(data)).catch(() => {})
    getKnowledgeArticles().then(data => Array.isArray(data) && setArticles(data)).catch(() => {})
    getResumes().then(data => Array.isArray(data) && setResumes(data)).catch(() => {})
  }, [])

  // Listen for global Ctrl+K / Cmd+K and custom trigger events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    const handleCustomOpen = () => setIsOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-command-palette', handleCustomOpen)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-command-palette', handleCustomOpen)
    }
  }, [isOpen])

  // Auto focus on input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggleTheme = useCallback(() => {
    const nextDark = !isDark
    setIsDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)
    localStorage.setItem('portfolio-theme', nextDark ? 'dark' : 'light')
  }, [isDark])

  const openAIChatWithQuery = useCallback((userQuery) => {
    window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { query: userQuery } }))
  }, [])

  // Build searchable items catalogue
  const allItems = useMemo(() => {
    const items = []

    // 1. Quick Actions
    items.push(
      {
        id: 'action-ai-chat',
        category: '⚡ Hành động nhanh',
        title: 'Hỏi Trợ lý AI (NQK Assistant)',
        description: 'Tương tác thông minh về kinh nghiệm, công nghệ và dự án',
        icon: Sparkles,
        badge: 'AI Agent',
        action: () => {
          openAIChatWithQuery(query.trim() || '')
        }
      },
      {
        id: 'action-toggle-theme',
        category: '⚡ Hành động nhanh',
        title: isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối',
        description: 'Chuyển đổi màu sắc nền và hiệu ứng hiển thị',
        icon: isDark ? Sun : Moon,
        badge: isDark ? 'Light Mode' : 'Dark Mode',
        action: () => toggleTheme()
      },
      {
        id: 'action-contact-form',
        category: '⚡ Hành động nhanh',
        title: 'Mở Form Liên hệ & Báo giá',
        description: 'Gửi tin nhắn trực tiếp tới Nguyễn Quốc Khoa',
        icon: Mail,
        badge: 'Liên hệ',
        action: () => navigate('/contact')
      },
      {
        id: 'action-call-phone',
        category: '⚡ Hành động nhanh',
        title: 'Gọi Hotline / Zalo (0969 895 549)',
        description: 'Kết nối trao đổi công việc nhanh',
        icon: Phone,
        badge: 'Hotline',
        action: () => window.open('tel:0969895549', '_self')
      }
    )

    // Add primary resume if available
    const primaryCv = resumes.find(r => r.isPrimary || r.is_primary) || resumes[0]
    if (primaryCv) {
      items.push({
        id: 'action-download-cv',
        category: '⚡ Hành động nhanh',
        title: `Tải CV: ${primaryCv.title || 'Kỹ sư Backend'}`,
        description: `Hồ sơ ứng tuyển vị trí ${primaryCv.targetRole || primaryCv.target_role || 'Backend'}`,
        icon: FileDown,
        badge: 'CV PDF',
        action: () => {
          if (primaryCv.fileUrl || primaryCv.file_url) {
            window.open(primaryCv.fileUrl || primaryCv.file_url, '_blank')
          }
        }
      })
    }

    // 2. Navigation Pages
    items.push(
      {
        id: 'nav-home',
        category: '🧭 Điều hướng trang',
        title: 'Trang chủ (Home)',
        description: 'Tổng quan năng lực, dự án nổi bật và giới thiệu kỹ sư',
        icon: House,
        badge: 'Trang',
        action: () => navigate('/')
      },
      {
        id: 'nav-profile',
        category: '🧭 Điều hướng trang',
        title: 'Hồ sơ cá nhân & Triết lý lập trình',
        description: 'Tiểu sử chi tiết, học vấn, kinh nghiệm và phương châm cốt lõi',
        icon: User,
        badge: 'Trang',
        action: () => navigate('/profile')
      },
      {
        id: 'nav-projects',
        category: '🧭 Điều hướng trang',
        title: 'Dự án thực tế (Projects)',
        description: 'Các dự án Backend, Microservices và nền tảng AI đã triển khai',
        icon: BriefcaseBusiness,
        badge: 'Trang',
        action: () => navigate('/projects')
      },
      {
        id: 'nav-knowledge',
        category: '🧭 Điều hướng trang',
        title: 'Kho kiến thức & Bài viết (Articles)',
        description: 'Chia sẻ chuyên sâu về Clean Architecture, Database và System Design',
        icon: BookOpen,
        badge: 'Trang',
        action: () => navigate('/knowledge')
      },
      {
        id: 'nav-work-process',
        category: '🧭 Điều hướng trang',
        title: 'Quá trình & Quy trình làm việc',
        description: 'Kinh nghiệm kỹ thuật và văn hóa phát triển phần mềm',
        icon: Route,
        badge: 'Trang',
        action: () => navigate('/work-process')
      },
      {
        id: 'nav-contact',
        category: '🧭 Điều hướng trang',
        title: 'Liên hệ & Kết nối hợp tác',
        description: 'Thông tin liên hệ, mạng xã hội và kênh trao đổi công việc',
        icon: Mail,
        badge: 'Trang',
        action: () => navigate('/contact')
      }
    )

    // 3. Projects
    projects.forEach(p => {
      items.push({
        id: `project-${p.id}`,
        category: '🚀 Dự án thực tế',
        title: p.title,
        description: `${p.technologies || ''} — ${(p.summary || '').slice(0, 80)}`,
        icon: Code2,
        badge: p.featured ? '⭐ Nổi bật' : 'Dự án',
        action: () => navigate(`/projects/${p.id}`)
      })
    })

    // 4. Articles
    articles.forEach(a => {
      items.push({
        id: `article-${a.id || a.slug}`,
        category: '📖 Bài viết kiến thức',
        title: a.title,
        description: `${a.category || 'Kiến thức'} — ${(a.summary || '').slice(0, 80)}`,
        icon: BookOpen,
        badge: a.category || 'Bài viết',
        action: () => navigate(`/knowledge/${a.slug || a.id}`)
      })
    })

    return items
  }, [isDark, resumes, projects, articles, query, navigate, toggleTheme, openAIChatWithQuery])

  // Filter items based on query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allItems.slice(0, 15)

    const matches = allItems.filter(item => {
      const matchTitle = item.title?.toLowerCase().includes(q)
      const matchDesc = item.description?.toLowerCase().includes(q)
      const matchCategory = item.category?.toLowerCase().includes(q)
      const matchBadge = item.badge?.toLowerCase().includes(q)
      return matchTitle || matchDesc || matchCategory || matchBadge
    })

    // If query has content, always prepend a dynamic AI search action at the top
    const dynamicAIAction = {
      id: 'dynamic-ai-ask',
      category: '🤖 Hỏi Chatbot AI',
      title: `Hỏi AI: "${query}"`,
      description: 'Nhận câu trả lời chuyên sâu tức thì từ NQK AI Assistant',
      icon: Sparkles,
      badge: 'Hỏi ngay ↵',
      action: () => openAIChatWithQuery(query)
    }

    return [dynamicAIAction, ...matches]
  }, [allItems, query, openAIChatWithQuery])

  // Keep selected index in range
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('.cmd-item.active')
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  const handleSelect = (item) => {
    if (!item) return
    setIsOpen(false)
    item.action?.()
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex])
      }
    }
  }

  if (!isOpen) return null

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item, index) => {
    const cat = item.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push({ ...item, globalIndex: index })
    return acc
  }, {})

  return (
    <div className="cmd-palette-backdrop" onClick={() => setIsOpen(false)}>
      <div
        className="cmd-palette-container"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Search Header */}
        <div className="cmd-header">
          <Search size={18} className="cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Tìm kiếm dự án, bài viết, kỹ năng, hoặc gõ để hỏi AI..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          {query && (
            <button className="cmd-clear-btn" onClick={() => setQuery('')} title="Xóa tìm kiếm">
              <X size={15} />
            </button>
          )}
          <div className="cmd-esc-badge" onClick={() => setIsOpen(false)}>
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="cmd-list" ref={listRef}>
          {filteredItems.length === 0 ? (
            <div className="cmd-empty">
              <Search size={32} className="cmd-empty-icon" />
              <p>Không tìm thấy kết quả cho <b>"{query}"</b></p>
              <button
                className="cmd-empty-ai-btn"
                onClick={() => {
                  setIsOpen(false)
                  openAIChatWithQuery(query)
                }}
              >
                <Sparkles size={14} />
                <span>Hỏi NQK AI Assistant câu này</span>
              </button>
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="cmd-group">
                <div className="cmd-group-title">{category}</div>
                {items.map(item => {
                  const Icon = item.icon || ArrowRight
                  const isActive = item.globalIndex === selectedIndex
                  return (
                    <div
                      key={item.id}
                      className={`cmd-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                    >
                      <div className="cmd-item-icon-box">
                        <Icon size={16} />
                      </div>
                      <div className="cmd-item-content">
                        <div className="cmd-item-title">{item.title}</div>
                        {item.description && (
                          <div className="cmd-item-desc">{item.description}</div>
                        )}
                      </div>
                      {item.badge && (
                        <span className="cmd-item-badge">{item.badge}</span>
                      )}
                      <ArrowRight size={13} className="cmd-item-arrow" />
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="cmd-footer">
          <div className="cmd-footer-shortcuts">
            <span className="cmd-key-hint">
              <kbd>↑</kbd> <kbd>↓</kbd> Di chuyển
            </span>
            <span className="cmd-key-hint">
              <kbd>↵</kbd> Chọn
            </span>
            <span className="cmd-key-hint">
              <kbd>ESC</kbd> Đóng
            </span>
          </div>
          <div className="cmd-footer-brand">
            <Command size={13} />
            <span>NQK Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  )
}
