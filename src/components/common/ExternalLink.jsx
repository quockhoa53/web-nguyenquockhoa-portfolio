import { ArrowUpRight } from 'lucide-react'

export function ExternalLink({ url, label }) {
  return (
    <a className="inline-flex items-center gap-1 font-semibold hover:text-accent" href={url} target="_blank" rel="noreferrer">
      {label}<ArrowUpRight size={16} />
    </a>
  )
}
