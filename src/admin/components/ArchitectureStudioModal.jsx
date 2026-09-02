import {
  ArrowDownUp,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Cloud,
  Code2,
  Copy,
  Cpu,
  Database,
  Eye,
  Globe,
  Layers3,
  Link2,
  Maximize2,
  Network,
  Palette,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Trash2,
  Workflow,
  X,
  Zap
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArchitectureViewer } from '../../components/common/ArchitectureViewer'

// Palette Component Types for Visual Designer
export const COMPONENT_PALETTE = [
  { type: 'client', label: 'Client / Web App', icon: Globe, defaultColor: '#38bdf8', shape: 'rect' },
  { type: 'mobile', label: 'Mobile App', icon: Smartphone, defaultColor: '#38bdf8', shape: 'rect' },
  { type: 'gateway', label: 'API Gateway', icon: Shield, defaultColor: '#6366f1', shape: 'rect' },
  { type: 'service', label: 'Microservice / Backend', icon: Server, defaultColor: '#0ea5e9', shape: 'rect' },
  { type: 'kafka', label: 'Kafka / Message Bus', icon: Network, defaultColor: '#f59e0b', shape: 'rect' },
  { type: 'flink', label: 'Flink / Stream Engine', icon: Zap, defaultColor: '#ec4899', shape: 'rect' },
  { type: 'database', label: 'Database (SQL/NoSQL)', icon: Database, defaultColor: '#10b981', shape: 'cylinder' },
  { type: 'redis', label: 'Redis Cache Cluster', icon: Cpu, defaultColor: '#f43f5e', shape: 'cylinder' },
  { type: 'search', label: 'Elasticsearch / Index', icon: Search, defaultColor: '#8b5cf6', shape: 'cylinder' },
  { type: 'storage', label: 'S3 / Cloud Storage', icon: Cloud, defaultColor: '#06b6d4', shape: 'cylinder' }
]

// 5 Pre-defined Architecture Templates in Visual Graph Format
export const ARCHITECTURE_PRESETS = [
  {
    id: 'microservices-kafka',
    title: '🚀 Microservices & Kafka Event Bus',
    description: 'Kiến trúc hướng sự kiện mở rộng cao với Spring Cloud Gateway, Kafka Cluster và Apache Flink.',
    direction: 'TD',
    nodes: [
      { id: 'client', type: 'client', label: 'Web / Mobile Clients', x: 280, y: 30 },
      { id: 'gateway', type: 'gateway', label: 'Spring Cloud Gateway (8080)', x: 280, y: 120 },
      { id: 'auth_svc', type: 'service', label: 'Auth & User Service', x: 120, y: 220 },
      { id: 'order_svc', type: 'service', label: 'Order Processing Service', x: 280, y: 220 },
      { id: 'product_svc', type: 'service', label: 'Product Catalog Service', x: 440, y: 220 },
      { id: 'kafka', type: 'kafka', label: 'Apache Kafka Cluster (3 Partitions)', x: 280, y: 320 },
      { id: 'flink', type: 'flink', label: 'Apache Flink Streaming Engine', x: 280, y: 420 },
      { id: 'postgres', type: 'database', label: 'PostgreSQL DB Cluster', x: 160, y: 520 },
      { id: 'redis', type: 'redis', label: 'Redis Cache (TTL 10m)', x: 400, y: 520 }
    ],
    edges: [
      { id: 'e1', from: 'client', to: 'gateway', label: 'HTTP / REST' },
      { id: 'e2', from: 'gateway', to: 'auth_svc', label: 'Validate Token' },
      { id: 'e3', from: 'gateway', to: 'order_svc', label: 'POST /orders' },
      { id: 'e4', from: 'gateway', to: 'product_svc', label: 'GET /products' },
      { id: 'e5', from: 'order_svc', to: 'kafka', label: 'Publish OrderCreated' },
      { id: 'e6', from: 'kafka', to: 'flink', label: 'Stream Ingestion' },
      { id: 'e7', from: 'flink', to: 'postgres', label: 'Upsert Realtime Analytics' },
      { id: 'e8', from: 'order_svc', to: 'redis', label: 'Read-Aside Cache', style: 'dotted' }
    ]
  },
  {
    id: 'realtime-cdc-flink',
    title: '🌊 Realtime CDC Pipeline (Flink + Debezium)',
    description: 'Đồng bộ dữ liệu CDC thời gian thực từ cơ sở dữ liệu nguồn sang Search Engine và Data Lake.',
    direction: 'LR',
    nodes: [
      { id: 'source_db', type: 'database', label: 'MySQL Primary (WAL/Binlog)', x: 50, y: 150 },
      { id: 'debezium', type: 'service', label: 'Debezium CDC Connector', x: 200, y: 150 },
      { id: 'kafka_cdc', type: 'kafka', label: 'Kafka: db-changes.orders', x: 360, y: 150 },
      { id: 'flink_cdc', type: 'flink', label: 'Apache Flink Stateful Job', x: 520, y: 150 },
      { id: 'elastic', type: 'search', label: 'Elasticsearch Index', x: 680, y: 60 },
      { id: 'redis_rt', type: 'redis', label: 'Redis Realtime Aggregates', x: 680, y: 150 },
      { id: 's3_lake', type: 'storage', label: 'AWS S3 Parquet Data Lake', x: 680, y: 240 }
    ],
    edges: [
      { id: 'e1', from: 'source_db', to: 'debezium', label: 'Stream Binlog' },
      { id: 'e2', from: 'debezium', to: 'kafka_cdc', label: 'JSON Events' },
      { id: 'e3', from: 'kafka_cdc', to: 'flink_cdc', label: 'Consume' },
      { id: 'e4', from: 'flink_cdc', to: 'elastic', label: 'Sync Search Index' },
      { id: 'e5', from: 'flink_cdc', to: 'redis_rt', label: 'Update Leaderboard' },
      { id: 'e6', from: 'flink_cdc', to: 's3_lake', label: 'Sink Parquet' }
    ]
  },
  {
    id: 'high-concurrency-cache',
    title: '⚡ Multi-Tier Caching (Redis + Caffeine)',
    description: 'Chiến lược caching nhiều tầng chống Cache Stampede và tối ưu RPS cho hệ thống lớn.',
    direction: 'TD',
    nodes: [
      { id: 'users', type: 'client', label: '50,000+ RPS Clients', x: 280, y: 30 },
      { id: 'cdn', type: 'gateway', label: 'Cloudflare CDN Edge Cache', x: 280, y: 120 },
      { id: 'app_cluster', type: 'service', label: 'Spring Boot App Cluster', x: 280, y: 220 },
      { id: 'l1_cache', type: 'redis', label: 'L1: Caffeine In-Memory (TTL 30s)', x: 140, y: 320 },
      { id: 'l2_cache', type: 'redis', label: 'L2: Redis Distributed (TTL 1h)', x: 420, y: 320 },
      { id: 'db_master', type: 'database', label: 'PostgreSQL Master (Write)', x: 180, y: 440 },
      { id: 'db_replica', type: 'database', label: 'PostgreSQL Replica (Read-Only)', x: 380, y: 440 }
    ],
    edges: [
      { id: 'e1', from: 'users', to: 'cdn', label: 'HTTPS Request' },
      { id: 'e2', from: 'cdn', to: 'app_cluster', label: 'Cache Miss' },
      { id: 'e3', from: 'app_cluster', to: 'l1_cache', label: '1. Check Local L1' },
      { id: 'e4', from: 'app_cluster', to: 'l2_cache', label: '2. Check Distributed L2' },
      { id: 'e5', from: 'app_cluster', to: 'db_master', label: 'Write Operations' },
      { id: 'e6', from: 'l2_cache', to: 'db_replica', label: '3. DB Fallback', style: 'dotted' },
      { id: 'e7', from: 'db_master', to: 'db_replica', label: 'Async Replication' }
    ]
  },
  {
    id: 'clean-architecture',
    title: '🏛️ Clean Architecture 3-Tier Layering',
    description: 'Mô hình phân lớp sạch sẽ, tách biệt Core Domain khỏi Controllers và Infrastructure Database.',
    direction: 'TD',
    nodes: [
      { id: 'pres_layer', type: 'gateway', label: 'Presentation: REST Controllers & DTOs', x: 280, y: 40 },
      { id: 'app_usecase', type: 'service', label: 'Application: UseCases & Inbound Ports', x: 280, y: 140 },
      { id: 'core_domain', type: 'service', label: 'Domain: Business Entities & Rules', x: 280, y: 250 },
      { id: 'jpa_infra', type: 'database', label: 'Infra: Spring Data JPA Adapter', x: 140, y: 360 },
      { id: 'kafka_infra', type: 'kafka', label: 'Infra: Kafka Event Publisher', x: 420, y: 360 }
    ],
    edges: [
      { id: 'e1', from: 'pres_layer', to: 'app_usecase', label: 'Invoke UseCase' },
      { id: 'e2', from: 'app_usecase', to: 'core_domain', label: 'Execute Logic' },
      { id: 'e3', from: 'app_usecase', to: 'jpa_infra', label: 'Outbound Port (Save)' },
      { id: 'e4', from: 'app_usecase', to: 'kafka_infra', label: 'Outbound Port (Publish)' }
    ]
  },
  {
    id: 'cqrs-outbox',
    title: '🔄 CQRS & Transactional Outbox Pattern',
    description: 'Đảm bảo tính nhất quán dữ liệu Dual-Write safety giữa Database và Message Broker.',
    direction: 'LR',
    nodes: [
      { id: 'client_cqrs', type: 'client', label: 'Client App', x: 40, y: 150 },
      { id: 'cmd_api', type: 'service', label: 'Command API Service', x: 190, y: 150 },
      { id: 'outbox_table', type: 'database', label: 'Single ACID Tx (Order + Outbox)', x: 360, y: 150 },
      { id: 'debezium_relay', type: 'service', label: 'Debezium Outbox Poller', x: 530, y: 150 },
      { id: 'kafka_bus', type: 'kafka', label: 'Kafka: order-events', x: 690, y: 150 },
      { id: 'query_store', type: 'search', label: 'Read Store (Materialized View)', x: 840, y: 150 }
    ],
    edges: [
      { id: 'e1', from: 'client_cqrs', to: 'cmd_api', label: '1. POST /orders' },
      { id: 'e2', from: 'cmd_api', to: 'outbox_table', label: '2. ACID Commit' },
      { id: 'e3', from: 'outbox_table', to: 'debezium_relay', label: '3. Read Outbox' },
      { id: 'e4', from: 'debezium_relay', to: 'kafka_bus', label: '4. Exactly-Once Publish' },
      { id: 'e5', from: 'kafka_bus', to: 'query_store', label: '5. Sync Read View' }
    ]
  }
]

// Convert Graph Data into Mermaid Flowchart DSL
export function generateMermaidFromGraph(graph) {
  const { direction = 'TD', nodes = [], edges = [] } = graph
  if (!nodes.length) return 'graph TD\n    Start["Chưa có thành phần nào"]'

  const lines = [`graph ${direction}`]

  // Output Nodes
  nodes.forEach(n => {
    const icon = getNodeIconSymbol(n.type)
    const label = `${icon} ${n.label || 'Node'}`.trim()
    if (n.type === 'database' || n.type === 'redis' || n.type === 'search' || n.type === 'storage') {
      lines.push(`    ${n.id}[("${label}")]`)
    } else {
      lines.push(`    ${n.id}["${label}"]`)
    }
  })

  lines.push('')

  // Output Edges
  edges.forEach(e => {
    const edgeLabel = e.label ? `|"${e.label}"|` : ''
    if (e.style === 'dotted') {
      lines.push(`    ${e.from} -.->${edgeLabel} ${e.to}`)
    } else if (e.style === 'bidirectional') {
      lines.push(`    ${e.from} <-->${edgeLabel} ${e.to}`)
    } else {
      lines.push(`    ${e.from} -->${edgeLabel} ${e.to}`)
    }
  })

  lines.push('')

  // Styling Classes
  lines.push('    classDef client fill:#38bdf8,stroke:#0284c7,stroke-width:2px,color:#0f172a,font-weight:bold;')
  lines.push('    classDef gateway fill:#6366f1,stroke:#4338ca,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef service fill:#0ea5e9,stroke:#0369a1,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef kafka fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef flink fill:#ec4899,stroke:#be185d,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef database fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef redis fill:#f43f5e,stroke:#e11d48,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef search fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef storage fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#ffffff,font-weight:bold;')

  // Apply Classes
  const typesMap = {}
  nodes.forEach(n => {
    const t = n.type || 'service'
    if (!typesMap[t]) typesMap[t] = []
    typesMap[t].push(n.id)
  })

  Object.entries(typesMap).forEach(([type, ids]) => {
    if (ids.length > 0) {
      lines.push(`    class ${ids.join(',')} ${type};`)
    }
  })

  return lines.join('\n')
}

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

export function ArchitectureStudioModal({
  isOpen,
  onClose,
  initialCode = '',
  initialTitle = 'Sơ đồ Kiến trúc Hệ thống',
  onInsert
}) {
  const [activeTab, setActiveTab] = useState('visual') // 'visual' | 'code' | 'preview'
  const [title, setTitle] = useState(initialTitle || 'Sơ đồ Kiến trúc Hệ thống')
  const [description, setDescription] = useState('')
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

  // Raw Code State (Synced with Graph or custom edited)
  const [rawCode, setRawCode] = useState(() => generateMermaidFromGraph(ARCHITECTURE_PRESETS[0]))
  const [isRawCodeDirty, setIsRawCodeDirty] = useState(false)

  // Sync Graph -> Raw Code when graph changes
  useEffect(() => {
    if (!isRawCodeDirty) {
      setRawCode(generateMermaidFromGraph(graph))
    }
  }, [graph, isRawCodeDirty])

  if (!isOpen) return null

  // Apply a Preset
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
  }

  // Clear Canvas
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
    }
  }

  // Add Component to Visual Canvas
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

  // Node Click handler
  function handleNodeClick(nodeId) {
    if (isConnecting) {
      if (connectFromNodeId && connectFromNodeId !== nodeId) {
        // Create edge
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
      } else {
        setConnectFromNodeId(nodeId)
      }
    } else {
      setSelectedNodeId(nodeId)
      setSelectedEdgeId(null)
    }
  }

  // Update selected Node Label
  function handleUpdateNodeLabel(newLabel) {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === selectedNodeId ? { ...n, label: newLabel } : n)
    }))
    setIsRawCodeDirty(false)
  }

  // Update selected Node Type
  function handleUpdateNodeType(newType) {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === selectedNodeId ? { ...n, type: newType } : n)
    }))
    setIsRawCodeDirty(false)
  }

  // Delete Selected Node
  function handleDeleteNode(nodeId) {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.from !== nodeId && e.to !== nodeId)
    }))
    setSelectedNodeId(null)
    setIsRawCodeDirty(false)
  }

  // Delete Selected Edge
  function handleDeleteEdge(edgeId) {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== edgeId)
    }))
    setSelectedEdgeId(null)
    setIsRawCodeDirty(false)
  }

  // Update Selected Edge Label
  function handleUpdateEdgeLabel(newLabel) {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.map(e => e.id === selectedEdgeId ? { ...e, label: newLabel } : e)
    }))
    setIsRawCodeDirty(false)
  }

  // Update Selected Edge Style
  function handleUpdateEdgeStyle(style) {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.map(e => e.id === selectedEdgeId ? { ...e, style } : e)
    }))
    setIsRawCodeDirty(false)
  }

  // Toggle Flow Direction (TD vs LR)
  function handleToggleDirection() {
    setGraph(prev => ({
      ...prev,
      direction: prev.direction === 'TD' ? 'LR' : 'TD'
    }))
    setIsRawCodeDirty(false)
  }

  // Insert into Editor
  function handleInsert() {
    if (onInsert) {
      onInsert({
        title,
        description,
        code: rawCode
      })
    }
    onClose()
  }

  // Copy Code
  function copyCode() {
    navigator.clipboard.writeText(rawCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedNode = graph.nodes.find(n => n.id === selectedNodeId)
  const selectedEdge = graph.edges.find(e => e.id === selectedEdgeId)

  return (
    <div className="arch-studio-backdrop">
      <div className="arch-studio-modal visual-mode-modal">
        {/* Top Header Bar */}
        <div className="arch-studio-header">
          <div className="arch-studio-title-wrap">
            <div className="arch-studio-icon">
              <Workflow size={20} />
            </div>
            <div>
              <h3>Visual Architecture Studio IDE</h3>
              <p>Trực tiếp vẽ, nối mũi tên và tự động sinh code Mermaid kiến trúc hệ thống.</p>
            </div>
          </div>

          <div className="arch-studio-header-actions">
            {/* Template Selector Dropdown Button */}
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
                  <div className="templates-menu-header">Mẫu kiến trúc thực chiến chuẩn:</div>
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

            {/* Mode Switcher Tabs */}
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
              className="btn outline-light"
              onClick={copyCode}
              title="Sao chép toàn bộ mã Mermaid"
            >
              <Copy size={14} /> {copied ? 'Đã chép!' : 'Sao chép'}
            </button>

            <button
              type="button"
              className="btn primary"
              onClick={handleInsert}
            >
              <Check size={16} /> Chèn vào nội dung
            </button>

            <button
              type="button"
              className="arch-studio-close-btn"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Studio Meta Bar: Title, Description, Quick Tools */}
        <div className="arch-studio-meta-bar">
          <input
            type="text"
            className="arch-studio-title-field"
            placeholder="Tiêu đề sơ đồ kiến trúc (vd: Luồng xử lý Kafka & Apache Flink)..."
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
              title="Đổi hướng luồng: Dọc (Top-Down) hoặc Ngang (Left-Right)"
            >
              <ArrowDownUp size={13} />
              <span>Hướng: {graph.direction === 'TD' ? 'Dọc (TD)' : 'Ngang (LR)'}</span>
            </button>
            <button
              type="button"
              className="btn-quick-clear"
              onClick={handleClearCanvas}
              title="Xóa làm mới toàn bộ để tự vẽ"
            >
              <Trash2 size={13} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Main Work Area based on Active Tab */}
        <div className="arch-studio-main-body">
          {activeTab === 'visual' && (
            <div className="visual-designer-layout">
              {/* Left Palette: Architecture Component Blocks */}
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

                {/* Arrow Connector Tool Trigger */}
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
                      👉 Hãy bấm vào <b>Node gốc (From)</b> rồi bấm tiếp vào <b>Node đích (To)</b> trên bảng!
                    </small>
                  )}
                </div>
              </div>

              {/* Center Canvas: Interactive Visual Nodes & Edges Manager */}
              <div className="visual-canvas-workspace">
                <div className="canvas-header-strip">
                  <span>
                    ⚡ Có <b>{graph.nodes.length}</b> khối thành phần &amp; <b>{graph.edges.length}</b> liên kết mũi tên.
                  </span>
                  {selectedNode && (
                    <span className="selected-tag">Đang chọn: <b>{selectedNode.label}</b></span>
                  )}
                </div>

                {/* Nodes & Edges Visual Management Grid */}
                <div className="visual-nodes-manager-board">
                  {graph.nodes.length === 0 ? (
                    <div className="canvas-empty-state">
                      <Workflow size={40} className="empty-icon" />
                      <h4>Bảng vẽ đang trống</h4>
                      <p>Hãy chọn 1 khối bên trái hoặc bấm <b>"Xem 5 Mẫu Kiến Trúc"</b> phía trên để bắt đầu vẽ!</p>
                    </div>
                  ) : (
                    <div className="visual-interactive-flow-list">
                      {/* Flow Step Cards */}
                      {graph.nodes.map((node, index) => {
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

                            {/* Connected Outputs */}
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

                {/* Live Realtime Diagram Output at Bottom of Visual Designer */}
                <div className="visual-mini-preview-footer">
                  <div className="mini-preview-head">
                    <span>
                      <Sparkles size={13} /> Sơ đồ tạo tức thì từ giao diện vẽ:
                    </span>
                  </div>
                  <div className="mini-preview-canvas">
                    <ArchitectureViewer
                      diagramCode={rawCode}
                      title={title}
                      allowFullscreen={false}
                      defaultHeight="240px"
                    />
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Selected Item Inspector / Edit Properties */}
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
                        placeholder="Nhập tên khối..."
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
                        placeholder="vd: Publish OrderCreated, SQL Query..."
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
                    <p>Hãy bấm vào 1 khối hoặc 1 mũi tên trên bảng vẽ để đổi tên hoặc thiết lập thuộc tính!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="code-editor-tab-layout">
              <div className="code-editor-left">
                <div className="code-editor-toolbar">
                  <span>Mã Mermaid DSL (Có thể chỉnh sửa thủ công):</span>
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
            <div className="full-preview-tab-layout">
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
    </div>
  )
}
