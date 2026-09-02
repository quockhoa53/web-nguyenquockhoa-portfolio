import { useCallback, useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import {
  Code,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Workflow,
  AlertCircle
} from 'lucide-react'

let mermaidInitialized = false

function initMermaid(isDark = false) {
  try {
    mermaid.initialize({
      startOnLoad: false,
      suppressErrorRendering: true, // Suppress injecting error SVGs into document.body
      securityLevel: 'loose',
      theme: isDark ? 'dark' : 'default',
      themeVariables: isDark
        ? {
            darkMode: true,
            background: '#0a0f1d',
            primaryColor: '#6366f1',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#818cf8',
            lineColor: '#38bdf8',
            secondaryColor: '#0284c7',
            tertiaryColor: '#1e293b',
            textColor: '#e2e8f0',
            mainBkg: '#0f172a',
            nodeBorder: '#818cf8',
            clusterBkg: 'rgba(15, 23, 42, 0.75)',
            clusterBorder: 'rgba(255, 255, 255, 0.18)',
            titleColor: '#38bdf8',
            edgeLabelBackground: '#0f172a'
          }
        : {
            darkMode: false,
            background: '#ffffff',
            primaryColor: '#e0f2fe',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#0284c7',
            lineColor: '#0284c7',
            secondaryColor: '#f1f5f9',
            tertiaryColor: '#f8fafc',
            textColor: '#1e293b',
            mainBkg: '#ffffff',
            nodeBorder: '#0284c7',
            clusterBkg: '#f8fafc',
            clusterBorder: '#cbd5e1',
            titleColor: '#0284c7',
            edgeLabelBackground: '#ffffff'
          },
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis'
      }
    })
    mermaidInitialized = true
  } catch (e) {
    console.error('Mermaid init error:', e)
  }
}

export function ArchitectureViewer({
  diagramCode = '',
  title = 'Sơ đồ Kiến trúc Hệ thống',
  description = '',
  allowFullscreen = true,
  defaultHeight = '560px',
  className = ''
}) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  const [svgHtml, setSvgHtml] = useState('')
  const [error, setError] = useState(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  // Track theme changes dynamically
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkTheme(isDark)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    return () => observer.disconnect()
  }, [])

  // Auto-fit diagram inside viewport
  const autoFitDiagram = useCallback(() => {
    if (!canvasRef.current) return
    const container = canvasRef.current
    const svgEl = container.querySelector('svg')
    if (!svgEl) return

    const cWidth = container.clientWidth - 40
    const cHeight = container.clientHeight - 40
    const svgBBox = svgEl.getBBox ? svgEl.getBBox() : { width: 800, height: 500 }
    const sWidth = svgBBox.width || 800
    const sHeight = svgBBox.height || 500

    if (sWidth > 0 && sHeight > 0 && cWidth > 0 && cHeight > 0) {
      const scaleX = cWidth / sWidth
      const scaleY = cHeight / sHeight
      const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.4), 1.1)
      setScale(fitScale)
      setPosition({ x: 0, y: 0 })
    }
  }, [])

  // Render Mermaid Diagram
  const renderDiagram = useCallback(async () => {
    let cleanCode = (diagramCode || '').trim()
    if (!cleanCode) {
      setSvgHtml('')
      setError('Chưa có mã sơ đồ Mermaid.')
      return
    }

    // Auto-fix: if code contains a header declaration further down, strip preceding non-DSL text
    const declMatch = cleanCode.match(/\b(graph\s+(TD|TB|BT|RL|LR)|flowchart\s+(TD|TB|BT|RL|LR)|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|quadrantChart|journey|gitGraph|architecture-beta)\b/i)
    if (declMatch && declMatch.index !== undefined) {
      cleanCode = cleanCode.slice(declMatch.index).trim()
    } else if (!/^(graph\s+(TD|TB|BT|RL|LR)|flowchart\s+(TD|TB|BT|RL|LR)|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|quadrantChart|journey|gitGraph|architecture-beta)/m.test(cleanCode)) {
      cleanCode = 'graph TD\n' + cleanCode
    }

    try {
      initMermaid(isDarkTheme)
      setError(null)
      const safeId = `mermaid_diag_${Math.random().toString(36).substring(2, 9)}`
      
      const { svg } = await mermaid.render(safeId, cleanCode)
      setSvgHtml(svg)
      setTimeout(autoFitDiagram, 80)
    } catch (err) {
      console.warn('Mermaid rendering error:', err)
      setError(err?.message || 'Cú pháp sơ đồ Mermaid chưa hợp lệ.')
    } finally {
      // Purge any orphan error elements that mermaid might have appended to document.body
      document.querySelectorAll('[id^="dmermaid"], [id^="mermaid-"]').forEach(el => {
        if (el.parentNode === document.body) {
          el.remove()
        }
      })
    }
  }, [diagramCode, isDarkTheme, autoFitDiagram])

  useEffect(() => {
    renderDiagram()
  }, [renderDiagram])

  // Global mouse listeners for seamless unconstrained dragging
  useEffect(() => {
    function handleGlobalMouseMove(e) {
      if (!isDragging) return
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }

    function handleGlobalMouseUp() {
      if (isDragging) {
        setIsDragging(false)
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, dragStart])

  function handleMouseDown(e) {
    if (e.button !== 0) return
    if (e.target.closest('.arch-toolbar') || e.target.closest('.arch-source-modal')) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  function handleWheel(e) {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
    setScale(prev => Math.min(Math.max(prev * zoomFactor, 0.3), 3.0))
  }

  function handleZoomIn() {
    setScale(prev => Math.min(prev + 0.15, 3.0))
  }

  function handleZoomOut() {
    setScale(prev => Math.max(prev - 0.15, 0.3))
  }

  function handleReset() {
    autoFitDiagram()
  }

  async function handleCopySource() {
    try {
      await navigator.clipboard.writeText(diagramCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div
      ref={containerRef}
      className={`arch-viewer-wrapper ${isFullscreen ? 'arch-fullscreen' : ''} ${className}`}
      style={{ height: isFullscreen ? '100vh' : defaultHeight }}
    >
      {/* Top Header Bar */}
      <div className="arch-header-bar">
        <div className="arch-header-left">
          <div className="arch-badge">
            <Sparkles size={14} />
            <span>INTERACTIVE ARCHITECTURE</span>
          </div>
          <h3 className="arch-title">{title}</h3>
          {description && <p className="arch-desc">{description}</p>}
        </div>

        <div className="arch-header-right arch-toolbar">
          <button
            type="button"
            className="arch-tool-btn"
            onClick={() => setShowSource(!showSource)}
            title="Xem mã nguồn Mermaid DSL"
          >
            <Code size={15} />
            <span>Mã nguồn</span>
          </button>

          <button
            type="button"
            className="arch-tool-btn"
            onClick={handleZoomIn}
            title="Phóng to"
          >
            <ZoomIn size={15} />
          </button>

          <button
            type="button"
            className="arch-tool-btn"
            onClick={handleZoomOut}
            title="Thu nhỏ"
          >
            <ZoomOut size={15} />
          </button>

          <button
            type="button"
            className="arch-tool-btn"
            onClick={handleReset}
            title="Đặt lại tỷ lệ"
          >
            <RotateCcw size={15} />
          </button>

          {allowFullscreen && (
            <button
              type="button"
              className="arch-tool-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={canvasRef}
        className={`arch-canvas-viewport ${isDragging ? 'is-dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {/* Error State */}
        {error ? (
          <div className="arch-error-box">
            <AlertCircle size={28} />
            <h4>Không thể hiển thị sơ đồ Mermaid</h4>
            <p>{error}</p>
            <button type="button" className="btn-retry" onClick={renderDiagram}>
              <RotateCcw size={14} /> Thử tải lại
            </button>
          </div>
        ) : svgHtml ? (
          <div
            className="arch-svg-container"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center'
            }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <div className="arch-loading-box">
            <Workflow className="animate-spin" size={28} />
            <span>Đang nạp sơ đồ kiến trúc...</span>
          </div>
        )}
      </div>

      {/* Raw Source Code Overlay Modal */}
      {showSource && (
        <div className="arch-source-overlay" onClick={() => setShowSource(false)}>
          <div className="arch-source-card" onClick={e => e.stopPropagation()}>
            <div className="arch-source-header">
              <h4>Mã nguồn Mermaid DSL</h4>
              <div className="arch-source-actions">
                <button
                  type="button"
                  className="btn-copy-code"
                  onClick={handleCopySource}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
                <button
                  type="button"
                  className="btn-close-source"
                  onClick={() => setShowSource(false)}
                >
                  ✕
                </button>
              </div>
            </div>
            <pre className="arch-source-code">{diagramCode}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
