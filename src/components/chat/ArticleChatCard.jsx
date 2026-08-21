import { memo } from 'react'
import { BookOpen, ArrowRight, Tag, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export const ArticleChatCard = memo(function ArticleChatCard({ article, onNavigate }) {
  if (!article) return null

  const slug = article.slug
  const detailUrl = `/knowledge/${slug}`

  const categoryName = article.categoryName || article.category_name || (typeof article.category === 'string' ? article.category : article.category?.name) || 'Kiến thức'

  const plainSummary = article.summary || (article.content ? article.content.replace(/<[^>]*>?/gm, '') : '')
  const displaySummary = plainSummary.length > 130 ? plainSummary.substring(0, 130) + '...' : plainSummary

  return (
    <div className="chat-generative-card chat-article-card">
      <div className="chat-card-header">
        <div className="chat-card-badge-row">
          <span className="chat-card-type-badge article-badge">
            <BookOpen size={12} /> BÀI VIẾT
          </span>
          {categoryName && (
            <span className="chat-card-category-badge">
              <Tag size={11} /> {categoryName}
            </span>
          )}
        </div>
        <h4 className="chat-card-title">{article.title}</h4>
      </div>

      {displaySummary && (
        <p className="chat-card-desc">{displaySummary}</p>
      )}

      <div className="chat-card-actions">
        <Link
          to={detailUrl}
          className="chat-card-btn btn-primary"
          onClick={() => onNavigate && onNavigate()}
        >
          <span>Đọc bài viết</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
})
