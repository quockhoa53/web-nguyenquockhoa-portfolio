import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, Clock } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/common/PageHero'
import { allArticles, knowledgeGroups } from '../data/content'

export function KnowledgePage() {
  const [open, setOpen] = useState(0)
  return <main><PageHero eyebrow="Knowledge base" title="Kho kiến thức" description="Những ghi chú thực tế tôi tích lũy trong quá trình học tập và làm việc." tone="cyan"/><section className="section"><div className="content-shell knowledge-shell">{knowledgeGroups.map((group,index)=><article className={`accordion ${open===index?'open':''}`} key={group.name}><button onClick={()=>setOpen(open===index?-1:index)}><span className="number">0{index+1}</span><span><b>{group.name}</b><small>{group.articles.length} bài viết</small></span><ChevronDown/></button><div className="accordion-body">{group.articles.map(a=><Link to={`/knowledge/${a.slug}`} key={a.slug}><BookOpen/><span><b>{a.title}</b><small>{a.summary}</small></span><ArrowRight/></Link>)}</div></article>)}</div></section></main>
}

export function KnowledgeDetailPage() {
  const { slug } = useParams(); const article = allArticles.find(a=>a.slug===slug)
  if (!article) return <main className="section"><div className="content-shell"><h1>Không tìm thấy bài viết</h1></div></main>
  return <main><section className="article-hero"><div className="article-shell"><Link to="/knowledge" className="back-link"><ArrowLeft/>Kho kiến thức</Link><div className="tag-row">{article.tags.map(t=><span key={t}>{t}</span>)}</div><h1>{article.title}</h1><p>{article.summary}</p><small><Clock/>6 phút đọc · Cập nhật 2026</small></div></section><section className="section"><article className="article-shell article-content"><h2>Giới thiệu</h2><p>Đây là ghi chú tổng hợp từ quá trình học và áp dụng vào dự án thực tế. Nội dung tập trung vào quyết định kỹ thuật, trade-off và cách triển khai có thể duy trì lâu dài.</p><h2>Nguyên tắc cốt lõi</h2><p>Luôn bắt đầu từ bài toán nghiệp vụ, xác định ranh giới trách nhiệm và chỉ chọn công nghệ sau khi hiểu rõ yêu cầu. Một giải pháp tốt cần dễ đọc, dễ kiểm thử và có khả năng quan sát khi vận hành.</p><blockquote>Code tốt không chỉ chạy đúng, mà còn giúp người tiếp theo hiểu được ý định thiết kế.</blockquote><h2>Checklist áp dụng</h2><ul><li>Đầu vào được validate tại boundary.</li><li>Business rule không phụ thuộc framework.</li><li>Lỗi có mã và thông báo nhất quán.</li><li>Có log, metric và test cho luồng quan trọng.</li></ul><h2>Kết luận</h2><p>Không có kiến trúc hoàn hảo cho mọi dự án. Hãy ưu tiên cấu trúc đơn giản nhất đáp ứng đúng quy mô hiện tại và vẫn cho phép thay đổi có kiểm soát.</p></article></section></main>
}
