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
  Square,
  ThumbsUp,
  ThumbsDown,
  ClipboardCopy,
  FileDown,
  History,
  Plus,
  Trash2,
  MessageSquare,
  ArrowLeft
} from 'lucide-react'
import { getProjects, getKnowledgeArticles, getResumes } from '../../services/portfolioApi'
import { API_BASE } from '../../services/httpClient'
import { useToast } from '../common/ToastContext'
import { ProjectChatCard } from './ProjectChatCard'
import { ArticleChatCard } from './ArticleChatCard'
import { ContactChatCard } from './ContactChatCard'
import { ResumeChatCard } from './ResumeChatCard'
import { ContactConfirmChatCard } from './ContactConfirmChatCard'

const DEFAULT_SUGGESTIONS = [
  { icon: '💼', text: 'Kinh nghiệm làm việc & năng lực của Khoa?' },
  { icon: '🚀', text: 'Các dự án nổi bật mà Khoa đã thực hiện?' },
  { icon: '⚡', text: 'Khoa sử dụng những công nghệ Backend & AI nào?' },
  { icon: '📄', text: 'Tải CV & hồ sơ năng lực của Khoa' },
  { icon: '📞', text: 'Làm thế nào để liên hệ và hợp tác với Khoa?' }
]

function getContextualFollowUps(content) {
  if (!content || typeof content !== 'string') return []
  const c = content.toLowerCase()
  if (c.includes('dự án') || c.includes('project') || c.includes('e-commerce') || c.includes('ticket') || c.includes('agent')) {
    return [
      { icon: '🛠️', text: 'Kiến trúc & Công nghệ của dự án này?' },
      { icon: '💻', text: 'Xem mã nguồn GitHub & Demo' },
      { icon: '📩', text: 'Tư vấn chi phí & triển khai dự án tương tự' }
    ]
  }
  if (c.includes('kỹ năng') || c.includes('skill') || c.includes('spring boot') || c.includes('microservices') || c.includes('java') || c.includes('postgres')) {
    return [
      { icon: '🏢', text: 'Lịch sử kinh nghiệm tại các công ty?' },
      { icon: '📄', text: 'Cho tôi xem bản CV của Quốc Khoa' },
      { icon: '🚀', text: 'Các dự án tiêu biểu áp dụng công nghệ này' }
    ]
  }
  if (c.includes('liên hệ') || c.includes('contact') || c.includes('email') || c.includes('sđt') || c.includes('zalo') || c.includes('tuyển dụng') || c.includes('hợp tác')) {
    return [
      { icon: '📅', text: 'Soạn thư mời phỏng vấn' },
      { icon: '💬', text: 'Tư vấn dự án phần mềm' },
      { icon: '📄', text: 'Tải bản CV PDF chính thức' }
    ]
  }
  if (c.includes('bài viết') || c.includes('kiến thức') || c.includes('database') || c.includes('tối ưu')) {
    return [
      { icon: '💡', text: 'Các bài viết kiến thức khác của Khoa' },
      { icon: '⚡', text: 'Kinh nghiệm tối ưu hóa Database' }
    ]
  }
  return [
    { icon: '🚀', text: 'Các dự án nổi bật của Khoa?' },
    { icon: '⚡', text: 'Thế mạnh Backend & AI của Khoa' },
    { icon: '📞', text: 'Làm sao để liên hệ với Khoa?' }
  ]
}

function parseContactConfirm(content) {
  if (!content || typeof content !== 'string') return { text: '', contactData: null }

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
        return {
          text: cleanText || 'Dưới đây là thông tin phiếu liên hệ để bạn xác nhận và gửi trực tiếp tới anh Khoa:',
          contactData
        }
      } catch (e) {
        console.warn('Failed to parse contact confirmation JSON:', e)
        const fullTag = cleanContent.slice(tagStart, jsonEnd + 2)
        const cleanText = cleanContent.replace(fullTag, '').trim()
        return {
          text: cleanText || 'Dạ bạn có thể truy cập trực tiếp trang [Mục Liên Hệ](/contact) để gửi thông tin hoặc trao đổi nhanh với anh Khoa nhé! ✨',
          contactData: null
        }
      }
    }
  }

  return { text: cleanContent, contactData: null }
}

const ChatMessageItem = memo(function ChatMessageItem({
  message,
  messageIndex,
  sessionId,
  projectsList,
  articlesList,
  resumesList,
  onCloseMobile,
  isSpeaking,
  onSpeak,
  isLatestAssistant,
  isLoading,
  onSendChip
}) {
  const { text, contactData } = useMemo(() => parseContactConfirm(message.content), [message.content])
  const [feedbackRating, setFeedbackRating] = useState(null)
  const contextualChips = useMemo(() => getContextualFollowUps(text), [text])

  const handleFeedback = useCallback(async (ratingVal) => {
    if (feedbackRating === ratingVal) return
    setFeedbackRating(ratingVal)
    try {
      await fetch(`${API_BASE}/chat/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message_index: messageIndex,
          rating: ratingVal,
          comment: ''
        })
      })
    } catch {
      // offline silent fallback
    }
  }, [sessionId, messageIndex, feedbackRating])

  const markdownComponents = useMemo(() => ({
    table: ({ children, ...props }) => (
      <div className="chat-table-scroll-wrap">
        <table {...props}>{children}</table>
      </div>
    ),
    a: ({ href, children, ...props }) => {
      if (!href) return <span>{children}</span>

      // Normalize path (handle full URLs with .vercel.app, .vercel.com, localhost or relative paths)
      let path = href
      // Strip any protocol and portfolio domain variations
      path = path.replace(/^https?:\/\/[^/]*(?:vercel\.(?:app|com)|nguyenquockhoa|localhost:\d+)/i, '')
      if (!path.startsWith('/') && !path.startsWith('http')) {
        path = '/' + path
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

  const hasContent = Boolean((text && text.trim()) || contactData)

  return (
    <div className={`chat-bubble-row ${message.role === 'user' ? 'row-user' : 'row-bot'}`}>
      {message.role === 'assistant' && (
        <div className="msg-bot-avatar">
          <img src="/chatbot-avatar.png" alt="NQK AI" className="msg-bot-img" />
        </div>
      )}

      <div className={`chat-bubble ${message.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
        {hasContent ? (
          <>
            {text && text.trim() && (
              <div className="chat-markdown-renderer">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {text}
                </ReactMarkdown>
              </div>
            )}
            {contactData && (
              <div style={{ marginTop: text && text.trim() ? 10 : 0 }}>
                <ContactConfirmChatCard data={contactData} />
              </div>
            )}
            {message.role === 'assistant' && text && text.trim() && (
              <div className="msg-toolbar">
                <button
                  type="button"
                  className={`msg-speak-btn ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => onSpeak?.(text, message.id || text.slice(0, 30))}
                  title={isSpeaking ? 'Dừng đọc' : 'Nghe giọng đọc AI (Tiếng Việt)'}
                  aria-label="Nghe đọc tin nhắn"
                >
                  {isSpeaking ? <Square size={11} className="stop-icon" /> : <Volume2 size={12} />}
                  <span>{isSpeaking ? 'Dừng đọc' : 'Nghe'}</span>
                </button>

                <div className="msg-feedback-group">
                  <button
                    type="button"
                    className={`msg-feedback-btn ${feedbackRating === 1 ? 'active-up' : ''}`}
                    onClick={() => handleFeedback(1)}
                    title="Câu trả lời hữu ích 👍"
                    aria-label="Hữu ích"
                  >
                    <ThumbsUp size={11} />
                  </button>
                  <button
                    type="button"
                    className={`msg-feedback-btn ${feedbackRating === -1 ? 'active-down' : ''}`}
                    onClick={() => handleFeedback(-1)}
                    title="Chưa đúng ý / Cần cải thiện 👎"
                    aria-label="Chưa đúng ý"
                  >
                    <ThumbsDown size={11} />
                  </button>
                </div>
              </div>
            )}

            {/* Contextual Follow-up Chips for Assistant */}
            {message.role === 'assistant' && isLatestAssistant && !isLoading && contextualChips.length > 0 && (
              <div className="contextual-chips-container">
                <div className="contextual-chips-label">
                  <Sparkles size={11} className="chips-sparkle" />
                  <span>Gợi ý câu hỏi tiếp theo:</span>
                </div>
                <div className="contextual-chips-grid">
                  {contextualChips.map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      className="contextual-chip-item"
                      onClick={() => onSendChip?.(chip.text)}
                    >
                      <span className="chip-icon">{chip.icon}</span>
                      <span className="chip-text">{chip.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="typing-dots">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <div className="chat-markdown-renderer">
            Dạ, tôi đã nhận được thông tin từ bạn. Bạn vui lòng cho tôi biết câu hỏi hoặc yêu cầu cụ thể để tôi hỗ trợ bạn tốt nhất nhé! ✨
          </div>
        )}
      </div>
    </div>
  )
})

const STORAGE_KEY_SESSIONS = 'nqk_portfolio_chat_sessions_v2'
const STORAGE_KEY_MESSAGES = 'nqk_portfolio_chat_messages_v1'
const STORAGE_KEY_SESSION = 'nqk_portfolio_chat_session_v1'

function getInitialGuestName() {
  try {
    const saved = localStorage.getItem('portfolio_guest_info')
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.displayName || ''
    }
  } catch {}
  return ''
}

function getAllSavedSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

function saveSessionToStore(sessionObj) {
  try {
    const sessions = getAllSavedSessions()
    const idx = sessions.findIndex(s => s.id === sessionObj.id)
    if (idx !== -1) {
      sessions[idx] = { ...sessions[idx], ...sessionObj, updatedAt: Date.now() }
    } else {
      sessions.unshift({ ...sessionObj, createdAt: Date.now(), updatedAt: Date.now() })
    }
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions.slice(0, 30)))
  } catch {}
}

function getInitialSessionId() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SESSION)
    if (saved) return saved
  } catch {}
  const newId = 'sess_' + Math.random().toString(36).substring(2, 9)
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, newId)
  } catch {}
  return newId
}

function getInitialWelcomeMessage(name) {
  return {
    id: 'welcome-msg',
    role: 'assistant',
    content: name
      ? `Xin chào bạn **${name}**! 👋 Tôi là **NQK AI Assistant** - Trợ lý AI đại diện cho kỹ sư **Nguyễn Quốc Khoa**.\n\nRất vui được gặp lại bạn! Bạn muốn tìm hiểu thêm về các dự án thực tế, kinh nghiệm thiết kế Backend, tối ưu Database hay giải pháp AI nào của anh Khoa?`
      : 'Xin chào! 👋 Tôi là **NQK AI Assistant** - Trợ lý AI đại diện cho kỹ sư **Nguyễn Quốc Khoa**.\n\nBạn có thể hỏi tôi về các dự án thực tế, kinh nghiệm thiết kế Backend, tối ưu Database hoặc các giải pháp AI mà Khoa đã triển khai.'
  }
}

function getInitialMessages(name) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MESSAGES)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return [getInitialWelcomeMessage(name)]
}

export function PortfolioChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [guestName, setGuestName] = useState(getInitialGuestName)
  const [sessionId, setSessionId] = useState(getInitialSessionId)
  const [messages, setMessages] = useState(() => getInitialMessages(getInitialGuestName()))
  const [savedSessionsList, setSavedSessionsList] = useState(getAllSavedSessions)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)
  const [projectsList, setProjectsList] = useState([])
  const [articlesList, setArticlesList] = useState([])
  const [resumesList, setResumesList] = useState([])
  
  const toast = useToast()

  // Sync messages to localStorage and persistent sessions list
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages))
      }
      if (messages.length > 1) {
        const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'Cuộc trò chuyện'
        const title = firstUserMsg.length > 45 ? firstUserMsg.slice(0, 45) + '...' : firstUserMsg
        saveSessionToStore({ id: sessionId, title, messages })
        setSavedSessionsList(getAllSavedSessions())
      }
    } catch {}
  }, [messages, sessionId])

  // Sync guest identity from localStorage
  useEffect(() => {
    const checkGuest = () => {
      const name = getInitialGuestName()
      setGuestName(name)
    }
    window.addEventListener('storage', checkGuest)
    return () => window.removeEventListener('storage', checkGuest)
  }, [])

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
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }, [])

  // Text-to-Speech (TTS) voice player
  const handleSpeak = useCallback(async (text, messageId) => {
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
      const response = await fetch(`${API_BASE}/chat/tts`, {
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

  // Speech-to-Text (STT) voice input handler with Realtime interim feedback & permission error handling
  const toggleListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói. Bạn vui lòng sử dụng Chrome hoặc Edge.')
      return
    }
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'vi-VN'
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsListening(true)
      }
      recognition.onresult = (e) => {
        let interimTranscript = ''
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          interimTranscript += e.results[i][0].transcript
        }
        if (interimTranscript) {
          setInput(interimTranscript)
        }
      }
      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error)
        setIsListening(false)
        if (e.error === 'not-allowed') {
          toast.error('Vui lòng cho phép quyền truy cập Microphone trên trình duyệt để nói.')
        }
      }
      recognition.onend = () => {
        setIsListening(false)
      }
      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.warn('Failed to start speech recognition:', err)
      setIsListening(false)
    }
  }, [isListening, toast])

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen && !showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isLoading, showHistory])

  // Listen for open-ai-chat event dispatched by Command Palette
  useEffect(() => {
    const handleOpenAIChat = (e) => {
      setIsOpen(true)
      setShowHistory(false)
      if (e.detail?.query) setTimeout(() => handleSend(e.detail.query), 100)
    }
    window.addEventListener('open-ai-chat', handleOpenAIChat)
    return () => window.removeEventListener('open-ai-chat', handleOpenAIChat)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !showHistory) {
      setShowTooltip(false)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, showHistory])

  function handleReset() {
    const newSession = 'sess_' + Math.random().toString(36).substring(2, 9)
    setSessionId(newSession)
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, newSession)
    } catch {}
    const currentName = getInitialGuestName()
    const welcome = [getInitialWelcomeMessage(currentName)]
    setMessages(welcome)
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(welcome))
    } catch {}
    setShowHistory(false)
    toast.info('Đã bắt đầu cuộc trò chuyện mới.')
  }

  function handleSelectSession(sessionItem) {
    if (!sessionItem) return
    setSessionId(sessionItem.id)
    setMessages(sessionItem.messages || [])
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, sessionItem.id)
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(sessionItem.messages || []))
    } catch {}
    setShowHistory(false)
    toast.success('Đã tải cuộc trò chuyện.')
  }

  function handleDeleteSession(e, targetId) {
    e.stopPropagation()
    const current = getAllSavedSessions()
    const filtered = current.filter(s => s.id !== targetId)
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(filtered))
    setSavedSessionsList(filtered)
    if (targetId === sessionId) {
      handleReset()
    } else {
      toast.info('Đã xóa cuộc trò chuyện khỏi lịch sử.')
    }
  }

  function handleClearAllHistory() {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử các cuộc trò chuyện?')) {
      localStorage.removeItem(STORAGE_KEY_SESSIONS)
      setSavedSessionsList([])
      handleReset()
      toast.success('Đã xóa sạch toàn bộ lịch sử.')
    }
  }

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatMarkdownToHtml(markdownText) {
  if (!markdownText) return ''
  let html = escapeHtml(markdownText)

  // Code blocks ```code```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // Bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Headers ###
  html = html.replace(/^### (.*$)/gim, '<h4>$1</h4>')
  html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>')

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Bullet points
  html = html.replace(/^\s*[-*•]\s+(.*)$/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
  html = html.replace(/<\/ul>\s*<ul>/gim, '')

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br/>')

  return `<p>${html}</p>`
}

function generateChatHtmlExport(messages, sessionId, guestName) {
  const exportTime = new Date().toLocaleString('vi-VN')
  const guestDisplay = guestName ? escapeHtml(guestName) : 'Khách vãng lai'

  const messageItemsHtml = messages.map(m => {
    const isUser = m.role === 'user'
    const roleLabel = isUser ? '👤 ' + guestDisplay : '🤖 NQK AI Assistant'
    const contentHtml = formatMarkdownToHtml(m.content)

    return `
      <div class="msg-wrapper ${isUser ? 'user-side' : 'ai-side'}">
        <div class="msg-sender">${roleLabel}</div>
        <div class="msg-bubble">
          ${contentHtml}
        </div>
      </div>
    `
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lịch Sử Cuộc Trò Chuyện - NQK AI Assistant (${sessionId})</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #131b2e;
      --bubble-ai: #1e293b;
      --bubble-user: linear-gradient(135deg, #0284c7, #4f46e5);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --border: rgba(255, 255, 255, 0.1);
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.25);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 24px 16px;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: var(--card-bg);
      border-radius: 16px;
      border: 1px solid var(--border);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }
    .header {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a, #1e1b4b);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header-info { display: flex; align-items: center; gap: 14px; }
    .bot-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 0 15px var(--accent-glow);
    }
    .title { font-size: 20px; font-weight: 700; color: #ffffff; }
    .meta { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
    .actions { display: flex; gap: 8px; }
    .btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.08);
      color: var(--text);
      transition: all 0.2s;
    }
    .btn:hover { background: rgba(255, 255, 255, 0.15); }
    .btn-primary { background: #0284c7; border-color: #0284c7; color: #fff; }
    .btn-primary:hover { background: #0369a1; }
    .chat-body {
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .msg-wrapper { display: flex; flex-direction: column; max-width: 88%; }
    .msg-wrapper.user-side { align-self: flex-end; align-items: flex-end; }
    .msg-wrapper.ai-side { align-self: flex-start; align-items: flex-start; }
    .msg-sender { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 5px; }
    .msg-bubble {
      padding: 14px 18px;
      border-radius: 14px;
      font-size: 14.5px;
      line-height: 1.65;
      word-break: break-word;
    }
    .user-side .msg-bubble {
      background: var(--bubble-user);
      color: #ffffff;
      border-bottom-right-radius: 2px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
    }
    .ai-side .msg-bubble {
      background: var(--bubble-ai);
      color: var(--text);
      border: 1px solid var(--border);
      border-bottom-left-radius: 2px;
    }
    .msg-bubble p { margin-bottom: 8px; }
    .msg-bubble p:last-child { margin-bottom: 0; }
    .msg-bubble ul { margin: 8px 0 8px 20px; }
    .msg-bubble li { margin-bottom: 4px; }
    .msg-bubble a { color: #38bdf8; text-decoration: underline; }
    .msg-bubble pre {
      background: #090d16;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 10px 0;
      border: 1px solid var(--border);
      font-family: Consolas, Monaco, monospace;
      font-size: 13px;
    }
    .inline-code {
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: Consolas, Monaco, monospace;
      font-size: 13px;
      color: #38bdf8;
    }
    .footer {
      padding: 20px 24px;
      background: #0b1120;
      border-top: 1px solid var(--border);
      font-size: 12.5px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .footer-links a { color: var(--accent); text-decoration: none; margin-left: 12px; }
    .footer-links a:hover { text-decoration: underline; }
    @media print {
      body { background: #ffffff; color: #000000; padding: 0; }
      .container { border: none; box-shadow: none; max-width: 100%; }
      .actions { display: none; }
      .header, .footer { background: #f1f5f9; color: #000; }
      .user-side .msg-bubble { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
      .ai-side .msg-bubble { background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; }
      .title, .meta, .msg-sender { color: #0f172a !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-info">
        <div class="bot-avatar">🤖</div>
        <div>
          <div class="title">NQK AI Assistant</div>
          <div class="meta">Phiên chat: <strong>${sessionId}</strong> • Xuất lúc: ${exportTime} • Khách: <strong>${guestDisplay}</strong></div>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-primary" onclick="window.print()">🖨️ In / Lưu PDF</button>
        <a class="btn" href="https://nguyenquockhoaportfolio.vercel.app" target="_blank">🌐 Mở Website</a>
      </div>
    </div>

    <div class="chat-body">
      ${messageItemsHtml}
    </div>

    <div class="footer">
      <div>Được tạo tự động bởi <strong>NQK AI Assistant</strong> - Trợ lý AI đại diện cho kỹ sư <strong>Nguyễn Quốc Khoa</strong></div>
      <div class="footer-links">
        <span>📧 nguyenquockhoa5549@gmail.com</span>
        <span>📱 0969 895 549</span>
        <a href="https://nguyenquockhoaportfolio.vercel.app" target="_blank">Portfolio</a>
        <a href="https://github.com/quockhoa53" target="_blank">GitHub</a>
      </div>
    </div>
  </div>
</body>
</html>`
}

function handleExportChat() {
  if (messages.length <= 1) {
    toast.info('Chưa có nội dung trò chuyện để tải về.')
    return
  }
  const htmlContent = generateChatHtmlExport(messages, sessionId, guestName)
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hoi-thoai-nqk-ai-${sessionId}.html`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Đã xuất lịch sử cuộc trò chuyện trực quan (.html)!')
}

  function handleCopySummary() {
    const userQueries = messages.filter(m => m.role === 'user').map(m => `• ${m.content}`).join('\n')
    const summary = `📋 [TÓM TẮT CUỘC TRÒ CHUYỆN VỚI NQK AI]\n• Phiên chat: ${sessionId}\n• Thời gian: ${new Date().toLocaleString('vi-VN')}\n\nCác chủ đề đã trao đổi:\n${userQueries || '• Trao đổi thông tin năng lực và dự án của Nguyễn Quốc Khoa'}\n\nLiên hệ kỹ sư Nguyễn Quốc Khoa:\n• Email: nguyenquockhoa5549@gmail.com\n• SĐT / Zalo: 0969 895 549\n• Website: https://nguyenquockhoaportfolio.vercel.app`
    navigator.clipboard.writeText(summary)
    toast.success('Đã sao chép tóm tắt cuộc trò chuyện vào clipboard!')
  }

  async function handleSend(textToSend) {
    const query = (textToSend || input).trim()
    if (!query || isLoading) return

    setInput('')
    const currentGuest = getInitialGuestName()
    setGuestName(currentGuest)

    const botMsgId = 'bot-' + Date.now()
    const newMessages = [...messages, { id: 'user-' + Date.now(), role: 'user', content: query }, { id: botMsgId, role: 'assistant', content: '' }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: query,
          guest_name: currentGuest
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
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataPayload = line.slice(6)
              if (!dataPayload.trim() || dataPayload.trim() === '[DONE]') continue
              try {
                const parsed = JSON.parse(dataPayload.trim())
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
        if (!accumulated || !accumulated.trim()) {
          const fallbackReply = generateClientFallbackReply(query)
          setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fallbackReply } : m))
        }
      } else {
        const fallbackReply = generateClientFallbackReply(query)
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fallbackReply } : m))
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

  // Find last assistant message index to position follow-up chips
  const lastAssistantIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i
    }
    return -1
  }, [messages])

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
              <button
                className={`header-icon-btn ${showHistory ? 'active' : ''}`}
                onClick={() => setShowHistory(!showHistory)}
                title="Lịch sử cuộc trò chuyện"
              >
                <History size={16} />
              </button>
              <button
                className="header-icon-btn"
                onClick={handleReset}
                title="Cuộc trò chuyện mới"
              >
                <Plus size={18} />
              </button>
              <button
                className="header-icon-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                className="header-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Đóng chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {showHistory ? (
            <div className="chat-history-drawer reveal">
              <div className="history-drawer-header">
                <button className="history-back-btn" onClick={() => setShowHistory(false)}>
                  <ArrowLeft size={15} />
                  <span>Quay lại cuộc trò chuyện</span>
                </button>
                {savedSessionsList.length > 0 && (
                  <button className="history-clear-btn" onClick={handleClearAllHistory} title="Xóa toàn bộ lịch sử">
                    <Trash2 size={13} />
                    <span>Xóa tất cả</span>
                  </button>
                )}
              </div>

              <div className="history-quick-actions">
                <button className="history-action-pill" onClick={handleCopySummary} title="Sao chép tóm tắt cuộc trò chuyện hiện tại">
                  <ClipboardCopy size={14} />
                  <span>Sao chép tóm tắt</span>
                </button>
                <button className="history-action-pill" onClick={handleExportChat} title="Tải xuống tệp HTML trực quan (.html)">
                  <FileDown size={14} />
                  <span>Tải file (.html)</span>
                </button>
                <button className="history-action-pill highlight" onClick={handleReset} title="Bắt đầu phiên chat mới">
                  <Plus size={14} />
                  <span>Phiên mới</span>
                </button>
              </div>

              <div className="history-sessions-list">
                <div className="history-section-title">
                  <History size={13} />
                  <span>Các cuộc hội thoại đã lưu ({savedSessionsList.length})</span>
                </div>

                {savedSessionsList.length === 0 ? (
                  <div className="history-empty-state">
                    <MessageSquare size={32} className="empty-icon" />
                    <p className="empty-title">Chưa có lịch sử trò chuyện</p>
                    <span className="empty-desc">Các câu hỏi của bạn với NQK AI sẽ được tự động lưu tại đây.</span>
                  </div>
                ) : (
                  savedSessionsList.map((s) => (
                    <div
                      key={s.id}
                      className={`history-session-item ${s.id === sessionId ? 'active-session' : ''}`}
                      onClick={() => handleSelectSession(s)}
                    >
                      <div className="session-item-icon">
                        <MessageSquare size={16} />
                      </div>
                      <div className="session-item-content">
                        <div className="session-item-title">{s.title || 'Cuộc trò chuyện'}</div>
                        <div className="session-item-meta">
                          <span>{s.updatedAt ? new Date(s.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''}</span>
                          <span className="meta-dot">•</span>
                          <span>{s.messages?.length || 0} tin nhắn</span>
                          {s.id === sessionId && <span className="session-active-tag">Đang mở</span>}
                        </div>
                      </div>
                      <button
                        className="session-delete-btn"
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        title="Xóa cuộc trò chuyện này"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="chat-messages-container">
                {messages.map((m, idx) => (
                  <ChatMessageItem
                    key={m.id || idx}
                    message={m}
                    messageIndex={idx}
                    sessionId={sessionId}
                    projectsList={projectsList}
                    articlesList={articlesList}
                    resumesList={resumesList}
                    onCloseMobile={handleCloseMobile}
                    isSpeaking={speakingMessageId === (m.id || m.content.slice(0, 30))}
                    onSpeak={handleSpeak}
                    isLatestAssistant={idx === lastAssistantIndex}
                    isLoading={isLoading}
                    onSendChip={handleSend}
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

              <div className="chat-input-container">
                <button
                  type="button"
                  className={`chat-voice-btn ${isListening ? 'listening' : ''}`}
                  onClick={toggleListening}
                  title={isListening ? 'Đang nghe... Nhấp để dừng' : 'Nói bằng giọng nói (Tiếng Việt)'}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  {isListening && <span className="mic-pulse-ring" />}
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  className="chat-text-input"
                  placeholder={isListening ? '🎙️ Đang nghe giọng nói của bạn...' : 'Hỏi về dự án, kỹ năng, liên hệ...'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <button className={`chat-send-btn ${input.trim() && !isLoading ? 'active' : ''}`} onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
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
