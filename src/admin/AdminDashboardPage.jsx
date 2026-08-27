import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import {
  BookOpen,
  BriefcaseBusiness,
  Eye,
  FolderKanban,
  Heart,
  Mail,
  MessageSquare,
  Users,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Activity,
  Zap,
  Server
} from 'lucide-react'
import { getDashboard } from '../services/adminApi'

export function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="admin-page">
        <div className="admin-skeleton-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="admin-skeleton-card" />
          ))}
        </div>
      </div>
    )
  }

  const cards = [
    { name: 'Dự án', value: data.projects || 0, icon: FolderKanban, color: '#6366f1', desc: 'Sản phẩm tiêu biểu' },
    { name: 'Năng lực kỹ thuật', value: data.skills || 0, icon: BriefcaseBusiness, color: '#06b6d4', desc: 'Kỹ năng & Chuyên môn' },
    { name: 'Bài kiến thức', value: data.articles || 0, icon: BookOpen, color: '#10b981', desc: 'Bài viết chia sẻ' },
    { name: 'Khách truy cập', value: data.guests || 0, icon: Users, color: '#8b5cf6', desc: 'Lượt ghé thăm' },
    { name: 'Lượt yêu thích', value: data.likes || 0, icon: Heart, color: '#f43f5e', desc: 'Tương tác Like' },
    { name: 'Bình luận chờ', value: data.pendingComments || 0, icon: MessageSquare, color: '#f59e0b', desc: 'Cần kiểm duyệt' },
    { name: 'Tin nhắn liên hệ', value: data.contacts || 0, icon: Mail, color: '#14b8a6', desc: 'Khách hàng gửi đến' },
  ]

  const barChartData = [
    { name: 'Dự án', value: data.projects || 0, fill: '#6366f1' },
    { name: 'Kỹ năng', value: data.skills || 0, fill: '#06b6d4' },
    { name: 'Bài viết', value: data.articles || 0, fill: '#10b981' },
    { name: 'Liên hệ', value: data.contacts || 0, fill: '#14b8a6' },
  ]

  // Engagement pie chart data
  const pieChartData = [
    { name: 'Khách truy cập', value: data.guests || 0, color: '#8b5cf6' },
    { name: 'Lượt thích', value: data.likes || 0, color: '#f43f5e' },
    { name: 'Bình luận', value: data.pendingComments || 0, color: '#f59e0b' },
    { name: 'Tin nhắn', value: data.contacts || 0, color: '#10b981' },
  ]
  const totalEngagement = pieChartData.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="admin-page">
      {/* Heading */}
      <div className="admin-heading">
        <div className="admin-heading-left">
          <span className="admin-badge-category">
            <Activity size={11} /> HỆ THỐNG THỜI GIAN THỰC
          </span>
          <h1>Dashboard Tổng Quan</h1>
        </div>
        <div className="dashboard-status-indicator">
          <span className="live-dot" />
          <span>Hệ thống hoạt động bình thường</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="admin-stat-grid">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <article key={c.name} className="admin-stat-card">
              <div className="stat-card-top">
                <div className="stat-icon-wrap" style={{ background: `${c.color}18`, color: c.color }}>
                  <Icon size={20} />
                </div>
                <span className="stat-trend-tag">
                  <TrendingUp size={11} /> Live
                </span>
              </div>
              <div className="stat-card-body">
                <span className="stat-label">{c.name}</span>
                <strong className="stat-value">{c.value}</strong>
                <small className="stat-desc">{c.desc}</small>
              </div>
            </article>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="admin-chart-grid">
        {/* Bar Chart */}
        <article className="admin-chart-card">
          <header className="chart-header">
            <div>
              <span className="chart-tag">DỮ LIỆU NỘI DUNG</span>
              <h2>Phân Bổ Tài Nguyên Hệ Thống</h2>
            </div>
            <div className="chart-header-badge">
              <Zap size={13} />
              <span>Số lượng thực tế</span>
            </div>
          </header>

          <div className="chart-content">
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={barChartData} margin={{ top: 20, right: 20, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4338ca" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" tickLine={false} />
                <YAxis allowDecimals={false} fontSize={12} stroke="#94a3b8" tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                  }}
                />
                <Bar dataKey="value" name="Số lượng" radius={[8, 8, 0, 0]} barSize={42}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Donut Chart */}
        <article className="admin-chart-card">
          <header className="chart-header">
            <div>
              <span className="chart-tag">TƯƠNG TÁC NGƯỜI DÙNG</span>
              <h2>Tỷ Lệ Engagement</h2>
            </div>
            <div className="chart-header-badge">
              <Heart size={13} />
              <span>Tổng: {totalEngagement}</span>
            </div>
          </header>

          <div className="chart-content">
            {totalEngagement === 0 ? (
              <div className="chart-empty-state">
                <Heart size={36} className="text-slate-500 opacity-40 mb-2" />
                <span>Chưa có dữ liệu tương tác từ người dùng</span>
              </div>
            ) : (
              <div className="donut-chart-container">
                <ResponsiveContainer width="100%" height={290}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      stroke="none"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: '#cbd5e1', fontSize: '11px', fontWeight: 600 }}>
                          {value} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </article>
      </div>

      {/* System Infrastructure Status Bar */}
      <div className="admin-infra-banner">
        <div className="infra-item">
          <Server size={16} className="text-emerald-400" />
          <span>Database: <b>Neon PostgreSQL Cloud</b></span>
          <span className="infra-pill live">Connected</span>
        </div>
        <div className="infra-item">
          <Sparkles size={16} className="text-cyan-400" />
          <span>AI Engine: <b>Groq Llama 3.3 + Google Gemini</b></span>
          <span className="infra-pill live">Active</span>
        </div>
        <div className="infra-item">
          <CheckCircle2 size={16} className="text-indigo-400" />
          <span>Voice TTS: <b>Microsoft Edge Neural (Hoài My)</b></span>
          <span className="infra-pill live">100% Free</span>
        </div>
      </div>
    </div>
  )
}
