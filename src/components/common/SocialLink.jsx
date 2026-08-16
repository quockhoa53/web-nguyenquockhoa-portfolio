export function SocialLink({ url, label, children }) {
  if (!url) return null

  return (
    <a aria-label={label} className="rounded-xl border border-slate-300 p-3 hover:border-accent hover:text-accent" target="_blank" rel="noreferrer" href={url}>
      {children}
    </a>
  )
}
