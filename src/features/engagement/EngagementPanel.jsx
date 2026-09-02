import {
  Check,
  Edit3,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Send,
  Sparkles,
  Upload,
  UserRound,
  X
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import {
  commentKnowledge,
  commentProject,
  getKnowledgeComments,
  getKnowledgeLikeStatus,
  getProjectComments,
  getProjectLikeStatus,
  likeKnowledge,
  likeProject,
  registerGuest,
  unlikeKnowledge,
  unlikeProject
} from '../../services/portfolioApi'

export const ANIMAL_AVATARS = [
  { id: 'fox', label: 'Cáo thông thái', emoji: '🦊', bg: '#ffedd5', color: '#ea580c' },
  { id: 'cat', label: 'Mèo tinh nghịch', emoji: '🐱', bg: '#fef9c3', color: '#ca8a04' },
  { id: 'dog', label: 'Cún cưng', emoji: '🐶', bg: '#dcfce7', color: '#16a34a' },
  { id: 'panda', label: 'Gấu trúc', emoji: '🐼', bg: '#f1f5f9', color: '#334155' },
  { id: 'lion', label: 'Sư tử dũng mãnh', emoji: '🦁', bg: '#fef3c7', color: '#d97706' },
  { id: 'rabbit', label: 'Thỏ nhanh nhẹn', emoji: '🐰', bg: '#fce7f3', color: '#db2777' },
  { id: 'owl', label: 'Cú đêm coder', emoji: '🦉', bg: '#ede9fe', color: '#7c3aed' },
  { id: 'bear', label: 'Gấu ấm áp', emoji: '🐻', bg: '#fed7aa', color: '#9a3412' },
  { id: 'tiger', label: 'Hổ dũng mãnh', emoji: '🐯', bg: '#ffedd5', color: '#c2410c' },
  { id: 'penguin', label: 'Cánh cụt vui vẻ', emoji: '🐧', bg: '#e0f2fe', color: '#0284c7' },
  { id: 'unicorn', label: 'Kỳ lân ma thuật', emoji: '🦄', bg: '#fae8ff', color: '#c026d3' },
  { id: 'robot', label: 'Robot AI', emoji: '🤖', bg: '#cffafe', color: '#0891b2' }
]

export function getDeterministicAvatar(name = '') {
  if (!name) return ANIMAL_AVATARS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % ANIMAL_AVATARS.length
  return ANIMAL_AVATARS[index]
}

export function EngagementPanel({ type, id, initialLikes = 0 }) {
  const toast = useToast()
  const fileInputRef = useRef(null)

  const api = useMemo(
    () =>
      type === 'knowledge'
        ? {
            comments: getKnowledgeComments,
            comment: commentKnowledge,
            likeStatus: getKnowledgeLikeStatus,
            like: likeKnowledge,
            unlike: unlikeKnowledge
          }
        : {
            comments: getProjectComments,
            comment: commentProject,
            likeStatus: getProjectLikeStatus,
            like: likeProject,
            unlike: unlikeProject
          },
    [type]
  )

  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(initialLikes)
  const [identity, setIdentity] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // 'like' | 'comment' | null
  const [guest, setGuest] = useState({ displayName: '', email: '', avatar: 'fox' })
  const [hasRegistered, setHasRegistered] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [avatarTab, setAvatarTab] = useState('animals') // 'animals' | 'upload'

  // Load saved guest info & guest token from localStorage on mount
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem('portfolio_guest_info')
      const token = localStorage.getItem('portfolio_guest_token')
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo)
        if (parsed.displayName) {
          setGuest(prev => ({
            ...prev,
            displayName: parsed.displayName,
            email: parsed.email || '',
            avatar: parsed.avatar || 'fox'
          }))
          if (token) {
            setHasRegistered(true)
          }
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }, [])

  // Fetch comments and like status on mount / ID change
  useEffect(() => {
    if (!id) return

    // 1. Fetch Comments
    api
      .comments(id)
      .then(res => {
        const data = res?.data || res
        if (Array.isArray(data)) setComments(data)
      })
      .catch(() => {})

    // 2. Fetch Like Status for current visitor
    api
      .likeStatus(id)
      .then(res => {
        if (res) {
          setLiked(Boolean(res.liked))
          if (typeof res.likeCount === 'number') {
            setLikes(res.likeCount)
          }
        }
      })
      .catch(() => {})
  }, [id, api])

  // Like / Unlike action
  const toggleLike = useCallback(async () => {
    if (isLiking) return
    const token = localStorage.getItem('portfolio_guest_token')
    if (!token) {
      setPendingAction('like')
      setIdentity(true)
      return
    }

    setIsLiking(true)
    try {
      const result = liked ? await api.unlike(id) : await api.like(id)
      if (result) {
        setLiked(result.liked)
        if (typeof result.likeCount === 'number') {
          setLikes(result.likeCount)
        }
      }
    } catch (err) {
      if (err?.status === 401) {
        setPendingAction('like')
        setIdentity(true)
      }
    } finally {
      setIsLiking(false)
    }
  }, [api, id, liked, isLiking])

  // Submit comment
  const submitComment = useCallback(
    async e => {
      if (e) e.preventDefault()
      const trimmed = content.trim()
      if (!trimmed || isSubmitting) return

      const token = localStorage.getItem('portfolio_guest_token')
      if (!token) {
        setPendingAction('comment')
        setIdentity(true)
        return
      }

      setIsSubmitting(true)
      try {
        const result = await api.comment(id, { content: trimmed })
        setContent('')

        // Realtime instant UI insertion: show the comment right away!
        if (result && result.id) {
          setComments(prev => {
            if (prev.some(c => c.id === result.id)) return prev
            return [...prev, { ...result, guestAvatar: guest.avatar }]
          })
        }
      } catch (err) {
        if (err?.status === 401) {
          setPendingAction('comment')
          setIdentity(true)
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [api, content, guest.avatar, id, isSubmitting]
  )

  // Handle Image File Upload
  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result
      if (base64Url) {
        setGuest(prev => ({ ...prev, avatar: base64Url }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Register Guest Info
  async function register(e) {
    e.preventDefault()
    if (!guest.displayName.trim() || !guest.email.trim()) return

    try {
      const res = await registerGuest({
        displayName: guest.displayName.trim(),
        email: guest.email.trim()
      })
      const token = res?.token || res?.id
      if (token) {
        localStorage.setItem('portfolio_guest_token', token)
      }
      localStorage.setItem(
        'portfolio_guest_info',
        JSON.stringify({
          displayName: guest.displayName.trim(),
          email: guest.email.trim(),
          avatar: guest.avatar || 'fox'
        })
      )
      setHasRegistered(true)
      setIdentity(false)

      // Auto-resume pending user action
      if (pendingAction === 'like') {
        setPendingAction(null)
        setTimeout(() => toggleLike(), 200)
      } else if (pendingAction === 'comment') {
        setPendingAction(null)
        setTimeout(() => submitComment(), 200)
      }
    } catch (err) {
      console.error('Failed to register guest:', err)
    }
  }

  // Render Avatar Helper
  function renderAvatar(avatarVal, fallbackName = 'U') {
    if (!avatarVal) {
      const det = getDeterministicAvatar(fallbackName)
      return (
        <span
          className="avatar-emoji-badge"
          style={{ background: det.bg, color: det.color }}
          title={det.label}
        >
          {det.emoji}
        </span>
      )
    }

    if (avatarVal.startsWith('data:image') || avatarVal.startsWith('http')) {
      return (
        <img
          src={avatarVal}
          alt={fallbackName}
          className="avatar-img-badge"
        />
      )
    }

    const matchedAnimal = ANIMAL_AVATARS.find(a => a.id === avatarVal) || getDeterministicAvatar(fallbackName)
    return (
      <span
        className="avatar-emoji-badge"
        style={{ background: matchedAnimal.bg, color: matchedAnimal.color }}
        title={matchedAnimal.label}
      >
        {matchedAnimal.emoji}
      </span>
    )
  }

  return (
    <section className="engagement">
      <div className="engagement-head">
        <div>
          <span>COMMUNITY</span>
          <h2>Yêu thích &amp; thảo luận</h2>
        </div>
        <button
          type="button"
          className={`engagement-like-btn ${liked ? 'liked' : ''}`}
          onClick={toggleLike}
          disabled={isLiking}
          title={liked ? 'Nhấp để bỏ thích' : 'Nhấp để thả tim'}
        >
          <Heart fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : 'currentColor'} size={18} />
          <b>{likes}</b> {liked ? 'Đã thích' : 'Yêu thích'}
        </button>
      </div>

      {hasRegistered && guest.displayName && (
        <div className="guest-identity-bar">
          <div className="guest-identity-left">
            <div className="guest-identity-avatar">
              {renderAvatar(guest.avatar, guest.displayName)}
            </div>
            <span>
              Bình luận với tên: <strong>{guest.displayName}</strong> ({guest.email})
            </span>
          </div>
          <button
            type="button"
            className="guest-change-btn"
            onClick={() => {
              setPendingAction(null)
              setIdentity(true)
            }}
          >
            <Edit3 size={13} /> Đổi thông tin &amp; Avatar
          </button>
        </div>
      )}

      <form className="comment-form" onSubmit={submitComment}>
        <div
          className="comment-avatar cursor-pointer"
          onClick={() => {
            setPendingAction(null)
            setIdentity(true)
          }}
          title="Bấm để đổi Avatar hoặc thông tin"
        >
          {renderAvatar(guest.avatar, guest.displayName)}
        </div>
        <textarea
          maxLength={3000}
          placeholder="Chia sẻ suy nghĩ hoặc câu hỏi của bạn về nội dung này..."
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={isSubmitting}
        />
        <button type="submit" disabled={!content.trim() || isSubmitting}>
          <Send size={15} />
          {isSubmitting ? 'Đang gửi...' : 'Gửi'}
        </button>
      </form>

      <div className="comment-list">
        <h3>
          <MessageCircle size={18} />
          {comments.length} bình luận
        </h3>
        {comments.length === 0 ? (
          <p className="no-comments-msg">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!</p>
        ) : (
          comments.map(c => {
            const isCurrentUser = hasRegistered && guest.displayName && c.displayName === guest.displayName
            const commentAvatar = isCurrentUser ? (guest.avatar || c.guestAvatar) : c.guestAvatar
            return (
              <article key={c.id}>
                <div className="comment-user-avatar">
                  {renderAvatar(commentAvatar, c.displayName)}
                </div>
                <section>
                  <header>
                    <b>{c.displayName}</b>
                    {c.emailVerified && <span>Đã xác minh</span>}
                    <time>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</time>
                  </header>
                  <p>{c.content}</p>
                </section>
              </article>
            )
          })
        )}
      </div>

      {identity && (
        <div className="identity-modal">
          <form onSubmit={register}>
            <button
              type="button"
              className="identity-modal-close"
              onClick={() => {
                setIdentity(false)
                setPendingAction(null)
              }}
            >
              <X size={16} />
            </button>
            <div className="identity-icon">
              <Sparkles size={24} />
            </div>
            <h3>Thông tin người bình luận</h3>
            <p>Chọn hình ảnh hoạt hình yêu thích hoặc tải avatar lên để cá nhân hóa bình luận của bạn.</p>

            {/* Avatar Selector Section */}
            <div className="avatar-picker-section">
              <label className="avatar-picker-title">Chọn ảnh đại diện (Avatar):</label>
              <div className="avatar-tab-buttons">
                <button
                  type="button"
                  className={`avatar-tab-btn ${avatarTab === 'animals' ? 'active' : ''}`}
                  onClick={() => setAvatarTab('animals')}
                >
                  🐾 Con vật hoạt hình
                </button>
                <button
                  type="button"
                  className={`avatar-tab-btn ${avatarTab === 'upload' ? 'active' : ''}`}
                  onClick={() => setAvatarTab('upload')}
                >
                  📁 Tải ảnh lên
                </button>
              </div>

              {avatarTab === 'animals' ? (
                <div className="animal-avatar-grid">
                  {ANIMAL_AVATARS.map(animal => {
                    const isSelected = guest.avatar === animal.id
                    return (
                      <button
                        key={animal.id}
                        type="button"
                        className={`animal-chip-btn ${isSelected ? 'selected' : ''}`}
                        style={{ background: animal.bg }}
                        onClick={() => setGuest({ ...guest, avatar: animal.id })}
                        title={animal.label}
                      >
                        <span className="animal-emoji">{animal.emoji}</span>
                        <span className="animal-name" style={{ color: animal.color }}>{animal.label.split(' ')[0]}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="avatar-upload-box">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  {guest.avatar && (guest.avatar.startsWith('data:image') || guest.avatar.startsWith('http')) ? (
                    <div className="uploaded-preview-wrap">
                      <img src={guest.avatar} alt="Preview" className="uploaded-preview-img" />
                      <div className="uploaded-preview-actions">
                        <button
                          type="button"
                          className="btn-upload-action"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload size={14} /> Thay đổi ảnh
                        </button>
                        <button
                          type="button"
                          className="btn-upload-action outline"
                          onClick={() => setGuest({ ...guest, avatar: 'fox' })}
                        >
                          Dùng con vật hoạt hình
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="upload-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon size={32} className="upload-icon" />
                      <b>Nhấp để chọn ảnh từ thiết bị</b>
                      <small>Hỗ trợ JPG, PNG, WEBP (Tối đa 2MB)</small>
                    </div>
                  )}
                </div>
              )}
            </div>

            <label>
              Tên hiển thị
              <input
                required
                maxLength={150}
                placeholder="Ví dụ: Nguyễn Văn A hoặc Nhà tuyển dụng"
                value={guest.displayName}
                onChange={e => setGuest({ ...guest, displayName: e.target.value })}
              />
            </label>
            <label>
              Email (để nhận thông báo phản hồi)
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={guest.email}
                onChange={e => setGuest({ ...guest, email: e.target.value })}
              />
            </label>
            <button type="submit" className="identity-submit">
              <Check size={18} />
              <span>Lưu thông tin &amp; Tiếp tục</span>
            </button>
            <small className="identity-privacy-note">Email của bạn được bảo mật tuyệt đối và không hiển thị công khai.</small>
          </form>
        </div>
      )}
    </section>
  )
}
