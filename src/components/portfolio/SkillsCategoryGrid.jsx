import { useMemo } from 'react'
import {
  Code2,
  Cpu,
  Database,
  Layers3,
  Server,
  Sparkles,
  Wrench
} from 'lucide-react'

export const CATEGORY_META = {
  'backend & architecture': {
    icon: Server,
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    label: 'Backend & Kiến trúc hệ thống'
  },
  'database': {
    icon: Database,
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.1)',
    label: 'Cơ sở dữ liệu & Tối ưu hóa'
  },
  'data processing': {
    icon: Layers3,
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    label: 'Xử lý dữ liệu & Streaming'
  },
  'ai & tools': {
    icon: Sparkles,
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.1)',
    label: 'AI, DevOps & Công cụ'
  },
  'frontend': {
    icon: Code2,
    color: '#ea580c',
    bgColor: 'rgba(234, 88, 12, 0.1)',
    label: 'Frontend & Giao diện'
  },
  'devops & cloud': {
    icon: Cpu,
    color: '#0d9488',
    bgColor: 'rgba(13, 148, 136, 0.1)',
    label: 'DevOps & Hạ tầng Cloud'
  }
}

export function SkillsCategoryGrid({ skills = [] }) {
  const categorizedSkills = useMemo(() => {
    const groups = {}
    if (!Array.isArray(skills)) return groups

    skills.forEach((s) => {
      if (!s || !s.name) return
      const cat = (s.category || 'Kỹ năng chuyên môn').trim()
      if (!groups[cat]) {
        groups[cat] = []
      }
      groups[cat].push(s)
    })

    // Sort items within each category by displayOrder
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    })
    return groups
  }, [skills])

  if (Object.keys(categorizedSkills).length === 0) {
    return (
      <div className="empty-state-box">
        <Code2 className="empty-icon" />
        <h3>Chưa có dữ liệu Kỹ năng</h3>
        <p>Vui lòng cập nhật thông tin trong trang Quản trị Admin.</p>
      </div>
    )
  }

  return (
    <div className="skills-category-grid">
      {Object.entries(categorizedSkills).map(([catName, items]) => {
        const catKey = catName.trim().toLowerCase()
        const meta = CATEGORY_META[catKey] || {
          icon: Wrench,
          color: '#059669',
          bgColor: 'rgba(5, 150, 105, 0.1)',
          label: catName
        }
        const IconComponent = meta.icon

        return (
          <div className="skill-category-card reveal" key={catName}>
            <div className="skill-cat-header">
              <div
                className="skill-cat-icon-box"
                style={{ color: meta.color, background: meta.bgColor }}
              >
                <IconComponent size={20} />
              </div>
              <div>
                <h3 className="skill-cat-title">{meta.label || catName}</h3>
                <span className="skill-cat-count">{items.length} công nghệ</span>
              </div>
            </div>
            <div className="skill-chips-wrap">
              {items.map((s) => (
                <div className="skill-tech-chip" key={s.id || s.name}>
                  <span className="skill-chip-dot" style={{ background: meta.color }} />
                  <span className="skill-chip-name">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
