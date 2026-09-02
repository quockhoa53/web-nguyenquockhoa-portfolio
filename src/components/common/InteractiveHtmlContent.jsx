import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { ArchitectureViewer } from './ArchitectureViewer'

function isMermaidCode(text) {
  if (!text || typeof text !== 'string') return false
  const trimmed = text.trim()
  if (!trimmed) return false

  // Standard Mermaid diagram declaration header
  if (/^(graph\s+(TD|TB|BT|RL|LR)|flowchart\s+(TD|TB|BT|RL|LR)|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|quadrantChart|journey|gitGraph|architecture-beta|packet-beta)/m.test(trimmed)) {
    return true
  }

  // Fragment of mermaid diagram (e.g. node definitions and connections)
  if (
    (trimmed.includes('-->') || trimmed.includes('-.->') || trimmed.includes('==>')) &&
    (trimmed.includes('["') || trimmed.includes('("') || trimmed.includes('{"') || trimmed.includes('classDef') || trimmed.includes('subgraph'))
  ) {
    return true
  }

  return false
}

function cleanMermaidCode(text) {
  if (!text || typeof text !== 'string') return ''
  let clean = text.trim()

  // 1. Unescape HTML entities
  clean = clean
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // 2. Search for the standard declaration keyword ANYWHERE in the text
  const declMatch = clean.match(/\b(graph\s+(TD|TB|BT|RL|LR)|flowchart\s+(TD|TB|BT|RL|LR)|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|quadrantChart|journey|gitGraph|architecture-beta|packet-beta)\b/i)

  if (declMatch && declMatch.index !== undefined) {
    // Cut out any preceding text/titles (e.g. "🏛️ Sơ đồ Kiến trúc Hệ thống") so we only feed valid Mermaid DSL to Mermaid!
    clean = clean.slice(declMatch.index).trim()
  } else {
    // If no declaration keyword was found, check if it's a list of node definitions/connections
    const lines = clean.split('\n')
    const validLines = []
    let foundStart = false

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue
      if (
        foundStart ||
        trimmedLine.includes('-->') ||
        trimmedLine.includes('-.->') ||
        trimmedLine.includes('==>') ||
        trimmedLine.includes('subgraph') ||
        trimmedLine.includes('classDef') ||
        /^[a-zA-Z0-9_-]+(\[|\(|\{)/.test(trimmedLine)
      ) {
        foundStart = true
        validLines.push(trimmedLine)
      }
    }

    if (validLines.length > 0) {
      clean = 'graph TD\n' + validLines.join('\n')
    }
  }

  return clean
}

function highlightJson(jsonStr) {
  if (!jsonStr) return ''
  let json = jsonStr
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key'
        } else {
          cls = 'json-string'
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean'
      } else if (/null/.test(match)) {
        cls = 'json-null'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

export function InteractiveHtmlContent({ html = '', className = '' }) {
  const containerRef = useRef(null)
  const rootsRef = useRef([])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Clean up previous mounted roots
    rootsRef.current.forEach(r => {
      try {
        r.unmount()
      } catch {
        // ignore unmount errors
      }
    })
    rootsRef.current = []

    const seen = new Set()
    let idxCounter = 0

    // 1. First pass: Handle all explicit architecture containers
    const explicitContainers = el.querySelectorAll('.architecture-diagram-container')
    explicitContainers.forEach(container => {
      if (seen.has(container) || container.closest('.arch-dynamic-mount-slot')) return

      const codeEl = container.querySelector('pre, code')
      const rawText = codeEl ? codeEl.textContent : container.textContent
      const diagramCode = cleanMermaidCode(rawText)

      const title =
        container.getAttribute('data-title') ||
        container.querySelector('h4, h3, h2')?.textContent?.replace(/^[🏛️\s]+/, '') ||
        'Sơ đồ Kiến trúc Hệ thống'

      const description =
        container.getAttribute('data-desc') ||
        container.querySelector('p')?.textContent ||
        ''

      seen.add(container)
      container.querySelectorAll('*').forEach(child => seen.add(child))

      const mountDiv = document.createElement('div')
      mountDiv.className = 'arch-dynamic-mount-slot'

      container.parentNode.insertBefore(mountDiv, container)
      container.style.display = 'none'

      idxCounter++
      const root = createRoot(mountDiv)
      root.render(
        <ArchitectureViewer
          key={`arch-explicit-${idxCounter}-${Date.now()}`}
          diagramCode={diagramCode}
          title={title}
          description={description}
        />
      )
      rootsRef.current.push(root)
    })

    // 2. Second pass: Handle any standalone pre, code, p, or div blocks with mermaid code
    const standaloneNodes = el.querySelectorAll('pre, code, p, div')
    standaloneNodes.forEach(node => {
      if (seen.has(node) || node.closest('.arch-dynamic-mount-slot') || node.closest('.architecture-diagram-container')) return

      const text = node.textContent.trim()
      if (!text) return

      const isExplicitClass = node.classList.contains('mermaid') || node.classList.contains('language-mermaid')
      const isAuto = isMermaidCode(text)

      if (isExplicitClass || isAuto) {
        seen.add(node)
        node.querySelectorAll('*').forEach(child => seen.add(child))

        const diagramCode = cleanMermaidCode(text)
        const title = node.getAttribute('data-title') || 'Sơ đồ Kiến trúc Hệ thống'
        const description = node.getAttribute('data-desc') || ''

        const mountTarget = (node.tagName === 'CODE' && node.parentElement?.tagName === 'PRE')
          ? node.parentElement
          : node

        seen.add(mountTarget)

        const mountDiv = document.createElement('div')
        mountDiv.className = 'arch-dynamic-mount-slot'

        mountTarget.parentNode.insertBefore(mountDiv, mountTarget)
        mountTarget.style.display = 'none'

        idxCounter++
        const root = createRoot(mountDiv)
        root.render(
          <ArchitectureViewer
            key={`arch-auto-${idxCounter}-${Date.now()}`}
            diagramCode={diagramCode}
            title={title}
            description={description}
          />
        )
        rootsRef.current.push(root)
      }
    })

    // 3. Third pass: Format & Syntax-Highlight JSON blocks
    const preNodes = el.querySelectorAll('pre')
    preNodes.forEach(pre => {
      if (seen.has(pre) || pre.classList.contains('mermaid') || pre.closest('.arch-dynamic-mount-slot')) return

      const text = pre.textContent.trim()
      const isJsonExplicit = pre.classList.contains('language-json') || pre.getAttribute('data-lang') === 'json'
      const isJsonCandidate = (text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))

      if (isJsonExplicit || isJsonCandidate) {
        try {
          const parsed = JSON.parse(text)
          const formatted = JSON.stringify(parsed, null, 2)
          const highlighted = highlightJson(formatted)

          pre.classList.add('language-json', 'formatted-json-block')
          pre.setAttribute('data-lang', 'json')
          pre.innerHTML = `<code class="language-json">${highlighted}</code>`
          seen.add(pre)
        } catch {
          // Not valid JSON, keep original
        }
      }
    })

    return () => {
      rootsRef.current.forEach(r => {
        try {
          r.unmount()
        } catch {
          // ignore
        }
      })
      rootsRef.current = []
    }
  }, [html])

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
