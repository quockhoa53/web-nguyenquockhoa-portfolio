export function Section({ id, eyebrow, title, description, children }) {
  return (
    <section id={id} className="section">
      <div className="content-shell">
        {(eyebrow || title) && (
          <header className="section-heading">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
