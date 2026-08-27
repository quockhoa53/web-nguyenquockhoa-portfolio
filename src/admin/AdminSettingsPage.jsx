import { useState, useEffect } from 'react'
import {
  Settings,
  Sun,
  Moon,
  Check,
  Server,
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCw,
  HardDrive
} from 'lucide-react'
import { useToast } from '../components/common/ToastContext'

const PALETTES = [
  {
    id: 'purple',
    name: 'Electric Violet (Tím Neon Pro)',
    desc: 'Phong cách Linear & Raycast - Đen tím sắc sảo, siêu phẩm cho Developer',
    color: '#a855f7',
    grad: 'linear-gradient(135deg, #c084fc, #7c3aed)',
    previewBg: '#09090e'
  },
  {
    id: 'gold',
    name: 'Cyber Gold (Vàng Ánh Kim)',
    desc: 'Phong cách Hoàng Gia - Vàng hổ phách & Đen thạch anh sang trọng',
    color: '#f59e0b',
    grad: 'linear-gradient(135deg, #fbbf24, #ea580c)',
    previewBg: '#0d0c09'
  },
  {
    id: 'cyan',
    name: 'Ice Cyan (Xanh Băng Sapphire)',
    desc: 'Phong cách Cyberpunk - Xanh băng sắc lạnh & Midnight Navy',
    color: '#06b6d4',
    grad: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
    previewBg: '#050b13'
  },
  {
    id: 'rose',
    name: 'Crimson Ruby (Đỏ Hồng Ruby)',
    desc: 'Phong cách Quý Tộc - Đỏ hồng Ruby & Đen huyền bí quyến rũ',
    color: '#f43f5e',
    grad: 'linear-gradient(135deg, #fb7185, #e11d48)',
    previewBg: '#0e070a'
  },
  {
    id: 'emerald',
    name: 'Deep Emerald (Ngọc Lục Bảo)',
    desc: 'Phong cách Thiên Nhiên - Xanh ngọc lục bảo tươi mát & Đen sâu',
    color: '#10b981',
    grad: 'linear-gradient(135deg, #34d399, #059669)',
    previewBg: '#060b09'
  }
]

export function AdminSettingsPage() {
  const [dark, setDark] = useState(() => localStorage.getItem('portfolio-theme') !== 'light')
  const [palette, setPalette] = useState(() => localStorage.getItem('admin-color-palette') || 'purple')
  const toast = useToast()

  function handleToggleMode(newDarkMode) {
    setDark(newDarkMode)
    document.documentElement.classList.toggle('dark', newDarkMode)
    localStorage.setItem('portfolio-theme', newDarkMode ? 'dark' : 'light')
    // Dispatch custom event to notify AdminLayout
    window.dispatchEvent(new CustomEvent('admin-theme-change', { detail: { dark: newDarkMode } }))
    toast.success(newDarkMode ? 'Đã bật Chế độ Tối (Dark Mode)!' : 'Đã bật Chế độ Sáng (Light Mode)!')
  }

  function handleSelectPalette(paletteId) {
    setPalette(paletteId)
    localStorage.setItem('admin-color-palette', paletteId)
    window.dispatchEvent(new CustomEvent('admin-palette-change', { detail: { palette: paletteId } }))
    const selected = PALETTES.find(p => p.id === paletteId)
    toast.success(`Đã đổi tông màu sang ${selected?.name || paletteId}!`)
  }

  return (
    <div className="admin-page">
      {/* Heading */}
      <div className="admin-heading">
        <div className="admin-heading-left">
          <span className="admin-badge-category">
            <Settings size={11} /> CẤU HÌNH &amp; TÙY BIẾN
          </span>
          <h1>Cài Đặt Hệ Thống &amp; Giao Diện</h1>
        </div>
      </div>

      {/* 1. Appearance / Theme Mode */}
      <div className="admin-settings-section">
        <div className="settings-section-header">
          <div className="settings-icon-circle">
            {dark ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div>
            <h3>Chế Độ Hiển Thị (Light / Dark Theme)</h3>
            <p>Chọn giao diện sáng thanh lịch hoặc giao diện tối độc bản phù hợp với sở thích của bạn.</p>
          </div>
        </div>

        <div className="settings-theme-cards-grid">
          {/* Light Theme Card */}
          <div
            className={`theme-mode-card ${!dark ? 'selected' : ''}`}
            onClick={() => handleToggleMode(false)}
          >
            <div className="theme-mode-preview light-preview">
              <div className="preview-mini-sidebar" style={{ background: '#0f172a' }} />
              <div className="preview-mini-main" style={{ background: '#f4f7fb' }}>
                <div className="preview-mini-topbar" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }} />
                <div className="preview-mini-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }} />
              </div>
            </div>
            <div className="theme-mode-meta">
              <div className="flex items-center justify-between">
                <strong>Giao diện Sáng (Light Mode)</strong>
                {!dark && <Check size={16} className="text-emerald-500" />}
              </div>
              <small>Nền trắng ngọc trai dịu mắt, sắc nét và thanh lịch</small>
            </div>
          </div>

          {/* Dark Theme Card */}
          <div
            className={`theme-mode-card ${dark ? 'selected' : ''}`}
            onClick={() => handleToggleMode(true)}
          >
            <div className="theme-mode-preview dark-preview">
              <div className="preview-mini-sidebar" style={{ background: '#0a0a0f' }} />
              <div className="preview-mini-main" style={{ background: '#08080c' }}>
                <div className="preview-mini-topbar" style={{ background: '#101017', borderBottom: '1px solid rgba(255,255,255,0.08)' }} />
                <div className="preview-mini-card" style={{ background: '#101017', border: '1px solid rgba(255,255,255,0.08)' }} />
              </div>
            </div>
            <div className="theme-mode-meta">
              <div className="flex items-center justify-between">
                <strong>Giao diện Tối (Dark Mode)</strong>
                {dark && <Check size={16} className="text-purple-400" />}
              </div>
              <small>Đen huyền bí Obsidian, tương phản cao, phong cách Pro Developer</small>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Color Palette Selection */}
      <div className="admin-settings-section">
        <div className="settings-section-header">
          <div className="settings-icon-circle" style={{ color: PALETTES.find(p => p.id === palette)?.color }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3>Bảng Màu Giao Diện (Color Palette Presets)</h3>
            <p>Tùy biến màu sắc điểm nhấn, nút bấm, biểu đồ và icon theo phong cách riêng của bạn.</p>
          </div>
        </div>

        <div className="settings-palettes-grid">
          {PALETTES.map((p) => {
            const isSelected = palette === p.id
            return (
              <div
                key={p.id}
                className={`palette-card-option ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectPalette(p.id)}
              >
                <div className="palette-card-top">
                  <div className="palette-color-preview-bar" style={{ background: p.grad }} />
                  {isSelected && (
                    <span className="palette-active-pill">
                      <Check size={12} /> Đang dùng
                    </span>
                  )}
                </div>
                <div className="palette-card-body">
                  <div className="palette-card-title-row">
                    <span className="palette-dot-glow" style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                    <strong>{p.name}</strong>
                  </div>
                  <small>{p.desc}</small>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. System Infrastructure & Health Status */}
      <div className="admin-settings-section">
        <div className="settings-section-header">
          <div className="settings-icon-circle">
            <Server size={20} />
          </div>
          <div>
            <h3>Trạng Thái Hạ Tầng &amp; Dịch Vụ Đang Kết Nối</h3>
            <p>Thông tin chi tiết về các dịch vụ Cloud và AI đang vận hành hệ thống.</p>
          </div>
        </div>

        <div className="settings-services-grid">
          <div className="service-status-card">
            <div className="service-card-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <HardDrive size={20} />
            </div>
            <div className="service-card-info">
              <strong>Neon PostgreSQL Cloud</strong>
              <small>Serverless SQL Database • Singapore Region</small>
            </div>
            <span className="service-pill live">Hoạt động</span>
          </div>

          <div className="service-status-card">
            <div className="service-card-icon" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
              <Zap size={20} />
            </div>
            <div className="service-card-info">
              <strong>Groq Llama 3.3 70B &amp; Gemini Pro</strong>
              <small>AI Reasoning &amp; Chatbot Engine</small>
            </div>
            <span className="service-pill live">Hoạt động</span>
          </div>

          <div className="service-status-card">
            <div className="service-card-icon" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
              <Sparkles size={20} />
            </div>
            <div className="service-card-info">
              <strong>Microsoft Edge Neural TTS</strong>
              <small>Giọng đọc AI Hoài My • 100% Free Unlimited</small>
            </div>
            <span className="service-pill live">Hoạt động</span>
          </div>

          <div className="service-status-card">
            <div className="service-card-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
              <ShieldCheck size={20} />
            </div>
            <div className="service-card-info">
              <strong>Cloudinary Media Storage</strong>
              <small>Lưu trữ hình ảnh và hồ sơ CV đám mây</small>
            </div>
            <span className="service-pill live">Hoạt động</span>
          </div>
        </div>
      </div>
    </div>
  )
}
