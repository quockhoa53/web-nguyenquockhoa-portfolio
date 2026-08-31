import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock, Eye, Heart, MessageSquare, Sparkles, Tag } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/common/PageHero'
import { CardsSkeleton, LinesSkeleton } from '../components/common/Skeletons'
import { TiltCard } from '../components/common/TiltCard'
import { EngagementPanel } from '../features/engagement/EngagementPanel'
import { useApiResource } from '../hooks/useApiResource'
import { getKnowledgeArticle, getKnowledgeArticles, getKnowledgeCategories } from '../services/portfolioApi'

export function KnowledgePage() {
  const articlesState = useApiResource(getKnowledgeArticles)
  const categoriesState = useApiResource(getKnowledgeCategories)
  const [selectedCat, setSelectedCat] = useState('ALL')

  const articles = Array.isArray(articlesState.data) ? articlesState.data : []
  const categories = Array.isArray(categoriesState.data) ? categoriesState.data : []

  const filteredArticles = selectedCat === 'ALL'
    ? articles
    : articles.filter(a => a.categorySlug === selectedCat || String(a.categoryId) === String(selectedCat))

  return (
    <main>
      <PageHero
        eyebrow="Tech Notes & Insights"
        title="Kho kiến thức"
        description="Tổng hợp những ghi chép, bài viết chuyên sâu về kiến trúc Backend, tối ưu Database, xử lý dữ liệu và kinh nghiệm thực chiến."
        icon={BookOpen}
        tone="cyan"
        image="/images/projects_3d_cover.png"
      />

      <section className="section">
        <div className="content-shell">
          {/* Category Filter Pills */}
          <div className="filter-pill-bar">
            <button
              className={`filter-btn ${selectedCat === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedCat('ALL')}
            >
              Tất cả bài viết ({articles.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`filter-btn ${selectedCat === c.slug ? 'active' : ''}`}
                onClick={() => setSelectedCat(c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {articlesState.isLoading ? (
            <CardsSkeleton count={6} />
          ) : filteredArticles.length === 0 ? (
            <div className="empty-state-box">
              <BookOpen className="empty-icon" />
              <h3>Chưa có bài viết trong danh mục này</h3>
              <p>Hãy quay lại sau hoặc chọn các danh mục khác.</p>
            </div>
          ) : (
            <div className="knowledge-grid-container">
              {filteredArticles.map((art) => (
                <TiltCard key={art.id} className="modern-knowledge-card reveal">
                  <div className="knowledge-card-top">
                    <span className="category-pill">
                      <Tag style={{ width: 12, height: 12 }} />
                      {art.categoryName || 'Kiến thức'}
                    </span>
                    <span className="date-pill">
                      <Calendar style={{ width: 12, height: 12 }} />
                      {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
                    </span>
                  </div>

                  <h3 className="knowledge-card-title">
                    <Link to={`/knowledge/${art.slug}`}>{art.title}</Link>
                  </h3>

                  <p className="knowledge-card-summary">
                    {art.summary?.replace(/<[^>]*>?/gm, '').slice(0, 130)}…
                  </p>

                  <div className="knowledge-card-footer">
                    <div className="card-metrics">
                      <span>
                        <Eye style={{ width: 14, height: 14 }} /> {art.viewCount || 0}
                      </span>
                      <span>
                        <Heart style={{ width: 14, height: 14 }} /> {art.likeCount || 0}
                      </span>
                    </div>

                    <Link to={`/knowledge/${art.slug}`} className="read-btn">
                      <span>Đọc bài</span>
                      <ArrowRight style={{ width: 14, height: 14 }} />
                    </Link>
                  </div>
                </TiltCard>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export function KnowledgeDetailPage() {
  const { slug } = useParams()
  const state = useApiResource(() => getKnowledgeArticle(slug), slug)

  if (state.isLoading) {
    return (
      <main className="section">
        <div className="content-shell" style={{ maxWidth: '840px' }}>
          <LinesSkeleton count={6} />
        </div>
      </main>
    )
  }

  if (state.error || !state.data) {
    return (
      <main className="section">
        <div className="content-shell empty-state-box">
          <h2>Không tìm thấy bài viết</h2>
          <p>Bài viết này không tồn tại hoặc đã được chuyển sang chế độ bản nháp.</p>
          <Link to="/knowledge" className="btn primary">
            <ArrowLeft /> Quay lại Kho kiến thức
          </Link>
        </div>
      </main>
    )
  }

  const { article, content } = state.data
  const plainText = ((content || article.content) || '').replace(/<[^>]*>?/gm, '')
  const wordsCount = plainText.split(/\s+/).filter(Boolean).length
  const readingTimeMinutes = Math.max(1, Math.ceil(wordsCount / 220))

  return (
    <main className="knowledge-detail-page">
      {/* Knowledge Detail Banner */}
      <section className="detail-hero-banner tone-cyan">
        <div className="hero-banner-mesh" />
        <div className="hero-banner-glow" />

        <div className="content-shell hero-banner-content" style={{ maxWidth: '1020px' }}>
          <div className="hero-top-nav">
            <Link to="/knowledge" className="hero-back-btn">
              <ArrowLeft size={14} /> Quay lại Kho kiến thức
            </Link>
            <span className="hero-category-badge">
              <BookOpen size={14} />
              {article.categoryName || 'Kiến thức chuyên sâu'}
            </span>
          </div>

          <h1 className="hero-main-title">
            {article.title}
          </h1>

          <div className="hero-meta-strip">
            <span className="hero-pill">
              <Calendar size={14} />
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
            </span>
            <span className="hero-pill">
              <Clock size={14} /> ~{readingTimeMinutes} phút đọc
            </span>
            <span className="hero-pill">
              <Eye size={14} /> {article.viewCount || 0} lượt xem
            </span>
            <span className="hero-pill">
              <Heart size={14} /> {article.likeCount || 0} lượt thích
            </span>
          </div>

          {article.summary && (
            <div className="hero-summary-box">
              <p>{article.summary.replace(/<[^>]*>?/gm, '')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Article Content */}
      <section className="section detail-content-section">
        <div className="content-shell" style={{ maxWidth: '1020px' }}>
          <article
            className="prose-card-wide rich-content"
            dangerouslySetInnerHTML={{ __html: content || article.content }}
          />

          {/* Engagement Panel: Likes & Comments */}
          <div className="article-engagement-container">
            <EngagementPanel
              type="knowledge"
              id={article.id}
              initialLikes={article.likeCount}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
