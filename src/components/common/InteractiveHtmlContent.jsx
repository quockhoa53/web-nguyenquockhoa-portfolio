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

    // Find all mermaid pre blocks
    const mermaidNodes = el.querySelectorAll('pre.mermaid, code.language-mermaid')
    mermaidNodes.forEach((node, idx) => {
      const diagramCode = node.textContent.trim()
      if (!diagramCode) return

      // Check parent container for custom metadata
      const parentContainer = node.closest('.architecture-diagram-container')
      const title =
        parentContainer?.getAttribute('data-title') ||
        node.getAttribute('data-title') ||
        'Sơ đồ Kiến trúc Hệ thống'
      const description =
        parentContainer?.getAttribute('data-desc') ||
        node.getAttribute('data-desc') ||
        ''

      // Target element to replace or append into
      const mountTarget = parentContainer || node
      const mountDiv = document.createElement('div')
      mountDiv.className = 'arch-dynamic-mount-slot'

      // Replace mountTarget in DOM with mountDiv
      mountTarget.parentNode.insertBefore(mountDiv, mountTarget)
      mountTarget.style.display = 'none'

      const root = createRoot(mountDiv)
      root.render(
        <ArchitectureViewer
          key={`arch-diag-${idx}`}
          diagramCode={diagramCode}
          title={title}
          description={description}
        />
      )
      rootsRef.current.push(root)
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
