import {
  ArrowDownUp,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Eye,
  FolderPlus,
  Layers3,
  Link2,
  Palette,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Workflow,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArchitectureViewer } from '../components/common/ArchitectureViewer'
import { useToast } from '../components/common/ToastContext'
import {
  ARCHITECTURE_PRESETS,
  COMPONENT_PALETTE,
  generateMermaidFromGraph
} from './components/ArchitectureStudioModal'

export function AdminArchitecturePage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('visual') // 'visual' | 'code' | 'preview'
  const [title, setTitle] = useState('Sơ đồ Kiến trúc Hệ thống')
  const [description, setDescription] = useState('Kiến trúc hướng sự kiện mở rộng cao với Spring Cloud Gateway, Kafka Cluster và Apache Flink.')
  const [templatesDropdownOpen, setTemplatesDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Visual Graph State
  const [graph, setGraph] = useState(() => ({
    direction: ARCHITECTURE_PRESETS[0].direction,
    nodes: JSON.parse(JSON.stringify(ARCHITECTURE_PRESETS[0].nodes)),
    edges: JSON.parse(JSON.stringify(ARCHITECTURE_PRESETS[0].edges))
  }))

  // Selected Elements for Interaction
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectFromNodeId, setConnectFromNodeId] = useState(null)

  // Raw Code State
  const [rawCode, setRawCode] = useState(() => generateMermaidFromGraph(ARCHITECTURE_PRESETS[0]))
  const [isRawCodeDirty, setIsRawCodeDirty] = useState(false)

  // Sync Graph -> Raw Code
  useEffect(() => {
    if (!isRawCodeDirty) {
      setRawCode(generateMermaidFromGraph(graph))
    }
  }, [graph, isRawCodeDirty])

  function getNodeIconSymbol(type) {
    switch (type) {
      case 'client': return '🌐'
      case 'mobile': return '📱'
      case 'gateway': return '🛡️'
      case 'service': return '⚡'
      case 'kafka': return '🚀'
      case 'flink': return '🌊'
      case 'database': return '🐘'
      case 'redis': return '⚡'
      case 'search': return '🔍'
      case 'storage': return '🪣'
      default: return '📦'
    }
  }

  function handleSelectPreset(preset) {
    setTitle(preset.title.replace(/^[^\s]+\s/, ''))
    setDescription(preset.description)
    setGraph({
      direction: preset.direction,
      nodes: JSON.parse(JSON.stringify(preset.nodes)),
      edges: JSON.parse(JSON.stringify(preset.edges))
    })
    setIsRawCodeDirty(false)
    setTemplatesDropdownOpen(false)
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
    setIsConnecting(false)
    toast.success(`Đã nạp mẫu kiến trúc "${preset.title}"`)
  }

  function handleClearCanvas() {
    if (window.confirm('Bạn có chắc muốn làm mới toàn bộ sơ đồ để tự vẽ lại từ đầu?')) {
      setGraph({
        direction: 'TD',
        nodes: [],
        edges: []
      })
      setIsRawCodeDirty(false)
      setSelectedNodeId(null)
      setSelectedEdgeId(null)
      toast.info('Đã làm mới bảng vẽ!')
    }
  }

  function handleAddComponent(paletteItem) {
    const newId = `${paletteItem.type}_${Date.now().toString(36).slice(-4)}`
    const newNode = {
      id: newId,
      type: paletteItem.type,
      label: paletteItem.label,
      x: 150 + Math.random() * 200,
      y: 100 + Math.random() * 200
    }

    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))
    setSelectedNodeId(newId)
    setIsRawCodeDirty(false)
  }

  function handleNodeClick(nodeId) {
    if (isConnecting) {
      if (connectFromNodeId && connectFromNodeId !== nodeId) {
        const newEdge = {
          id: `edge_${Date.now().toString(36).slice(-4)}`,
          from: connectFromNodeId,
          to: nodeId,
          label: 'Data Flow'
        }
        setGraph(prev => ({
          ...prev,
          edges: [...prev.edges, newEdge]
        }))
        setIsConnecting(false)
        setConnectFromNodeId(null)
        setSelectedEdgeId(newEdge.id)
        setIsRawCodeDirty(false)
        toast.success('Đã nối mũi tên thành công!')
      } else {
        setConnectFromNodeId(nodeId)
      }
    } else {
      setSelectedNodeId(nodeId)
      setSelectedEdgeId(null)
    }
  }

  function handleUpdateNodeLabel(newLabel) {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === selectedNodeId ? { ...n, label: newLabel } : n)
    }))
    setIsRawCodeDirty(false)
  }

  function handleUpdateNodeType(newType) {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === selectedNodeId ? { ...n, type: newType } : n)
    }))
    setIsRawCodeDirty(false)
  }

  function handleDeleteNode(nodeId) {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.from !== nodeId && e.to !== nodeId)
    }))
    setSelectedNodeId(null)
    setIsRawCodeDirty(false)
  }

  function handleDeleteEdge(edgeId) {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== edgeId)
    }))
    setSelectedEdgeId(null)
    setIsRawCodeDirty(false)
  }

  function handleUpdateEdgeLabel(newLabel) {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.map(e => e.id === selectedEdgeId ? { ...e, label: newLabel } : e)
    }))
    setIsRawCodeDirty(false)
  }

  function handleUpdateEdgeStyle(style) {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.map(e => e.id === selectedEdgeId ? { ...e, style } : e)
    }))
    setIsRawCodeDirty(false)
  }

  function handleToggleDirection() {
    setGraph(prev => ({
      ...prev,
      direction: prev.direction === 'TD' ? 'LR' : 'TD'
    }))
    setIsRawCodeDirty(false)
  }

  function copyCode() {
    navigator.clipboard.writeText(rawCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Đã sao chép mã sơ đồ Mermaid vào Clipboard!')
  }

  function handleCreateProjectWithDiagram() {
    const htmlToInsert = `
<div class="architecture-diagram-container" data-title="${title}" data-desc="${description}">
  <h4 style="color:#0284c7; margin: 18px 0 8px; font-weight: 800;">🏛️ ${title}</h4>
  ${description ? `<p style="color:#64748b; font-size:14px; margin-bottom:12px;">${description}</p>` : ''}
  <pre class="mermaid">${rawCode}</pre>
</div>
`
    navigator.clipboard.writeText(htmlToInsert)
    toast.success('Đã sao chép khối sơ đồ kiến trúc! Đang chuyển sang Quản lý Dự Án...')
    setTimeout(() => {
      navigate('/admin/projects')
    }, 800)
  }

  const selectedNode = graph.nodes.find(n => n.id === selectedNodeId)
  const selectedEdge = graph.edges.find(e => e.id === selectedEdgeId)

  return (
    <div className="admin-page-container admin-architecture-fullscreen-page">
      {/* Page Header */}
      <div className="admin-header-row arch-page-header">
        <div className="admin-title-group">
          <div className="arch-page-icon-glow">
            <Workflow size={24} />
          </div>
          <div>
            <h2>Architecture Studio IDE</h2>
            <p>Trình thiết kế và trực quan hóa sơ đồ kiến trúc hệ thống chuyên nghiệp.</p>
          </div>
        </div>

        <div className="admin-header-actions">
          {/* Template Dropdown */}
          <div className="arch-template-dropdown-wrap">
            <button
              type="button"
              className="btn-dropdown-trigger"
              onClick={() => setTemplatesDropdownOpen(prev => !prev)}
            >
              <BookOpen size={14} />
              <span>📚 Xem 5 Mẫu Kiến Trúc</span>
              <ChevronDown size={14} />
            </button>

            {templatesDropdownOpen && (
              <div className="arch-templates-menu">
                <div className="templates-menu-header">Chọn mẫu kiến trúc chuẩn:</div>
                {ARCHITECTURE_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    className="template-menu-item"
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <b>{preset.title}</b>
                    <small>{preset.description}</small>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="arch-mode-switcher">
            <button
              type="button"
              className={`mode-btn ${activeTab === 'visual' ? 'active' : ''}`}
              onClick={() => setActiveTab('visual')}
            >
              <Palette size={14} /> Vẽ Trực Quan
            </button>
            <button
              type="button"
              className={`mode-btn ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <Code2 size={14} /> Soạn Code
            </button>
            <button
              type="button"
              className={`mode-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <Eye size={14} /> Xem Toàn Cảnh
            </button>
          </div>

          <button
            type="button"
            className="admin-btn-secondary"
            onClick={copyCode}
          >
            <Copy size={14} /> {copied ? 'Đã sao chép!' : 'Sao chép mã'}
          </button>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleCreateProjectWithDiagram}
          >
            <FolderPlus size={16} /> Chèn Vào Dự Án
          </button>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="arch-studio-meta-bar" style={{ borderRadius: 16, marginBottom: 16 }}>
        <input
          type="text"
          className="arch-studio-title-field"
          placeholder="Tiêu đề sơ đồ kiến trúc..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          className="arch-studio-desc-field"
          placeholder="Mô tả kỹ thuật tóm tắt..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <div className="arch-meta-quick-actions">
          <button
            type="button"
            className="btn-quick-toggle"
            onClick={handleToggleDirection}
          >
            <ArrowDownUp size={13} />
            <span>Hướng: {graph.direction === 'TD' ? 'Dọc (TD)' : 'Ngang (LR)'}</span>
          </button>
          <button
            type="button"
            className="btn-quick-clear"
            onClick={handleClearCanvas}
          >
            <Trash2 size={13} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="arch-page-main-workspace" style={{ height: 'calc(100vh - 270px)', minHeight: 650 }}>
        {activeTab === 'visual' && (
          <div className="visual-designer-layout" style={{ borderRadius: 18, border: '1px solid var(--border, #e2e8f0)', overflow: 'hidden' }}>
            {/* Left Palette */}
            <div className="visual-palette-sidebar">
              <span className="palette-title">
                <Layers3 size={14} /> Khối Thành Phần
              </span>
              <p className="palette-sub">Bấm để thêm khối vào sơ đồ:</p>

              <div className="palette-grid">
                {COMPONENT_PALETTE.map(item => {
                  const IconCmp = item.icon
                  return (
                    <button
                      key={item.type}
                      type="button"
                      className="palette-item-btn"
                      onClick={() => handleAddComponent(item)}
                    >
                      <div className="palette-icon-box" style={{ color: item.defaultColor }}>
                        <IconCmp size={16} />
                      </div>
                      <span className="palette-label">{item.label}</span>
                      <Plus size={13} className="palette-add-plus" />
                    </button>
                  )
                })}
              </div>

              {/* Connector Tool */}
              <div className="palette-connector-box">
                <span className="palette-title">
                  <Link2 size={14} /> Nối Mũi Tên (Connect)
                </span>
                <button
                  type="button"
                  className={`btn-connect-tool ${isConnecting ? 'active' : ''}`}
                  onClick={() => {
                    setIsConnecting(prev => !prev)
                    setConnectFromNodeId(null)
                  }}
                >
                  <ArrowRight size={15} />
                  <span>{isConnecting ? 'Đang chọn 2 node...' : 'Bật chế độ nối dây'}</span>
                </button>
                {isConnecting && (
                  <small className="connect-guide-tip">
                    👉 Hãy bấm vào <b>Node gốc (From)</b> rồi bấm tiếp vào <b>Node đích (To)</b>!
                  </small>
                )}
              </div>
            </div>

            {/* Center Canvas */}
            <div className="visual-canvas-workspace">
              <div className="canvas-header-strip">
                <span>
                  ⚡ Có <b>{graph.nodes.length}</b> khối &amp; <b>{graph.edges.length}</b> liên kết mũi tên.
                </span>
                {selectedNode && (
                  <span className="selected-tag">Đang chọn: <b>{selectedNode.label}</b></span>
                )}
              </div>

              <div className="visual-nodes-manager-board">
                {graph.nodes.length === 0 ? (
                  <div className="canvas-empty-state">
                    <Workflow size={44} className="empty-icon" />
                    <h4>Bảng vẽ đang trống</h4>
                    <p>Hãy chọn khối bên trái hoặc bấm <b>"Xem 5 Mẫu Kiến Trúc"</b> để bắt đầu vẽ!</p>
                  </div>
                ) : (
                  <div className="visual-interactive-flow-list">
                    {graph.nodes.map((node) => {
                      const isSelected = selectedNodeId === node.id
                      const isSourceConnect = connectFromNodeId === node.id
                      const connectedEdges = graph.edges.filter(e => e.from === node.id)

                      return (
                        <div
                          key={node.id}
                          className={`visual-node-card ${isSelected ? 'selected' : ''} ${isSourceConnect ? 'connecting-source' : ''}`}
                          onClick={() => handleNodeClick(node.id)}
                        >
                          <div className="node-card-top">
                            <span className="node-icon-badge">{getNodeIconSymbol(node.type)}</span>
                            <div className="node-title-wrap">
                              <b>{node.label}</b>
                              <small>ID: {node.id} ({node.type})</small>
                            </div>
                            <button
                              type="button"
                              className="node-del-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteNode(node.id)
                              }}
                              title="Xóa khối này"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {connectedEdges.length > 0 && (
                            <div className="node-outgoing-edges">
                              {connectedEdges.map(edge => {
                                const targetNode = graph.nodes.find(n => n.id === edge.to)
                                const isEdgeSelected = selectedEdgeId === edge.id
                                return (
                                  <div
                                    key={edge.id}
                                    className={`edge-pill-tag ${isEdgeSelected ? 'selected' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedEdgeId(edge.id)
                                      setSelectedNodeId(null)
                                    }}
                                  >
                                    <ArrowRight size={12} />
                                    <span>{edge.label || 'nối tới'} ➔ <b>{targetNode?.label || edge.to}</b></span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Realtime Interactive Diagram Live Output */}
              <div className="visual-mini-preview-footer">
                <div className="mini-preview-head">
                  <span>
                    <Sparkles size={13} /> Sơ đồ tạo tức thì (Có thể kéo chuột để di chuyển &amp; cuộn để zoom):
                  </span>
                </div>
                <div className="mini-preview-canvas" style={{ height: 260 }}>
                  <ArchitectureViewer
                    diagramCode={rawCode}
                    title={title}
                    allowFullscreen={false}
                    defaultHeight="260px"
                  />
                </div>
              </div>
            </div>

            {/* Right Inspector */}
            <div className="visual-inspector-sidebar">
              <span className="inspector-title">
                <Palette size={14} /> Thuộc Tính Chỉnh Sửa
              </span>

              {selectedNode ? (
                <div className="inspector-form">
                  <label>
                    <span>Tên hiển thị khối:</span>
                    <input
                      type="text"
                      value={selectedNode.label}
                      onChange={e => handleUpdateNodeLabel(e.target.value)}
                    />
                  </label>

                  <label>
                    <span>Loại thành phần:</span>
                    <select
                      value={selectedNode.type}
                      onChange={e => handleUpdateNodeType(e.target.value)}
                    >
                      {COMPONENT_PALETTE.map(p => (
                        <option key={p.type} value={p.type}>{p.label}</option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    className="btn-danger-del"
                    onClick={() => handleDeleteNode(selectedNode.id)}
                  >
                    <Trash2 size={14} /> Xóa khối này
                  </button>
                </div>
              ) : selectedEdge ? (
                <div className="inspector-form">
                  <label>
                    <span>Nhãn luồng dữ liệu (Arrow Label):</span>
                    <input
                      type="text"
                      value={selectedEdge.label || ''}
                      onChange={e => handleUpdateEdgeLabel(e.target.value)}
                    />
                  </label>

                  <label>
                    <span>Kiểu mũi tên:</span>
                    <select
                      value={selectedEdge.style || 'solid'}
                      onChange={e => handleUpdateEdgeStyle(e.target.value)}
                    >
                      <option value="solid">Mũi tên liền (Solid ---&gt;)</option>
                      <option value="dotted">Mũi tên nét đứt (Dotted -.-&gt;)</option>
                      <option value="bidirectional">Hai chiều (&lt;---&gt;)</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    className="btn-danger-del"
                    onClick={() => handleDeleteEdge(selectedEdge.id)}
                  >
                    <Trash2 size={14} /> Xóa mũi tên này
                  </button>
                </div>
              ) : (
                <div className="inspector-placeholder">
                  <p>Bấm vào 1 khối hoặc 1 mũi tên trên bảng vẽ để đổi tên hoặc thiết lập thuộc tính!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-editor-tab-layout" style={{ borderRadius: 18, border: '1px solid var(--border, #e2e8f0)', overflow: 'hidden' }}>
            <div className="code-editor-left">
              <div className="code-editor-toolbar">
                <span>Mã Mermaid DSL:</span>
                <button type="button" className="btn outline-light" onClick={copyCode}>
                  <Copy size={13} /> {copied ? 'Đã sao chép' : 'Sao chép'}
                </button>
              </div>
              <textarea
                className="arch-code-textarea full"
                value={rawCode}
                onChange={e => {
                  setRawCode(e.target.value)
                  setIsRawCodeDirty(true)
                }}
                spellCheck="false"
              />
            </div>
            <div className="code-editor-right">
              <ArchitectureViewer
                diagramCode={rawCode}
                title={title}
                description={description}
                defaultHeight="100%"
                allowFullscreen={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="full-preview-tab-layout" style={{ borderRadius: 18, border: '1px solid var(--border, #e2e8f0)', overflow: 'hidden' }}>
            <ArchitectureViewer
              diagramCode={rawCode}
              title={title}
              description={description}
              defaultHeight="100%"
              allowFullscreen={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}
