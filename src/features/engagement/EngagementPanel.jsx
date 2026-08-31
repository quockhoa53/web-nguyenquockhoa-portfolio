import { Heart, MessageCircle, Send, UserRound, X, Check, Edit3 } from 'lucide-react'
import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  commentKnowledge,
  commentProject,
  getKnowledgeComments,
  getProjectComments,
  getKnowledgeLikeStatus,
  getProjectLikeStatus,
  likeKnowledge,
  likeProject,
  registerGuest,
  unlikeKnowledge,
  unlikeProject
} from '../../services/portfolioApi'
import { useToast } from '../../components/common/ToastContext'

export function EngagementPanel({ type, id, initialLikes = 0 }) {
  const toast = useToast()

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
  const [guest, setGuest] = useState({ displayName: '', email: '' })
  const [hasRegistered, setHasRegistered] = useState(false)
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
        if (result.liked) {
          toast.success('Đã thả tim thành công! ❤️')
        } else {
          toast.info('Đã bỏ yêu thích.')
        }
      }
    } catch (err) {
      if (err?.status === 401) {
        setPendingAction('like')
        setIdentity(true)
      } else {
        toast.error('Không thể thực hiện thao tác. Vui lòng thử lại.')
      }
    } finally {
      setIsLiking(false)
    }
  }, [api, id, liked, isLiking, toast])

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
            return [...prev, result]
          })
        }
        toast.success('Bình luận của bạn đã được đăng thành công!')
      } catch (err) {
        if (err?.status === 401) {
          setPendingAction('comment')
          setIdentity(true)
        } else {
          toast.error('Có lỗi xảy ra khi gửi bình luận. Vui lòng thử lại.')
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [api, content, id, isSubmitting, toast]
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
      toast.success('Đã lưu thông tin khách thành công!')

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
      toast.error('Không thể lưu thông tin. Vui lòng kiểm tra lại địa chỉ email.')
    }
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

      <div className="comment-list">
        <h3>
          <MessageCircle size={18} />
          {comments.length} bình luận
        </h3>
        {comments.length === 0 ? (
          <p className="no-comments-msg">Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!</p>
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
            <p>Nhập thông tin một lần để Thả tim &amp; Bình luận trên toàn bộ hệ thống.</p>
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
            <small>Email của bạn được bảo mật tuyệt đối và không hiển thị công khai.</small>
          </form>
        </div>
      )}
    </section>
  )
}
