import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { ArchitectureViewer } from './ArchitectureViewer'

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

    // Find all mermaid and pre/code blocks
    const nodes = el.querySelectorAll('pre, code, div.architecture-diagram-container')
    const seen = new Set()
    let idxCounter = 0

    nodes.forEach(node => {
      if (seen.has(node) || node.closest('.arch-dynamic-mount-slot')) return

      const text = node.textContent.trim()
      if (!text) return

      const isExplicitMermaid =
        node.classList.contains('mermaid') ||
        node.classList.contains('language-mermaid') ||
        node.classList.contains('architecture-diagram-container')

      // Auto-detect Mermaid flowchart/graph/diagram syntax
      const isAutoMermaid = /^(graph\s+(TD|TB|BT|RL|LR)|flowchart\s+(TD|TB|BT|RL|LR)|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|quadrantChart|journey|gitGraph|architecture-beta)/m.test(text)

      if (isExplicitMermaid || isAutoMermaid) {
        seen.add(node)
        const parentContainer = node.closest('.architecture-diagram-container')
        const title =
          parentContainer?.getAttribute('data-title') ||
          node.getAttribute('data-title') ||
          'Sơ đồ Kiến trúc Hệ thống'
        const description =
          parentContainer?.getAttribute('data-desc') ||
          node.getAttribute('data-desc') ||
          ''

        // Target element to replace
        const mountTarget =
          parentContainer ||
          (node.tagName === 'CODE' && node.parentElement?.tagName === 'PRE' ? node.parentElement : node)

        seen.add(mountTarget)

        const mountDiv = document.createElement('div')
        mountDiv.className = 'arch-dynamic-mount-slot'

        mountTarget.parentNode.insertBefore(mountDiv, mountTarget)
        mountTarget.style.display = 'none'

        idxCounter++
        const root = createRoot(mountDiv)
        root.render(
          <ArchitectureViewer
            key={`arch-diag-${idxCounter}-${Date.now()}`}
            diagramCode={text}
            title={title}
            description={description}
          />
        )
        rootsRef.current.push(root)
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
