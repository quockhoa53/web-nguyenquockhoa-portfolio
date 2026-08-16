import { Link } from 'react-router-dom'
export function NotFoundPage(){return <main className="not-found"><span>404</span><h1>Trang không tồn tại</h1><p>Liên kết bạn truy cập có thể đã thay đổi hoặc không còn tồn tại.</p><Link className="btn primary" to="/">Về trang chủ</Link></main>}
