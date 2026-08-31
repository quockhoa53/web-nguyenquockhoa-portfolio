import { Heart, MessageCircle, Send, UserRound, X, Check, Edit3 } from 'lucide-react'
import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  commentKnowledge,
  commentProject,
  getKnowledgeComments,
  getProjectComments,
  likeKnowledge,
  likeProject,
  registerGuest,
  unlikeKnowledge,
  unlikeProject
} from '../../services/portfolioApi'

export function EngagementPanel({ type, id, initialLikes = 0 }) {
  const api = useMemo(
    () =>
      type === 'knowledge'
        ? {
            comments: getKnowledgeComments,
            comment: commentKnowledge,
            like: likeKnowledge,
            unlike: unlikeKnowledge
          }
        : {
            comments: getProjectComments,
            comment: commentProject,
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
  const [guest, setGuest] = useState({ displayName: '', email: '' })
  const [hasRegistered, setHasRegistered] = useState(false)
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  // Load saved guest info & guest token from localStorage on mount
  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem('portfolio_guest_info')
      const token = localStorage.getItem('portfolio_guest_token')
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo)
        if (parsed.displayName) {
          setGuest(parsed)
          if (token) {
            setHasRegistered(true)
          }
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }, [])

  // Fetch comments
  useEffect(() => {
    if (!id) return
    api
      .comments(id)
      .then(res => {
        const data = res?.data || res
        if (Array.isArray(data)) setComments(data)
      })
      .catch(() => {})
  }, [id, api])

  // Like / Unlike action
  const toggleLike = useCallback(async () => {
    if (isLiking) return
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
      if (err?.status === 401 || !localStorage.getItem('portfolio_guest_token')) {
        setPendingAction('like')
        setIdentity(true)
      } else {
        console.warn('Like error:', err)
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

      setIsSubmitting(true)
      try {
        const result = await api.comment(id, { content: trimmed })
        setContent('')
        setNotice(
          result?.status === 'PENDING'
            ? '✅ Bình luận của bạn đã gửi và đang chờ duyệt.'
            : '✅ Đã đăng bình luận thành công!'
        )
        // Refresh comment list
        api.comments(id).then(res => {
          const data = res?.data || res
          if (Array.isArray(data)) setComments(data)
        }).catch(() => {})
      } catch (err) {
        if (err?.status === 401 || !localStorage.getItem('portfolio_guest_token')) {
          setPendingAction('comment')
          setIdentity(true)
        } else {
          setNotice('❌ Có lỗi xảy ra khi gửi bình luận. Vui lòng thử lại.')
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [api, content, id, isSubmitting]
  )

  // Register Guest Info
  async function register(e) {
    e.preventDefault()
    if (!guest.displayName.trim() || !guest.email.trim()) return

    try {
      const res = await registerGuest(guest)
      const token = res?.token || res?.id
      if (token) {
        localStorage.setItem('portfolio_guest_token', token)
      }
      localStorage.setItem(
        'portfolio_guest_info',
        JSON.stringify({
          displayName: guest.displayName.trim(),
          email: guest.email.trim()
        })
      )
      setHasRegistered(true)
      setIdentity(false)
      setNotice('✅ Đã lưu thông tin khách thành công!')

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
      setNotice('❌ Không thể lưu thông tin. Vui lòng kiểm tra lại địa chỉ email.')
    }
  }

  return (
    <section className="engagement">
      <div className="engagement-head">
        <div>
          <span>COMMUNITY</span>
          <h2>Yêu thích & thảo luận</h2>
        </div>
        <button
          type="button"
          className={`engagement-like-btn ${liked ? 'liked' : ''}`}
          onClick={toggleLike}
          disabled={isLiking}
        >
          <Heart fill={liked ? 'currentColor' : 'none'} size={18} />
          <b>{likes}</b> Yêu thích
        </button>
      </div>

      {hasRegistered && guest.displayName && (
        <div className="guest-identity-bar">
          <span>
            Bình luận với tên: <strong>{guest.displayName}</strong> ({guest.email})
          </span>
          <button
            type="button"
            className="guest-change-btn"
            onClick={() => {
              setPendingAction(null)
              setIdentity(true)
            }}
          >
            <Edit3 size={12} /> Đổi thông tin
          </button>
        </div>
      )}

      <form className="comment-form" onSubmit={submitComment}>
        <div className="comment-avatar">
          {guest.displayName ? (
            <span className="guest-avatar-letter">{guest.displayName.charAt(0).toUpperCase()}</span>
          ) : (
            <UserRound size={19} />
          )}
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

      {notice && <p className="engagement-notice">{notice}</p>}

      <div className="comment-list">
        <h3>
          <MessageCircle size={18} />
          {comments.length} bình luận
        </h3>
        {comments.length === 0 ? (
          <p className="no-comments-msg">Chưa có bình luận được duyệt. Hãy là người đầu tiên chia sẻ!</p>
        ) : (
          comments.map(c => (
            <article key={c.id}>
              <div className="comment-user-avatar">
                {c.displayName ? c.displayName.charAt(0).toUpperCase() : 'U'}
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
          ))
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
              <X size={15} />
            </button>
            <div className="identity-icon">
              <UserRound size={24} />
            </div>
            <h3>Thông tin khách</h3>
            <p>Nhập thông tin một lần để Thả tim & Bình luận trên toàn bộ hệ thống.</p>
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
              <Check size={16} style={{ marginRight: 6 }} /> Lưu thông tin & Tiếp tục
            </button>
            <small>Email của bạn được bảo mật tuyệt đối và không hiển thị công khai.</small>
          </form>
        </div>
      )}
    </section>
  )
}
