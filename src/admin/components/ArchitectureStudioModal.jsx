import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Cpu,
  Database,
  Layers3,
  Network,
  Play,
  RotateCcw,
  Server,
  Sparkles,
  Workflow,
  X
} from 'lucide-react'
import { useState } from 'react'
import { ArchitectureViewer } from '../../components/common/ArchitectureViewer'

export const ARCHITECTURE_TEMPLATES = [
  {
    id: 'microservices-kafka',
    title: '🚀 Microservices & Kafka Event Bus',
    description: 'Kiến trúc hướng sự kiện mở rộng cao với Spring Cloud Gateway, Kafka và Flink.',
    code: `graph TD
    Client["🌐 Web / Mobile Clients"] --> Gateway["🛡️ Spring Cloud API Gateway (Port 8080)"]
    
    subgraph CoreServices ["🏢 Backend Microservices Cluster"]
        Gateway --> AuthSvc["🔑 Auth & User Service"]
        Gateway --> OrderSvc["⚡ Order Processing Service"]
        Gateway --> ProductSvc["📦 Product Catalog Service"]
    end

    subgraph EventStreaming ["🌊 Event Bus & Realtime Stream"]
        OrderSvc -->|"Publish OrderCreated"| Kafka["🚀 Apache Kafka Cluster (3 Partitions)"]
        Kafka -->|"Stream Ingestion"| Flink["🌊 Apache Flink Stream Engine"]
    end

    subgraph DataStorage ["🗄️ Persistence & Distributed Cache"]
        Flink -->|"Upsert Realtime Analytics"| Postgres[("🐘 PostgreSQL DB Cluster")]
        OrderSvc -.->|"Cache Read-Aside (TTL 10m)"| Redis[("⚡ Redis Cache Cluster")]
        ProductSvc --> Postgres
    end

    classDef client fill:#38bdf8,stroke:#0284c7,stroke-width:2px,color:#0f172a,font-weight:bold;
    classDef gateway fill:#6366f1,stroke:#4338ca,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef service fill:#0ea5e9,stroke:#0369a1,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef kafka fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef db fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;

    class Client client;
    class Gateway gateway;
    class AuthSvc,OrderSvc,ProductSvc,Flink service;
    class Kafka kafka;
    class Postgres,Redis db;`
  },
  {
    id: 'realtime-cdc-flink',
    title: '🌊 Realtime CDC Data Pipeline (Flink + Debezium)',
    description: 'Đồng bộ dữ liệu CDC thời gian thực từ cơ sở dữ liệu nguồn sang Search Engine và Data Lake.',
    code: `graph LR
    subgraph SourceDB ["🗄️ Source Transactional DB"]
        MySQL[("🐬 MySQL / PostgreSQL Primary")]
        Binlog["📜 WAL / Binlog Stream"]
        MySQL --> Binlog
    end

    subgraph CDC_Layer ["⚡ Change Data Capture"]
        Binlog --> Debezium["🔌 Debezium CDC Connector"]
        Debezium -->|"JSON Change Events"| KafkaTopic["🚀 Kafka: db-changes.orders"]
    end

    subgraph StreamEngine ["🌊 Stream Processing"]
        KafkaTopic --> FlinkJob["⚙️ Apache Flink Stateful Pipeline"]
        FlinkJob -->|"Sliding Window (1min)"| MetricAgg["📊 Realtime Revenue Aggregator"]
    end

    subgraph SinkLayer ["🎯 Realtime Targets & Data Sinks"]
        MetricAgg --> ElasticSearch[("🔍 Elasticsearch Search Index")]
        MetricAgg --> RedisCache[("⚡ Redis Realtime Dashboard")]
        MetricAgg --> S3DataLake[("🪣 AWS S3 / MinIO Parquet Lake")]
    end

    classDef src fill:#0284c7,stroke:#0369a1,stroke-width:2px,color:#ffffff;
    classDef cdc fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#ffffff;
    classDef stream fill:#ec4899,stroke:#be185d,stroke-width:2px,color:#ffffff;
    classDef sink fill:#10b981,stroke:#047857,stroke-width:2px,color:#ffffff;

    class MySQL,Binlog src;
    class Debezium,KafkaTopic cdc;
    class FlinkJob,MetricAgg stream;
    class ElasticSearch,RedisCache,S3DataLake sink;`
  },
  {
    id: 'clean-architecture-3tier',
    title: '🏛️ Clean Architecture & DDD Layering',
    description: 'Mô hình kiến trúc phân lớp sạch sẽ, tách biệt logic nghiệp vụ khỏi hạ tầng.',
    code: `graph TD
    subgraph Presentation ["📱 Presentation Layer (Web & API)"]
        Controller["🌐 REST API Controllers / GraphQL"]
        DTO["📦 Request / Response DTOs"]
        Controller --> DTO
    end

    subgraph Application ["⚙️ Application Layer (Use Cases)"]
        UseCase["🎯 Command / Query Handlers"]
        InputPort["🔌 Inbound Ports (Interfaces)"]
        OutputPort["🔌 Outbound Ports (Repository SPI)"]
        Controller --> InputPort
        InputPort --> UseCase
        UseCase --> OutputPort
    end

    subgraph Domain ["💎 Domain Layer (Core Business Logic)"]
        Entity["🏛️ Domain Entities & Aggregates"]
        ValueObject["💠 Value Objects"]
        DomainService["⚡ Domain Services"]
        UseCase --> Entity
        Entity --> ValueObject
        Entity --> DomainService
    end

    subgraph Infrastructure ["🗄️ Infrastructure Layer (Adapters)"]
        OutputPort --> JpaAdapter["💾 Spring Data JPA / Hibernate"]
        OutputPort --> KafkaAdapter["📨 Kafka Event Publisher"]
        OutputPort --> SecurityAdapter["🛡️ JWT & Security Adapter"]
    end

    classDef pres fill:#38bdf8,stroke:#0284c7,color:#0f172a,font-weight:bold;
    classDef app fill:#818cf8,stroke:#4f46e5,color:#ffffff,font-weight:bold;
    classDef domain fill:#f59e0b,stroke:#d97706,color:#ffffff,font-weight:bold;
    classDef infra fill:#34d399,stroke:#059669,color:#0f172a,font-weight:bold;

    class Controller,DTO pres;
    class UseCase,InputPort,OutputPort app;
    class Entity,ValueObject,DomainService domain;
    class JpaAdapter,KafkaAdapter,SecurityAdapter infra;`
  },
  {
    id: 'high-concurrency-cache',
    title: '⚡ High-Concurrency Distributed Caching',
    description: 'Chiến lược caching nhiều tầng (Multi-tier Cache) chống Cache Stampede và tối ưu RPS.',
    code: `graph TD
    User["👥 High Concurrency Users (50,000+ RPS)"] --> CDN["🌍 Cloudflare / CDN Edge Cache"]
    CDN -->|"Cache Miss"| Nginx["🛡️ NGINX Reverse Proxy & Rate Limiter"]
    Nginx --> AppNode["⚡ Java Spring Boot Application Cluster"]

    subgraph CachingStrategy ["🔥 Multi-Tier Cache System"]
        AppNode --> L1Cache["📦 L1: Caffeine In-Memory Local Cache (TTL 30s)"]
        L1Cache -.->|"L1 Miss"| L2Cache["⚡ L2: Distributed Redis Cluster (TTL 1hr)"]
    end

    subgraph DatabaseTier ["🗄️ High Availability Database Cluster"]
        L2Cache -.->|"L2 Miss (Distributed Lock)"| DBRead[("🐘 PostgreSQL Read Replica (Read-Only)")]
        AppNode -->|"Write Operations"| DBWrite[("🐘 PostgreSQL Master Node (Write)")]
        DBWrite -->|"Async Streaming Replication"| DBRead
    end

    classDef user fill:#64748b,color:#ffffff;
    classDef cache fill:#f59e0b,stroke:#d97706,color:#ffffff,font-weight:bold;
    classDef app fill:#6366f1,stroke:#4338ca,color:#ffffff,font-weight:bold;
    classDef db fill:#10b981,stroke:#059669,color:#ffffff,font-weight:bold;

    class User,CDN,Nginx user;
    class L1Cache,L2Cache cache;
    class AppNode app;
    class DBRead,DBWrite db;`
  },
  {
    id: 'cqrs-outbox-pattern',
    title: '🔄 CQRS & Transactional Outbox Pattern',
    description: 'Đảm bảo tính nhất quán dữ liệu (Dual-Write safety) giữa Database và Message Broker.',
    code: `graph LR
    Client["👤 Client"] -->|"1. POST /orders"| CommandAPI["⚡ Command Service"]

    subgraph AtomicTx ["🔒 Single ACID Database Transaction"]
        CommandAPI -->|"2. Insert Order"| OrderTable[("📋 orders table")]
        CommandAPI -->|"3. Insert Event"| OutboxTable[("📬 outbox_events table")]
    end

    subgraph EventRelay ["⚡ Reliable Message Dispatcher"]
        DebeziumRelay["🔌 Debezium CDC / Poller"] -->|"4. Read Outbox Events"| OutboxTable
        DebeziumRelay -->|"5. Exactly-Once Publish"| KafkaTopic["🚀 Kafka: order-events"]
    end

    subgraph ReadSide ["📖 Query & Read Models"]
        KafkaTopic -->|"6. Consume"| ViewConsumer["⚙️ Read Model Updater"]
        ViewConsumer -->|"7. Update Materialized View"| ReadDB[("🔍 Read Store / Elastic")]
        Client -->|"8. GET /orders (Fast Query)"| ReadDB
    end

    classDef primary fill:#6366f1,stroke:#4338ca,color:#ffffff;
    classDef tx fill:#f59e0b,stroke:#d97706,color:#ffffff;
    classDef bus fill:#0284c7,stroke:#0369a1,color:#ffffff;
    classDef query fill:#10b981,stroke:#059669,color:#ffffff;

    class Client,CommandAPI primary;
    class OrderTable,OutboxTable tx;
    class DebeziumRelay,KafkaTopic bus;
    class ViewConsumer,ReadDB query;`
  }
]

export function ArchitectureStudioModal({
  isOpen,
  onClose,
  initialCode = '',
  initialTitle = 'Sơ đồ Kiến trúc Hệ thống',
  onInsert
}) {
  const [title, setTitle] = useState(initialTitle || 'Sơ đồ Kiến trúc Hệ thống')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState(
    initialCode || ARCHITECTURE_TEMPLATES[0].code
  )
  const [activeTemplate, setActiveTemplate] = useState('microservices-kafka')
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  function applyTemplate(tmpl) {
    setActiveTemplate(tmpl.id)
    setTitle(tmpl.title.replace(/^[^\s]+\s/, ''))
    setDescription(tmpl.description)
    setCode(tmpl.code)
  }

  function handleInsert() {
    if (onInsert) {
      onInsert({
        title,
        description,
        code
      })
    }
    onClose()
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function insertSnippet(snippet) {
    setCode(prev => `${prev.trim()}\n    ${snippet}\n`)
  }

  return (
    <div className="arch-studio-backdrop">
      <div className="arch-studio-modal">
        {/* Top Header Bar */}
        <div className="arch-studio-header">
          <div className="arch-studio-title-wrap">
            <div className="arch-studio-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h3>Architecture Studio &amp; Mermaid IDE</h3>
              <p>Thiết kế, trực quan hóa và sinh sơ đồ kiến trúc hệ thống chuyên nghiệp.</p>
            </div>
          </div>

          <div className="arch-studio-header-actions">
            <button
              type="button"
              className="btn outline-light"
              onClick={copyCode}
            >
              <Copy size={14} /> {copied ? 'Đã chép!' : 'Sao chép mã'}
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

        {/* Template Selector Bar */}
        <div className="arch-studio-templates-bar">
          <span className="templates-label">
            <BookOpen size={14} /> Mẫu kiến trúc:
          </span>
          <div className="templates-scroll-list">
            {ARCHITECTURE_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.id}
                type="button"
                className={`template-pill-btn ${activeTemplate === tmpl.id ? 'active' : ''}`}
                onClick={() => applyTemplate(tmpl)}
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-Column IDE Workspace */}
        <div className="arch-studio-workspace">
          {/* Left Column: Code Editor & Snippets */}
          <div className="arch-editor-panel">
            <div className="arch-editor-meta-form">
              <input
                type="text"
                className="arch-input title-input"
                placeholder="Tiêu đề sơ đồ kiến trúc (vd: Luồng xử lý Kafka & Flink)"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <input
                type="text"
                className="arch-input desc-input"
                placeholder="Mô tả ngắn gọn về giải pháp kỹ thuật..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Quick Snippets Toolbar */}
            <div className="arch-snippets-toolbar">
              <span className="snippets-label">Chèn nhanh:</span>
              <button
                type="button"
                className="snippet-btn"
                onClick={() => insertSnippet('SvcA["⚡ Microservice A"] -->|"REST / JSON"| SvcB["⚡ Microservice B"]')}
                title="Thêm liên kết Microservices"
              >
                <Server size={12} /> Service
              </button>
              <button
                type="button"
                className="snippet-btn"
                onClick={() => insertSnippet('Producer["⚡ Service"] -->|"Publish Event"| Kafka["🚀 Apache Kafka Topic"]')}
                title="Thêm Kafka Event Bus"
              >
                <Network size={12} /> Kafka
              </button>
              <button
                type="button"
                className="snippet-btn"
                onClick={() => insertSnippet('App["⚡ App"] -->|"SQL Query"| DB[("🐘 PostgreSQL Cluster")]')}
                title="Thêm Database Cluster"
              >
                <Database size={12} /> Database
              </button>
              <button
                type="button"
                className="snippet-btn"
                onClick={() => insertSnippet('App["⚡ App"] -.->|"Get Cache (TTL 15m)"| Redis[("⚡ Redis Cache")]')}
                title="Thêm Redis Cache"
              >
                <Cpu size={12} /> Redis
              </button>
              <button
                type="button"
                className="snippet-btn"
                onClick={() => insertSnippet('subgraph SubCluster ["🏢 Cluster Name"]\n        Node1["Node 1"]\n        Node2["Node 2"]\n    end')}
                title="Thêm cụm Subgraph"
              >
                <Layers3 size={12} /> Subgraph
              </button>
            </div>

            {/* Code Textarea with line highlight */}
            <div className="arch-code-editor-wrap">
              <textarea
                className="arch-code-textarea"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Nhập mã sơ đồ Mermaid tại đây..."
                spellCheck="false"
              />
            </div>
          </div>

          {/* Right Column: Live Interactive Visual Preview */}
          <div className="arch-preview-panel">
            <ArchitectureViewer
              diagramCode={code}
              title={title}
              description={description}
              defaultHeight="100%"
              allowFullscreen={false}
              className="arch-studio-live-viewer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
