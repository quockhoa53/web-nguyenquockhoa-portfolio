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
import { useEffect, useState } from 'react'
import { ArchitectureViewer } from '../../components/common/ArchitectureViewer'

// Palette Component Types for Visual Designer
export const COMPONENT_PALETTE = [
  { type: 'client', label: 'Client / Web App', icon: Globe, defaultColor: '#38bdf8' },
  { type: 'mobile', label: 'Mobile App', icon: Smartphone, defaultColor: '#38bdf8' },
  { type: 'gateway', label: 'API Gateway', icon: Shield, defaultColor: '#6366f1' },
  { type: 'service', label: 'Microservice / Backend', icon: Server, defaultColor: '#0ea5e9' },
  { type: 'kafka', label: 'Kafka / Message Bus', icon: Network, defaultColor: '#f59e0b' },
  { type: 'flink', label: 'Flink / Stream Engine', icon: Zap, defaultColor: '#ec4899' },
  { type: 'database', label: 'Database (SQL/NoSQL)', icon: Database, defaultColor: '#10b981' },
  { type: 'redis', label: 'Redis Cache Cluster', icon: Cpu, defaultColor: '#f43f5e' },
  { type: 'search', label: 'Elasticsearch / Index', icon: Search, defaultColor: '#8b5cf6' },
  { type: 'storage', label: 'S3 / Cloud Storage', icon: Cloud, defaultColor: '#06b6d4' }
]

// 5 Pre-defined Architecture Templates in Visual Graph Format
export const ARCHITECTURE_PRESETS = [
  {
    id: 'microservices-kafka',
    title: '🚀 Microservices & Kafka Event Bus',
    description: 'Kiến trúc hướng sự kiện mở rộng cao với Spring Cloud Gateway, Kafka Cluster và Apache Flink.',
    direction: 'TD',
    nodes: [
      { id: 'client_node', type: 'client', label: 'Web / Mobile Clients' },
      { id: 'gateway_node', type: 'gateway', label: 'Spring Cloud Gateway (8080)' },
      { id: 'auth_svc', type: 'service', label: 'Auth & User Service' },
      { id: 'order_svc', type: 'service', label: 'Order Processing Service' },
      { id: 'product_svc', type: 'service', label: 'Product Catalog Service' },
      { id: 'kafka_node', type: 'kafka', label: 'Apache Kafka Cluster (3 Partitions)' },
      { id: 'flink_node', type: 'flink', label: 'Apache Flink Streaming Engine' },
      { id: 'postgres_node', type: 'database', label: 'PostgreSQL DB Cluster' },
      { id: 'redis_node', type: 'redis', label: 'Redis Cache (TTL 10m)' }
    ],
    edges: [
      { id: 'e1', from: 'client_node', to: 'gateway_node', label: 'HTTP / REST' },
      { id: 'e2', from: 'gateway_node', to: 'auth_svc', label: 'Validate Token' },
      { id: 'e3', from: 'gateway_node', to: 'order_svc', label: 'POST /orders' },
      { id: 'e4', from: 'gateway_node', to: 'product_svc', label: 'GET /products' },
      { id: 'e5', from: 'order_svc', to: 'kafka_node', label: 'Publish OrderCreated' },
      { id: 'e6', from: 'kafka_node', to: 'flink_node', label: 'Stream Ingestion' },
      { id: 'e7', from: 'flink_node', to: 'postgres_node', label: 'Upsert Realtime Analytics' },
      { id: 'e8', from: 'order_svc', to: 'redis_node', label: 'Read-Aside Cache', style: 'dotted' }
    ]
  },
  {
    id: 'realtime-cdc-flink',
    title: '🌊 Realtime CDC Pipeline (Flink + Debezium)',
    description: 'Đồng bộ dữ liệu CDC thời gian thực từ cơ sở dữ liệu nguồn sang Search Engine và Data Lake.',
    direction: 'LR',
    nodes: [
      { id: 'source_db', type: 'database', label: 'MySQL Primary (WAL/Binlog)' },
      { id: 'debezium', type: 'service', label: 'Debezium CDC Connector' },
      { id: 'kafka_cdc', type: 'kafka', label: 'Kafka: db-changes.orders' },
      { id: 'flink_cdc', type: 'flink', label: 'Apache Flink Stateful Job' },
      { id: 'elastic_node', type: 'search', label: 'Elasticsearch Index' },
      { id: 'redis_rt', type: 'redis', label: 'Redis Realtime Aggregates' },
      { id: 's3_lake', type: 'storage', label: 'AWS S3 Parquet Data Lake' }
    ],
    edges: [
      { id: 'e1', from: 'source_db', to: 'debezium', label: 'Stream Binlog' },
      { id: 'e2', from: 'debezium', to: 'kafka_cdc', label: 'JSON Events' },
      { id: 'e3', from: 'kafka_cdc', to: 'flink_cdc', label: 'Consume' },
      { id: 'e4', from: 'flink_cdc', to: 'elastic_node', label: 'Sync Search Index' },
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
      { id: 'users_node', type: 'client', label: '50,000+ RPS Clients' },
      { id: 'cdn_node', type: 'gateway', label: 'Cloudflare CDN Edge Cache' },
      { id: 'app_cluster', type: 'service', label: 'Spring Boot App Cluster' },
      { id: 'l1_cache', type: 'redis', label: 'L1: Caffeine In-Memory (TTL 30s)' },
      { id: 'l2_cache', type: 'redis', label: 'L2: Redis Distributed (TTL 1h)' },
      { id: 'db_master', type: 'database', label: 'PostgreSQL Master (Write)' },
      { id: 'db_replica', type: 'database', label: 'PostgreSQL Replica (Read-Only)' }
    ],
    edges: [
      { id: 'e1', from: 'users_node', to: 'cdn_node', label: 'HTTPS Request' },
      { id: 'e2', from: 'cdn_node', to: 'app_cluster', label: 'Cache Miss' },
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
      { id: 'pres_layer', type: 'gateway', label: 'Presentation: REST Controllers & DTOs' },
      { id: 'app_usecase', type: 'service', label: 'Application: UseCases & Inbound Ports' },
      { id: 'core_domain', type: 'service', label: 'Domain: Business Entities & Rules' },
      { id: 'jpa_infra', type: 'database', label: 'Infra: Spring Data JPA Adapter' },
      { id: 'kafka_infra', type: 'kafka', label: 'Infra: Kafka Event Publisher' }
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
      { id: 'client_cqrs', type: 'client', label: 'Client App' },
      { id: 'cmd_api', type: 'service', label: 'Command API Service' },
      { id: 'outbox_table', type: 'database', label: 'Single ACID Tx (Order + Outbox)' },
      { id: 'debezium_relay', type: 'service', label: 'Debezium Outbox Poller' },
      { id: 'kafka_bus', type: 'kafka', label: 'Kafka: order-events' },
      { id: 'query_store', type: 'search', label: 'Read Store (Materialized View)' }
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
  if (!nodes.length) return 'graph TD\n    start_node["Chưa có thành phần nào"]'

  const lines = [`graph ${direction}`]

  // Output Nodes with escaped labels
  nodes.forEach(n => {
    const icon = getNodeIconSymbol(n.type)
    const cleanLabel = (n.label || 'Node').replace(/"/g, "'")
    const label = `${icon} ${cleanLabel}`.trim()
    const safeId = (n.id || 'node').replace(/[^a-zA-Z0-9_]/g, '_')

    if (n.type === 'database' || n.type === 'redis' || n.type === 'search' || n.type === 'storage') {
      lines.push(`    ${safeId}[("${label}")]`)
    } else {
      lines.push(`    ${safeId}["${label}"]`)
    }
  })

  lines.push('')

  // Output Edges
  edges.forEach(e => {
    const safeFrom = (e.from || '').replace(/[^a-zA-Z0-9_]/g, '_')
    const safeTo = (e.to || '').replace(/[^a-zA-Z0-9_]/g, '_')
    const cleanLabel = e.label ? `|"${e.label.replace(/"/g, "'")}"|` : ''

    if (e.style === 'dotted') {
      lines.push(`    ${safeFrom} -.->${cleanLabel} ${safeTo}`)
    } else if (e.style === 'bidirectional') {
      lines.push(`    ${safeFrom} <-->${cleanLabel} ${safeTo}`)
    } else {
      lines.push(`    ${safeFrom} -->${cleanLabel} ${safeTo}`)
    }
  })

  lines.push('')

  // Distinct classDef names prefixed with cls_ to prevent ID collision
  lines.push('    classDef cls_client fill:#38bdf8,stroke:#0284c7,stroke-width:2px,color:#0f172a,font-weight:bold;')
  lines.push('    classDef cls_gateway fill:#6366f1,stroke:#4338ca,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef cls_service fill:#0ea5e9,stroke:#0369a1,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef cls_kafka fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef cls_flink fill:#ec4899,stroke:#be185d,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef cls_database fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef cls_redis fill:#f43f5e,stroke:#e11d48,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef cls_search fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#ffffff,font-weight:bold;')
  lines.push('    classDef cls_storage fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#ffffff,font-weight:bold;')

  // Apply Classes
  const typesMap = {}
  nodes.forEach(n => {
    const t = n.type || 'service'
    const safeId = (n.id || 'node').replace(/[^a-zA-Z0-9_]/g, '_')
    if (!typesMap[t]) typesMap[t] = []
    typesMap[t].push(safeId)
  })

  Object.entries(typesMap).forEach(([type, ids]) => {
    if (ids.length > 0) {
      lines.push(`    class ${ids.join(',')} cls_${type};`)
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
    const newId = `node_${paletteItem.type}_${Date.now().toString(36).slice(-4)}`
    const newNode = {
      id: newId,
      type: paletteItem.type,
      label: paletteItem.label
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
    <div className="arch-studio-fullscreen-page">
      {/* Top Header Bar */}
      <div className="arch-studio-header">
        <div className="arch-studio-title-wrap">
          <button
            type="button"
            className="btn-back-to-project"
            onClick={onClose}
            title="Quay lại trình soạn thảo dự án"
          >
            <ArrowRight style={{ transform: 'rotate(180deg)' }} size={16} />
            <span>Quay lại Dự Án</span>
          </button>
          <div className="arch-studio-icon">
            <Workflow size={20} />
          </div>
          <div>
            <h3>Visual Architecture Studio IDE</h3>
            <p>Trực tiếp vẽ, nối mũi tên và tự động sinh code Mermaid cho dự án.</p>
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
              <Palette size={14} /> Vẽ Trực Quan &amp; Sơ Đồ
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
              <Eye size={14} /> Toàn Màn Hình
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
                    👉 Hãy bấm vào <b>Node gốc (From)</b> ở danh sách bên phải rồi bấm tiếp vào <b>Node đích (To)</b>!
                  </small>
                )}
              </div>
            </div>

            {/* Center Canvas: Full Interactive Visual Architecture Diagram */}
            <div className="visual-canvas-workspace">
              <div className="canvas-header-strip">
                <span>
                  ⚡ Có <b>{graph.nodes.length}</b> khối thành phần &amp; <b>{graph.edges.length}</b> liên kết mũi tên.
                </span>
                <span className="selected-tag">
                  🔍 Kéo chuột để di chuyển • Cuộn chuột để zoom • Tự động render 100%
                </span>
              </div>

              <div className="visual-live-diagram-fullscreen">
                <ArchitectureViewer
                  diagramCode={rawCode}
                  title={title}
                  description={description}
                  defaultHeight="100%"
                  allowFullscreen={false}
                  className="arch-studio-main-canvas"
                />
              </div>
            </div>

            {/* Right Sidebar: Active Node / Edge Inspector & Elements Manager */}
            <div className="visual-inspector-sidebar">
              <span className="inspector-title">
                <Palette size={14} /> Khối &amp; Thuộc Tính
              </span>

              {/* Selection Inspector */}
              {selectedNode ? (
                <div className="inspector-form selected-box">
                  <span className="inspector-subhead">Đang chọn khối:</span>
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
                <div className="inspector-form selected-box">
                  <span className="inspector-subhead">Đang chọn mũi tên:</span>
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
              ) : null}

              {/* Quick Nodes List for Connect & Edit */}
              <div className="inspector-nodes-list-section">
                <span className="inspector-subhead">Danh sách các khối hiện tại ({graph.nodes.length}):</span>
                <div className="inspector-nodes-scroll">
                  {graph.nodes.map(node => {
                    const isSelected = selectedNodeId === node.id
                    const isSourceConnect = connectFromNodeId === node.id

                    return (
                      <div
                        key={node.id}
                        className={`inspector-node-item ${isSelected ? 'selected' : ''} ${isSourceConnect ? 'connecting-source' : ''}`}
                        onClick={() => handleNodeClick(node.id)}
                      >
                        <span className="node-item-icon">{getNodeIconSymbol(node.type)}</span>
                        <span className="node-item-label">{node.label}</span>
                        <button
                          type="button"
                          className="node-item-del"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNode(node.id)
                          }}
                          title="Xóa khối"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
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
  )
}
