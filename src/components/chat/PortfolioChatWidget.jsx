import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Bot,
  Send,
  X,
  Sparkles,
  RotateCcw,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { getProjects, getKnowledgeArticles, getResumes } from '../../services/portfolioApi'
import { ProjectChatCard } from './ProjectChatCard'
import { ArticleChatCard } from './ArticleChatCard'
import { ContactChatCard } from './ContactChatCard'
import { ResumeChatCard } from './ResumeChatCard'
import { ContactConfirmChatCard } from './ContactConfirmChatCard'

const CHATBOT_API = import.meta.env.VITE_CHATBOT_API_URL || 'https://chatbot-nguyenquockhoa-portfolio.onrender.com'

const DEFAULT_SUGGESTIONS = [
  'Kinh nghiệm làm việc & năng lực của Khoa?',
  'Các dự án nổi bật mà Khoa đã thực hiện?',
  'Khoa sử dụng những công nghệ Backend & AI nào?',
  'Làm thế nào để liên hệ và hợp tác với Khoa?'
]

function parseContactConfirm(content) {
  if (!content || typeof content !== 'string') return { text: content, contactData: null }

  const tagStart = content.indexOf('[ACTION_CONFIRM_CONTACT:')
  if (tagStart !== -1) {
    const jsonStart = tagStart + '[ACTION_CONFIRM_CONTACT:'.length
    const jsonEnd = content.lastIndexOf('}]')
    if (jsonEnd !== -1 && jsonEnd >= jsonStart) {
      let rawJson = content.slice(jsonStart, jsonEnd + 1).trim()
      // Clean any accidental markdown links inside JSON (e.g. [email](mailto:...))
      rawJson = rawJson.replace(/\[([^\]]+)\]\(mailto:[^)]+\)/g, '$1')
      try {
        const contactData = JSON.parse(rawJson)
        if (contactData.email) {
          contactData.email = contactData.email.replace(/[\[\]]/g, '').replace(/\(mailto:[^)]+\)/g, '').trim()
        }
        if (!contactData.name || !contactData.name.trim()) {
          contactData.name = 'Nhà tuyển dụng / Quý khách'
        }
        const fullTag = content.slice(tagStart, jsonEnd + 2)
        const cleanText = content.replace(fullTag, '').trim()
        return { text: cleanText, contactData }
      } catch (e) {
        console.warn('Failed to parse contact confirmation JSON:', e)
      }
    }
  }

  return { text: content, contactData: null }
}

export function PortfolioChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [sessionId, setSessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9))
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Xin chào! 👋 Tôi là **NQK AI Assistant** - Trợ lý AI đại diện cho kỹ sư **Nguyễn Quốc Khoa**.\n\nBạn có thể hỏi tôi về các dự án thực tế, kinh nghiệm thiết kế Backend, tối ưu Database hoặc các giải pháp AI mà Khoa đã triển khai.'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)
  const [projectsList, setProjectsList] = useState([])
  const [articlesList, setArticlesList] = useState([])
  const [resumesList, setResumesList] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch projects, articles and resumes for Generative UI Cards
  useEffect(() => {
    getProjects()
      .then(res => {
        const data = res?.data || res
        if (Array.isArray(data)) setProjectsList(data)
      })
      .catch(() => {})

    getKnowledgeArticles()
      .then(res => {
        const data = res?.data || res
        if (Array.isArray(data)) setArticlesList(data)
      })
      .catch(() => {})

    getResumes()
      .then(res => {
        const data = res?.data || res
        if (Array.isArray(data)) setResumesList(data)
      })
      .catch(() => {})
  }, [])

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  function handleReset() {
    setSessionId('sess_' + Math.random().toString(36).substring(2, 9))
    setMessages([
      {
        role: 'assistant',
        content:
          'Xin chào! 👋 Tôi là **NQK AI Assistant** - Trợ lý AI đại diện cho kỹ sư **Nguyễn Quốc Khoa**.\n\nBạn có thể hỏi tôi về các dự án thực tế, kinh nghiệm thiết kế Backend, tối ưu Database hoặc các giải pháp AI mà Khoa đã triển khai.'
      }
    ])
  }

  async function handleSend(textToSend) {
    const query = (textToSend || input).trim()
    if (!query || isLoading) return

    setInput('')
    const newMessages = [...messages, { role: 'user', content: query }]
    setMessages(newMessages)
    setIsLoading(true)

    // Add placeholder assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      // 1. Try SSE streaming endpoint
      const response = await fetch(`${CHATBOT_API}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: query,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (response.ok && response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          // Keep incomplete last segment in buffer
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataPayload = line.slice(6)
              if (dataPayload === '[DONE]') continue

              let token = ''
              try {
                const parsed = JSON.parse(dataPayload)
                if (parsed.done) continue
                token = parsed.content !== undefined ? parsed.content : ''
              } catch {
                token = dataPayload
              }

              if (token) {
                accumulated += token
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: accumulated
                  }
                  return updated
                })
              }
            }
          }
        }
      } else {
        // 2. Try standard POST endpoint
        const fallbackRes = await fetch(`${CHATBOT_API}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            message: query,
            messages: newMessages.map(m => ({ role: m.role, content: m.content }))
          })
        })

        if (fallbackRes.ok) {
          const data = await fallbackRes.json()
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: data.reply
            }
            return updated
          })
        } else {
          throw new Error('API request failed')
        }
      }
    } catch (err) {
      console.warn('Chatbot API unreachable, using client-side helper:', err)
      const fallbackReply = generateClientFallbackReply(query)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: fallbackReply
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="portfolio-chatbot-wrapper">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="chat-launcher-container">
          {showTooltip && (
            <div className="chat-launcher-tooltip" onClick={() => setIsOpen(true)}>
              <Sparkles size={13} className="tooltip-sparkle" />
              <span>Hỏi NQK AI về kinh nghiệm & dự án!</span>
              <button
                className="tooltip-close"
                onClick={e => {
                  e.stopPropagation()
                  setShowTooltip(false)
                }}
              >
                ×
              </button>
            </div>
          )}

          <button
            className="chat-launcher-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Mở Trợ lý AI NQK"
          >
            <div className="launcher-pulse-ring" />
            <div className="launcher-icon-box">
              <img src="/chatbot-avatar.png" alt="NQK AI Robot" className="launcher-bot-img" />
              <span className="online-dot" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className={`chat-window-modal reveal ${isExpanded ? 'chat-expanded' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar">
                <img src="/chatbot-avatar.png" alt="NQK AI Robot" className="header-bot-img" />
                <span className="avatar-online-badge" />
              </div>
              <div>
                <h3 className="bot-name font-display">NQK AI Assistant</h3>
                <span className="bot-status font-mono">
                  <span className="status-indicator" /> Online · Trợ lý AI Chuyên môn
                </span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                className="header-icon-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Thu nhỏ khung chat' : 'Phóng to khung chat'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                className="header-icon-btn"
                onClick={handleReset}
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw size={16} />
              </button>
              <button
                className="header-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Đóng cửa sổ"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="chat-messages-container">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`chat-bubble-row ${m.role === 'user' ? 'row-user' : 'row-bot'}`}
              >
                {m.role === 'assistant' && (
                  <div className="msg-bot-avatar">
                    <img src="/chatbot-avatar.png" alt="NQK AI" className="msg-bot-img" />
                  </div>
                )}

                <div className={`chat-bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                  {m.content ? (() => {
                    const { text, contactData } = parseContactConfirm(m.content)
                    return (
                      <>
                        {text && (
                          <div className="chat-markdown-renderer">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                table: ({ children, ...props }) => (
                                  <div className="chat-table-scroll-wrap">
                                    <table {...props}>{children}</table>
                                  </div>
                                ),
                                a: ({ href, children, ...props }) => {
                                  if (!href) return <span>{children}</span>

                                  // Normalize path (handle both full URLs and relative paths)
                                  let path = href
                                  if (path.includes('nguyenquockhoaportfolio.vercel.app')) {
                                    path = path.replace(/https?:\/\/nguyenquockhoaportfolio\.vercel\.app/, '')
                                  }

                                  // 1. Match Project Card: /projects/:id
                                  const projectMatch = path.match(/^\/projects\/(\d+)/)
                                  if (projectMatch) {
                                    const projectId = Number(projectMatch[1])
                                    const foundProject = projectsList.find(p => p.id === projectId)
                                    if (foundProject) {
                                      return (
                                        <ProjectChatCard
                                          project={foundProject}
                                          onNavigate={() => {
                                            if (window.innerWidth < 768) setIsOpen(false)
                                          }}
                                        />
                                      )
                                    }
                                  }

                                  // 2. Match Knowledge Article Card: /knowledge/:slug
                                  const articleMatch = path.match(/^\/knowledge\/([^/?#]+)/)
                                  if (articleMatch) {
                                    const articleSlug = articleMatch[1]
                                    const foundArticle = articlesList.find(a => a.slug === articleSlug)
                                    if (foundArticle) {
                                      return (
                                        <ArticleChatCard
                                          article={foundArticle}
                                          onNavigate={() => {
                                            if (window.innerWidth < 768) setIsOpen(false)
                                          }}
                                        />
                                      )
                                    }
                                  }

                                  // 3. Match Contact Card: /contact
                                  if (path === '/contact' || path === '/contact/') {
                                    return (
                                      <ContactChatCard
                                        onNavigate={() => {
                                          if (window.innerWidth < 768) setIsOpen(false)
                                        }}
                                      />
                                    )
                                  }

                                  // 4. Match Resume Card: /resumes/:id or /resumes/download or /resumes
                                  const resumeMatch = path.match(/^\/resumes\/(\d+)/) || path.match(/^\/api\/v1\/resumes\/(\d+)/)
                                  if (resumeMatch) {
                                    const resumeId = Number(resumeMatch[1])
                                    const foundResume = resumesList.find(r => r.id === resumeId)
                                    if (foundResume) {
                                      return <ResumeChatCard resume={foundResume} />
                                    }
                                  }
                                  if (path === '/resumes' || path === '/cv' || path === '/resume' || path.startsWith('/resumes')) {
                                    const primaryResume = resumesList.find(r => r.isPrimary) || resumesList[0]
                                    if (primaryResume) {
                                      return <ResumeChatCard resume={primaryResume} />
                                    }
                                  }

                                  // 5. Match Contact Confirmation Card
                                  if (path.startsWith('#confirm-contact') || href.startsWith('#confirm-contact') || href.includes('confirm-contact?')) {
                                    try {
                                      const searchStr = href.includes('?') ? href.split('?')[1] : ''
                                      const params = new URLSearchParams(searchStr)
                                      return (
                                        <ContactConfirmChatCard
                                          data={{
                                            name: params.get('name') || '',
                                            email: params.get('email') || '',
                                            subject: params.get('subject') || '',
                                            message: params.get('message') || ''
                                          }}
                                        />
                                      )
                                    } catch (e) {
                                      return <span>{children}</span>
                                    }
                                  }

                                  // Normal internal link
                                  if (path.startsWith('/')) {
                                    return (
                                      <Link
                                        to={path}
                                        className="chat-link-internal"
                                        onClick={() => {
                                          if (window.innerWidth < 768) setIsOpen(false)
                                        }}
                                        {...props}
                                      >
                                        {children}
                                      </Link>
                                    )
                                  }

                                  // External link
                                  return (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="chat-link-external"
                                      {...props}
                                    >
                                      {children}
                                    </a>
                                  )
                                }
                              }}
                            >
                              {text}
                            </ReactMarkdown>
                          </div>
                        )}
                        {contactData && (
                          <div style={{ marginTop: text ? 10 : 0 }}>
                            <ContactConfirmChatCard data={contactData} />
                          </div>
                        )}
                      </>
                    )
                  })() : (
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Suggestion Chips on New Chat */}
            {messages.length <= 2 && !isLoading && (
              <div className="chat-suggestions-box">
                <small className="suggestions-title">
                  <HelpCircle size={13} /> Câu hỏi gợi ý nhanh:
                </small>
                <div className="suggestions-list">
                  {DEFAULT_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="suggestion-chip"
                      onClick={() => handleSend(s)}
                    >
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chat-text-input"
              placeholder="Hỏi về dự án, kỹ năng, kiến trúc..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <button
              className={`chat-send-btn ${input.trim() && !isLoading ? 'active' : ''}`}
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              title="Gửi tin nhắn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function generateClientFallbackReply(query) {
  const q = query.toLowerCase()
  if (q.includes('dự án') || q.includes('project') || q.includes('sản phẩm')) {
    return (
      'Kỹ sư **Nguyễn Quốc Khoa** đã thực hiện nhiều dự án Backend và Microservices tiêu biểu, nổi bật với hệ thống **Portfolio & Knowledge Platform** (Spring Boot, Clean Architecture, PostgreSQL, Docker, AI Agents).\n\nBạn có thể nhấp vào menu **Dự án** trên thanh điều hướng để xem chi tiết.'
    )
  }
  if (q.includes('kỹ năng') || q.includes('skill') || q.includes('công nghệ')) {
    return (
      '**Năng lực kỹ thuật trọng tâm của Quốc Khoa:**\n\n' +
      '- **Backend & Architecture**: Java / Spring Boot, Clean Architecture, Microservices, RESTful API\n' +
      '- **Database & Data**: PostgreSQL, Redis, Flyway, Data Pipeline\n' +
      '- **AI & Tools**: Tích hợp mô hình LLM, AI Agents, Docker, CI/CD, Git'
    )
  }
  if (q.includes('liên hệ') || q.includes('contact') || q.includes('email') || q.includes('tuyển dụng')) {
    return (
      'Bạn có thể kết nối trực tiếp với Nguyễn Quốc Khoa qua:\n\n' +
      '- **Email**: quockhoa.work@gmail.com\n' +
      '- **GitHub**: [github.com/quockhoa53](https://github.com/quockhoa53)\n' +
      '- **Trang Liên hệ**: Vui lòng truy cập mục **Liên hệ** trên menu để gửi tin nhắn trực tiếp.'
    )
  }
  return (
    'Tôi là **NQK AI Assistant**. Tôi sẵn sàng giải đáp về kinh nghiệm làm việc, năng lực kỹ thuật (Java/Spring Boot, PostgreSQL, Microservices, AI) và các dự án tiêu biểu của kỹ sư Nguyễn Quốc Khoa!'
  )
}
