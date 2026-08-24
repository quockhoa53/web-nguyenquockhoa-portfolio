import { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react'
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
  Minimize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square
} from 'lucide-react'
import { getProjects, getKnowledgeArticles, getResumes } from '../../services/portfolioApi'
import { ProjectChatCard } from './ProjectChatCard'
import { ArticleChatCard } from './ArticleChatCard'
import { ContactChatCard } from './ContactChatCard'
import { ResumeChatCard } from './ResumeChatCard'
import { ContactConfirmChatCard } from './ContactConfirmChatCard'

const CHATBOT_API = import.meta.env.VITE_CHATBOT_API_URL || 'https://chatbot-nguyenquockhoa-portfolio.onrender.com'

const DEFAULT_SUGGESTIONS = [
  { icon: '💼', text: 'Kinh nghiệm làm việc & năng lực của Khoa?' },
  { icon: '🚀', text: 'Các dự án nổi bật mà Khoa đã thực hiện?' },
  { icon: '⚡', text: 'Khoa sử dụng những công nghệ Backend & AI nào?' },
  { icon: '📄', text: 'Tải CV & hồ sơ năng lực của Khoa' },
  { icon: '📞', text: 'Làm thế nào để liên hệ và hợp tác với Khoa?' }
]

function parseContactConfirm(content) {
  if (!content || typeof content !== 'string') return { text: content, contactData: null }

  // 1. Strip internal model thinking process (<think>...</think> and unclosed streaming <think>...)
  let cleanContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<think>[\s\S]*$/gi, '').trim()

  const tagStart = cleanContent.indexOf('[ACTION_CONFIRM_CONTACT:')
  if (tagStart !== -1) {
    const jsonStart = tagStart + '[ACTION_CONFIRM_CONTACT:'.length
    const jsonEnd = cleanContent.lastIndexOf('}]')
    if (jsonEnd !== -1 && jsonEnd >= jsonStart) {
      let rawJson = cleanContent.slice(jsonStart, jsonEnd + 1).trim()
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
        const fullTag = cleanContent.slice(tagStart, jsonEnd + 2)
        const cleanText = cleanContent.replace(fullTag, '').trim()
        return { text: cleanText, contactData }
      } catch (e) {
        console.warn('Failed to parse contact confirmation JSON:', e)
      }
    }
  }

  return { text: cleanContent, contactData: null }
}

const ChatMessageItem = memo(function ChatMessageItem({
  message,
  projectsList,
  articlesList,
  resumesList,
  onCloseMobile,
  isSpeaking,
  onSpeak
}) {
  const { text, contactData } = useMemo(() => parseContactConfirm(message.content), [message.content])

  const markdownComponents = useMemo(() => ({
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
        path = path.replace(/https?:\/\/nguyenquockho\.vercel\.app/, '')
      }

      // 1. Match Project Card: /projects/:id
      const projectMatch = path.match(/^\/projects\/(\d+)/)
      if (projectMatch) {
        const projectId = Number(projectMatch[1])
        const foundProject = projectsList.find(p => p.id === projectId)
        if (foundProject) {
          return <ProjectChatCard project={foundProject} onNavigate={onCloseMobile} />
        }
      }

      // 2. Match Knowledge Article Card: /knowledge/:slug
      const articleMatch = path.match(/^\/knowledge\/([^/?#]+)/)
      if (articleMatch) {
        const articleSlug = articleMatch[1]
        const foundArticle = articlesList.find(a => a.slug === articleSlug)
        if (foundArticle) {
          return <ArticleChatCard article={foundArticle} onNavigate={onCloseMobile} />
        }
      }

      // 3. Match Contact Card: /contact
      if (path === '/contact' || path === '/contact/') {
        return <ContactChatCard onNavigate={onCloseMobile} />
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

      // Normal internal link
      if (path.startsWith('/')) {
        return (
          <Link to={path} className="chat-link-internal" onClick={onCloseMobile} {...props}>
            {children}
          </Link>
        )
      }

      // External link
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="chat-link-external" {...props}>
          {children}
        </a>
      )
    }
  }), [projectsList, articlesList, resumesList, onCloseMobile])

  return (
    <div className={`chat-bubble-row ${message.role === 'user' ? 'row-user' : 'row-bot'}`}>
      {message.role === 'assistant' && (
        <div className="msg-bot-avatar">
          <img src="/chatbot-avatar.png" alt="NQK AI" className="msg-bot-img" />
        </div>
      )}

      <div className={`chat-bubble ${message.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
        {message.content ? (
          <>
            {text && (
              <div className="chat-markdown-renderer">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {text}
                </ReactMarkdown>
              </div>
            )}
            {contactData && (
              <div style={{ marginTop: text ? 10 : 0 }}>
                <ContactConfirmChatCard data={contactData} />
              </div>
            )}
            {message.role === 'assistant' && text && (
              <div className="msg-toolbar">
                <button
                  className={`msg-speak-btn ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => onSpeak?.(text, message.id || text.slice(0, 30))}
                  title={isSpeaking ? 'Dừng đọc' : 'Nghe giọng đọc AI (Tiếng Việt)'}
                  aria-label="Nghe đọc tin nhắn"
                >
                  {isSpeaking ? <Square size={11} className="stop-icon" /> : <Volume2 size={12} />}
                  <span>{isSpeaking ? 'Dừng đọc' : 'Nghe'}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="typing-dots">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </div>
  )
})

export function PortfolioChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [sessionId, setSessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9))
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
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
  
  // Voice Interaction States
  const [isListening, setIsListening] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const recognitionRef = useRef(null)
  const audioPlayerRef = useRef(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch projects, articles and resumes for Generative UI Cards
  useEffect(() => {
    getProjects().then(res => { const data = res?.data || res; if (Array.isArray(data)) setProjectsList(data) }).catch(() => {})
    getKnowledgeArticles().then(res => { const data = res?.data || res; if (Array.isArray(data)) setArticlesList(data) }).catch(() => {})
    getResumes().then(res => { const data = res?.data || res; if (Array.isArray(data)) setResumesList(data) }).catch(() => {})
  }, [])

  const handleCloseMobile = useCallback(() => {
    if (window.innerWidth < 768) setIsOpen(false)
  }, [])

  // Text-to-Speech (TTS) handler with ElevenLabs Neural Adam Voice + Automatic Web Speech Fallback
  const handleSpeak = useCallback(async (text, messageId) => {
    // 1. If currently speaking this message, stop immediately
    if (speakingMessageId === messageId) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause()
        audioPlayerRef.current.currentTime = 0
        audioPlayerRef.current = null
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setSpeakingMessageId(null)
      return
    }

    // Stop any other playing audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
      audioPlayerRef.current = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    // Clean text for speech
    let cleanText = text
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```[\s\S]*?```/gi, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\[ACTION_CONFIRM_CONTACT:[\s\S]*?\]/gi, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_#~>`]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    if (!cleanText) return

    setSpeakingMessageId(messageId)

    // Helper: Fallback to native Web Speech API
    const fallbackToBrowserTTS = () => {
      if (!('speechSynthesis' in window)) {
        setSpeakingMessageId(null)
        return
      }
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.95 // Calm, natural and warm pace
      utterance.pitch = 1.0
      utterance.onend = () => setSpeakingMessageId(null)
      utterance.onerror = () => setSpeakingMessageId(null)
      const voices = window.speechSynthesis.getVoices()
      const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VN'))
      if (viVoice) utterance.voice = viVoice
      window.speechSynthesis.speak(utterance)
    }

    // 2. Try Backend Neural TTS (Edge-TTS / ElevenLabs)
    try {
      const response = await fetch(`${CHATBOT_API}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.playbackRate = 1.0 // Natural, expressive & calm pace
        audioPlayerRef.current = audio

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          audioPlayerRef.current = null
          setSpeakingMessageId(null)
        }

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          audioPlayerRef.current = null
          fallbackToBrowserTTS()
        }

        await audio.play()
      } else {
        fallbackToBrowserTTS()
      }
    } catch (err) {
      console.warn('ElevenLabs TTS failed, falling back to Web Speech API:', err)
      fallbackToBrowserTTS()
    }
  }, [speakingMessageId])

  // Speech-to-Text (STT) voice input handler
  const toggleListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return;
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'vi-VN'
    recognition.onresult = (e) => setInput(e.results[0][0].transcript)
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }, [isListening])

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading])

  // Listen for open-ai-chat event dispatched by Command Palette
  useEffect(() => {
    const handleOpenAIChat = (e) => {
      setIsOpen(true)
      if (e.detail?.query) setTimeout(() => handleSend(e.detail.query), 100)
    }
    window.addEventListener('open-ai-chat', handleOpenAIChat)
    return () => window.removeEventListener('open-ai-chat', handleOpenAIChat)
  }, [])

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
        id: 'welcome-' + Date.now(),
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
    const botMsgId = 'bot-' + Date.now()
    const newMessages = [...messages, { id: 'user-' + Date.now(), role: 'user', content: query }, { id: botMsgId, role: 'assistant', content: '' }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch(`${CHATBOT_API}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: query })
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
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataPayload = line.slice(6).trim()
              if (!dataPayload || dataPayload === '[DONE]') continue
              try {
                const parsed = JSON.parse(dataPayload)
                if (parsed.done) continue
                if (parsed.content !== undefined) {
                  accumulated += parsed.content
                }
              } catch {
                accumulated += dataPayload
              }
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: accumulated } : m))
            }
          }
        }
      }
    } catch (err) {
      const fallbackReply = generateClientFallbackReply(query)
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fallbackReply } : m))
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
      {!isOpen && (
        <div className="chat-launcher-container">
          {showTooltip && (
            <div className="chat-launcher-tooltip" onClick={() => setIsOpen(true)}>
              <Sparkles size={13} className="tooltip-sparkle" />
              <span>Hỏi NQK AI về kinh nghiệm & dự án!</span>
              <button className="tooltip-close" onClick={e => { e.stopPropagation(); setShowTooltip(false) }}>×</button>
            </div>
          )}
          <button className="chat-launcher-btn" onClick={() => setIsOpen(true)} aria-label="Mở Trợ lý AI NQK">
            <div className="launcher-pulse-ring" />
            <div className="launcher-icon-box">
              <img src="/chatbot-avatar.png" alt="NQK AI Robot" className="launcher-bot-img" />
              <span className="online-dot" />
            </div>
          </button>
        </div>
      )}

      {isOpen && (
        <div className={`chat-window-modal reveal ${isExpanded ? 'chat-expanded' : ''}`}>
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar">
                <img src="/chatbot-avatar.png" alt="NQK AI Robot" className="header-bot-img" />
                <span className="avatar-online-badge" />
              </div>
              <div>
                <h3 className="bot-name font-display">NQK AI Assistant</h3>
                <span className="bot-status font-mono"><span className="status-indicator" /> Voice & Chat</span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="header-icon-btn" onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
              <button className="header-icon-btn" onClick={handleReset}><RotateCcw size={16} /></button>
              <button className="header-icon-btn" onClick={() => setIsOpen(false)}><X size={18} /></button>
            </div>
          </div>

          <div className="chat-messages-container">
            {messages.map((m, idx) => (
              <ChatMessageItem
                key={m.id || idx}
                message={m}
                projectsList={projectsList}
                articlesList={articlesList}
                resumesList={resumesList}
                onCloseMobile={handleCloseMobile}
                isSpeaking={speakingMessageId === (m.id || m.content.slice(0, 30))}
                onSpeak={handleSpeak}
              />
            ))}

            {messages.length <= 1 && (
              <div className="chat-suggestions-container">
                <div className="suggestions-header">
                  <Sparkles size={13} className="suggestions-sparkle" />
                  <span>Mẫu câu hỏi gợi ý nhanh:</span>
                </div>
                <div className="suggestions-grid">
                  {DEFAULT_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      className="suggestion-chip-btn"
                      onClick={() => handleSend(sug.text)}
                      disabled={isLoading}
                    >
                      <span className="sug-icon">{sug.icon}</span>
                      <span className="sug-text">{sug.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-quick-bar">
            {DEFAULT_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                className="quick-pill-btn"
                onClick={() => handleSend(sug.text)}
                disabled={isLoading}
                title={sug.text}
              >
                <span>{sug.icon}</span>
                <span className="quick-pill-text">{sug.text}</span>
              </button>
            ))}
          </div>

          <div className="chat-input-container">
            <button className={`chat-voice-btn ${isListening ? 'listening' : ''}`} onClick={toggleListening}>
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <input
              ref={inputRef}
              type="text"
              className="chat-text-input"
              placeholder={isListening ? 'Đang lắng nghe...' : 'Hỏi về dự án, kỹ năng...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button className={`chat-send-btn ${input.trim() && !isLoading ? 'active' : ''}`} onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
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
      '- **Email**: nguyenquockhoa5549@gmail.com\n' +
      '- **Số điện thoại / Zalo**: 0969 895 549\n' +
      '- **GitHub**: [github.com/quockhoa53](https://github.com/quockhoa53)\n' +
      '- **Trang Liên hệ**: Vui lòng truy cập mục **Liên hệ** trên menu để gửi tin nhắn trực tiếp.'
    )
  }
  return (
    'Tôi là **NQK AI Assistant**. Tôi sẵn sàng giải đáp về kinh nghiệm làm việc, năng lực kỹ thuật (Java/Spring Boot, PostgreSQL, Microservices, AI) và các dự án tiêu biểu của kỹ sư Nguyễn Quốc Khoa!'
  )
}
