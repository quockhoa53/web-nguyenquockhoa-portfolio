export function Skeleton({ className = '' }) { return <span aria-hidden="true" className={`skeleton ${className}`} /> }

export function HeroSkeleton() { return <section className="hero skeleton-hero"><div className="content-shell hero-grid"><div><Skeleton className="sk-badge"/><Skeleton className="sk-title"/><Skeleton className="sk-title short"/><Skeleton className="sk-text"/><Skeleton className="sk-text medium"/><div className="skeleton-actions"><Skeleton/><Skeleton/><Skeleton/></div></div><Skeleton className="sk-avatar"/></div></section> }

export function CardsSkeleton({ count = 3 }) { return <div className="card-grid" aria-label="Đang tải dữ liệu">{Array.from({length:count},(_,i)=><article className="skeleton-card" key={i}><Skeleton className="sk-cover"/><div><Skeleton className="sk-small"/><Skeleton className="sk-heading"/><Skeleton className="sk-text"/><Skeleton className="sk-text short"/></div></article>)}</div> }

export function LinesSkeleton({ count = 4 }) { return <div className="lines-skeleton">{Array.from({length:count},(_,i)=><div key={i}><Skeleton className="sk-heading"/><Skeleton className="sk-text"/><Skeleton className="sk-text medium"/></div>)}</div> }

export function SectionError() { return <LinesSkeleton /> }
