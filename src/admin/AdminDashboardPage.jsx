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
} from 'lucide-react'
import { getDashboard } from '../services/adminApi'

export function AdminDashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboard().then(setData).catch(() => {})
  }, [])

  if (!data) {
    return (
      <div className="admin-page">
        <div className="admin-skeleton-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
    )
  }

  const cards = [
    ['Dự án', data.projects || 0, FolderKanban, '#6366f1'],
    ['Năng lực kỹ thuật', data.skills || 0, BriefcaseBusiness, '#3b82f6'],
    ['Bài kiến thức', data.articles || 0, BookOpen, '#06b6d4'],
    ['Khách truy cập', data.guests || 0, Users, '#8b5cf6'],
    ['Lượt yêu thích', data.likes || 0, Heart, '#f43f5e'],
    ['Bình luận chờ duyệt', data.pendingComments || 0, MessageSquare, '#f59e0b'],
    ['Tin liên hệ', data.contacts || 0, Mail, '#10b981'],
  ]

  const barChartData = cards.slice(0, 4).map(([name, value]) => ({ name, value }))
  
  // Engagement pie chart data
  const pieChartData = [
    { name: 'Khách truy cập', value: data.guests || 0, color: '#8b5cf6' },
    { name: 'Lượt thích', value: data.likes || 0, color: '#f43f5e' },
    { name: 'Bình luận', value: data.pendingComments || 0, color: '#f59e0b' },
    { name: 'Liên hệ', value: data.contacts || 0, color: '#10b981' },
  ]
  const totalEngagement = pieChartData.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="admin-page">
      {/* Heading */}
      <div className="admin-heading">
        <div>
          <span>Tổng Quan Hệ Thống</span>
          <h1>Dashboard</h1>
        </div>
        <small>Dữ liệu cập nhật theo thời gian thực</small>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid">
        {cards.map(([name, value, Icon, color]) => (
          <article key={name}>
            <i style={{ background: `${color}18`, color }}>
              <Icon />
            </i>
            <div>
              <small>{name}</small>
              <b>{value}</b>
            </div>
            <span>Active</span>
          </article>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="chart-grid">
        <article>
          <header>
            <div>
              <span>Thống Kê Nội Dung</span>
              <h2>Tổng quan dữ liệu</h2>
            </div>
            <Eye className="text-slate-400" size={18} />
          </header>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={11} stroke="#64748b" tickLine={false} />
              <YAxis allowDecimals={false} fontSize={11} stroke="#64748b" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article>
          <header>
            <div>
              <span>Phân Bổ Tương Tác</span>
              <h2>Engagement</h2>
            </div>
            <Heart className="text-slate-400" size={18} />
          </header>
          {totalEngagement === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-slate-400 text-xs">
              <Heart size={32} className="text-slate-300 mb-2 opacity-50" />
              <span>Chưa có dữ liệu tương tác từ người dùng</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </article>
      </div>
    </div>
  )
}
