import {
  Code2,
  Copy,
  Download,
  Eye,
  Maximize2,
  Minimize2,
  Move,
  RefreshCw,
  Sparkles,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import mermaid from 'mermaid'
import { useCallback, useEffect, useRef, useState } from 'react'

let mermaidInitialized = false

function initMermaid(isDark = false) {
  try {
    mermaid.initialize({
      startOnLoad: false,
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
    const cleanCode = (diagramCode || '').trim()
    if (!cleanCode) {
      setSvgHtml('')
      setError('Chưa có mã sơ đồ Mermaid.')
      return
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

  // Mouse Down handler
  function handleMouseDown(e) {
    if (showSource || error) return
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  // Wheel zoom handler
  function handleWheel(e) {
    if (showSource || error) return
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 0.12 : -0.12
    setScale(prev => Math.min(Math.max(prev + zoomFactor, 0.2), 3.5))
  }

  // Zoom helpers
  function zoomIn() {
    setScale(prev => Math.min(prev + 0.2, 3.5))
  }

  function zoomOut() {
    setScale(prev => Math.max(prev - 0.2, 0.2))
  }

  function resetView() {
    autoFitDiagram()
  }

  // Download SVG
  function downloadSvg() {
    if (!svgHtml) return
    const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'architecture_diagram'}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Copy Mermaid Code
  function copyCode() {
    if (!diagramCode) return
    navigator.clipboard.writeText(diagramCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      ref={containerRef}
      className={`arch-viewer-card ${isFullscreen ? 'fullscreen-mode' : ''} ${className}`}
    >
      {/* Header Bar */}
      <div className="arch-viewer-header">
        <div className="arch-viewer-title-group">
          <div className="arch-badge-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="arch-title">{title}</h4>
            {description && <p className="arch-desc">{description}</p>}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="arch-controls-bar">
          <button
            type="button"
            className={`arch-btn ${showSource ? 'active' : ''}`}
            onClick={() => setShowSource(prev => !prev)}
            title={showSource ? 'Xem giao diện sơ đồ' : 'Xem mã nguồn Mermaid'}
          >
            {showSource ? <Eye size={15} /> : <Code2 size={15} />}
            <span>{showSource ? 'Sơ đồ' : 'Mã nguồn'}</span>
          </button>

          {!showSource && (
            <>
              <div className="arch-btn-divider" />
              <button
                type="button"
                className="arch-btn icon-only"
                onClick={zoomIn}
                title="Phóng to (+)"
              >
                <ZoomIn size={15} />
              </button>
              <button
                type="button"
                className="arch-btn icon-only"
                onClick={zoomOut}
                title="Thu nhỏ (-)"
              >
                <ZoomOut size={15} />
              </button>
              <button
                type="button"
                className="arch-btn icon-only"
                onClick={resetView}
                title="Tự động căn vừa khung nhìn (Fit to screen)"
              >
                <RefreshCw size={14} />
              </button>
              <div className="arch-btn-divider" />
            </>
          )}

          <button
            type="button"
            className="arch-btn icon-only"
            onClick={downloadSvg}
            disabled={!svgHtml || Boolean(error)}
            title="Tải về file SVG chất lượng cao"
          >
            <Download size={15} />
          </button>

          {allowFullscreen && (
            <button
              type="button"
              className="arch-btn icon-only"
              onClick={() => setIsFullscreen(prev => !prev)}
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Xem toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Body */}
      <div
        ref={canvasRef}
        className="arch-canvas-body"
        style={{ height: isFullscreen ? 'calc(100vh - 100px)' : defaultHeight }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {error ? (
          <div className="arch-error-box">
            <b>Không thể hiển thị sơ đồ Mermaid</b>
            <p>{error}</p>
            <button type="button" className="btn primary" onClick={renderDiagram}>
              <RefreshCw size={14} /> Thử tải lại
            </button>
          </div>
        ) : showSource ? (
          <div className="arch-source-view">
            <div className="arch-source-header">
              <span>Cú pháp Mermaid</span>
              <button type="button" className="arch-btn" onClick={copyCode}>
                <Copy size={13} /> {copied ? 'Đã sao chép!' : 'Sao chép mã'}
              </button>
            </div>
            <pre className="arch-code-block">{diagramCode}</pre>
          </div>
        ) : (
          <div
            className={`arch-svg-viewport ${isDragging ? 'is-dragging' : ''}`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center'
            }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        )}

        {/* Floating Pan/Zoom Indicator */}
        {!showSource && !error && (
          <div className="arch-zoom-indicator">
            <Move size={12} />
            <span>Kéo chuột để di chuyển • Cuộn chuột để zoom • {Math.round(scale * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
