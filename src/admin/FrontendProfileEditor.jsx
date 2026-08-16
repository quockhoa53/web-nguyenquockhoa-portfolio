import { Check, Code2, Edit3, Eye, FolderKanban, LoaderCircle, Plus, Settings2, Sparkles, Trash2, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '../components/common/ToastContext'
import { adminMe, createAdminItem, deleteAdminItem, updateAdminItem, updateProfile } from '../services/adminApi'
import { getProjects, getSkills } from '../services/portfolioApi'
import { RichEditor } from './RichEditor'

const SKILL_CATEGORIES = [
  'Backend & Architecture',
  'Database',
  'Data Processing',
  'AI & Tools'
]

export function FrontendProfileEditor({ profile, onSaved }) {
  const [admin, setAdmin] = useState(null)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'projects' | 'skills'
  const toast = useToast()

  // Forms & State
  const [profileForm, setProfileForm] = useState(profile)
  const [projectsList, setProjectsList] = useState([])
  const [skillsList, setSkillsList] = useState([])

  // Skill Add Form State
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Backend & Architecture', proficiency: 85, displayOrder: 1 })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    adminMe().then(setAdmin).catch(() => setAdmin(false))
  }, [])

  useEffect(() => setProfileForm(profile), [profile])

  useEffect(() => {
    if (editing) {
      getProjects().then(setProjectsList).catch(() => {})
      getSkills().then(setSkillsList).catch(() => {})
    }
  }, [editing])

  if (!admin) return null

  // Count selected featured projects
  const featuredCount = projectsList.filter((p) => p.featured).length

  function toggleProjectFeatured(id) {
    setProjectsList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.featured
          if (nextState && featuredCount >= 3) {
            toast.info('Bạn chỉ nên chọn tối đa 3 dự án nổi bật hiển thị trên trang chủ.')
          }
          return { ...p, featured: nextState }
        }
        return p
      })
    )
  }

  async function handleAddSkill(e) {
    e.preventDefault()
    if (!newSkill.name.trim()) return
    try {
      setSaving(true)
      const createdId = await createAdminItem('skills', newSkill)
      setSkillsList((prev) => [...prev, { ...newSkill, id: createdId }])
      setNewSkill({ name: '', category: newSkill.category, proficiency: 85, displayOrder: skillsList.length + 2 })
      toast.success('Đã thêm kỹ năng mới thành công!')
      setMessage('Đã thêm kỹ năng mới!')
    } catch (err) {
      toast.error('Lỗi khi thêm kỹ năng: ' + (err.message || 'Có lỗi xảy ra'))
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSkill(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa kỹ năng này?')) return
    try {
      setSaving(true)
      await deleteAdminItem('skills', id)
      setSkillsList((prev) => prev.filter((s) => s.id !== id))
      toast.success('Đã xóa kỹ năng thành công!')
      setMessage('Đã xóa kỹ năng.')
    } catch (err) {
      toast.error('Lỗi khi xóa kỹ năng: ' + (err.message || 'Có lỗi xảy ra'))
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveAll(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      // 1. Update profile
      await updateProfile(profileForm)

      // 2. Update projects featured status
      for (const p of projectsList) {
        await updateAdminItem('projects', p.id, p)
      }

      // 3. Update skills
      for (const s of skillsList) {
        await updateAdminItem('skills', s.id, s)
      }

      toast.success('Lưu toàn bộ dữ liệu Web IDE thành công!')
      setMessage('Đã lưu dữ liệu Web IDE thành công!')
      setEditing(false)
      if (onSaved) onSaved()
    } catch (err) {
      toast.error('Lưu dữ liệu thất bại: ' + (err.message || 'Có lỗi xảy ra'))
      setMessage(err.message || 'Không thể lưu thay đổi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Floating Web IDE trigger button for logged in Admin */}
      <div className="web-ide-trigger">
        <button type="button" onClick={() => setEditing(true)} title="Mở Web IDE Live Editor">
          <Sparkles />
          <span>
            <small>WEB IDE MODE</small>
            <b>Chỉnh sửa trang chủ</b>
          </span>
        </button>
      </div>

      {/* Modal Web IDE */}
      {editing && (
        <div className="frontend-editor-modal">
          <form className="frontend-editor-card" onSubmit={saveAll}>
            <header>
              <div className="frontend-editor-title">
                <i>
                  <Code2 />
                </i>
                <div>
                  <small>LIVE HOMEPAGE EDITOR</small>
                  <h2>Web IDE Mode</h2>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="web-ide-tabs">
                <button
                  type="button"
                  className={activeTab === 'profile' ? 'active' : ''}
                  onClick={() => setActiveTab('profile')}
                >
                  <UserRound /> Profile & Liên hệ
                </button>
                <button
                  type="button"
                  className={activeTab === 'projects' ? 'active' : ''}
                  onClick={() => setActiveTab('projects')}
                >
                  <FolderKanban /> Chọn 3 Dự án ({featuredCount}/3)
                </button>
                <button
                  type="button"
                  className={activeTab === 'skills' ? 'active' : ''}
                  onClick={() => setActiveTab('skills')}
                >
                  <Settings2 /> Năng lực kỹ thuật ({skillsList.length})
                </button>
              </div>

              <div className="frontend-editor-actions">
                <a href="/profile" target="_blank" rel="noreferrer">
                  <Eye /> Xem Profile
                </a>
                <button type="button" onClick={() => setEditing(false)}>
                  <X />
                </button>
              </div>
            </header>

            {/* Content Body */}
            <div className="frontend-editor-body">
              {/* TAB 1: PROFILE */}
              {activeTab === 'profile' && (
                <>
                  <aside>
                    <span>THÔNG TIN PROFILE & LIÊN HỆ</span>
                    <label>
                      Họ và tên
                      <input
                        value={profileForm.fullName || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      />
                    </label>
                    <label>
                      Chức danh
                      <input
                        value={profileForm.headline || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                      />
                    </label>
                    <label>
                      Email liên hệ
                      <input
                        type="email"
                        value={profileForm.email || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </label>
                    <label>
                      Số điện thoại
                      <input
                        value={profileForm.phone || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </label>
                    <label>
                      Địa chỉ / Tỉnh thành
                      <input
                        value={profileForm.location || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      />
                    </label>
                    <label>
                      Link Facebook (URL)
                      <input
                        placeholder="https://facebook.com/..."
                        value={profileForm.facebookUrl || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, facebookUrl: e.target.value })}
                      />
                    </label>
                    <label>
                      Link GitHub (URL)
                      <input
                        placeholder="https://github.com/..."
                        value={profileForm.githubUrl || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                      />
                    </label>
                    <label>
                      Link LinkedIn (URL)
                      <input
                        placeholder="https://linkedin.com/..."
                        value={profileForm.linkedinUrl || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                      />
                    </label>
                    <label>
                      Ảnh đại diện (URL)
                      <input
                        value={profileForm.avatarUrl || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                      />
                    </label>
                    <div className="frontend-editor-hint">
                      <b>Đồng bộ dữ liệu</b>
                      <p>
                        Thay đổi thông tin liên hệ và bio sẽ tự động đồng bộ lên Trang chủ, Contact và Footer.
                      </p>
                    </div>
                  </aside>

                  <main>
                    <section className="frontend-editor-section">
                      <div>
                        <b>1. Mô tả ngắn Hero</b>
                        <p>Hiển thị trực tiếp trên hero banner trang chủ (khuyên dùng từ 1-3 câu)</p>
                      </div>
                      <textarea
                        rows="3"
                        maxLength="600"
                        value={profileForm.shortBio || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, shortBio: e.target.value })}
                        placeholder="Nhập mô tả ngắn gọn, súc tích hiển thị ở trang chủ..."
                      />
                      <small className="field-counter">{(profileForm.shortBio || '').length}/600 ký tự</small>
                    </section>

                    <section className="frontend-editor-section">
                      <div>
                        <b>2. Nội dung Profile chi tiết</b>
                        <p>Trình bày bài viết giới thiệu bản thân chi tiết trên trang /profile</p>
                      </div>
                      <RichEditor
                        value={profileForm.bio || ''}
                        onChange={(bio) => setProfileForm({ ...profileForm, bio })}
                        placeholder="Nội dung giới thiệu chi tiết (hỗ trợ định dạng rich text, headings, lists)..."
                      />
                    </section>
                  </main>
                </>
              )}

              {/* TAB 2: CHỌN 3 DỰ ÁN NỔI BẬT */}
              {activeTab === 'projects' && (
                <>
                  <aside>
                    <span>Dự án nổi bật trên trang chủ</span>
                    <div className="web-ide-stats-card">
                      <b>{featuredCount} / 3</b>
                      <small>Dự án được chọn làm Featured</small>
                    </div>
                    <p className="frontend-editor-aside-desc">
                      Tích chọn tối đa 3 dự án bạn muốn gây ấn tượng mạnh nhất với nhà tuyển dụng / khách hàng tại phần <b>Dự án nổi bật</b> trên trang chủ.
                    </p>
                    <div className="frontend-editor-hint">
                      <p>Nhấp trực tiếp vào thẻ hoặc nút <b>⭐ Chọn nổi bật</b> để bật/tắt hiển thị.</p>
                    </div>
                  </aside>

                  <main>
                    <div className="web-ide-tab-header">
                      <div>
                        <h3>Chọn 3 Dự án xuất sắc nhất</h3>
                        <p>Trang chủ sẽ hiển thị các dự án có nhãn "Nổi bật". Bạn có thể quản lý nhanh tại đây.</p>
                      </div>
                    </div>

                    <div className="web-ide-projects-grid">
                      {projectsList.map((project) => {
                        const isFeatured = !!project.featured
                        return (
                          <div
                            key={project.id}
                            className={`web-ide-project-card ${isFeatured ? 'featured' : ''}`}
                            onClick={() => toggleProjectFeatured(project.id)}
                          >
                            <div className="web-ide-project-thumb">
                              {project.imageUrl ? (
                                <img src={project.imageUrl} alt={project.title} />
                              ) : (
                                <div className="web-ide-project-placeholder">
                                  <FolderKanban />
                                </div>
                              )}
                              <span className={`web-ide-featured-badge ${isFeatured ? 'active' : ''}`}>
                                {isFeatured ? '⭐ Đang hiển thị' : '○ Ẩn khỏi trang chủ'}
                              </span>
                            </div>
                            <div className="web-ide-project-info">
                              <h4>{project.title}</h4>
                              <p>{project.description?.replace(/<[^>]*>/g, '').slice(0, 80)}...</p>
                              <div className="web-ide-project-meta">
                                <span>Thứ tự: {project.displayOrder}</span>
                                <button
                                  type="button"
                                  className={`btn-toggle-featured ${isFeatured ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleProjectFeatured(project.id)
                                  }}
                                >
                                  {isFeatured ? 'Bỏ chọn' : '⭐ Chọn nổi bật'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </main>
                </>
              )}

              {/* TAB 3: NĂNG LỰC KỸ THUẬT */}
              {activeTab === 'skills' && (
                <>
                  <aside>
                    <span>Thêm Kỹ Năng Mới</span>
                    <form onSubmit={handleAddSkill}>
                      <label>
                        Tên kỹ năng
                        <input
                          placeholder="Vd: Spring Boot, PostgreSQL, Redis..."
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                        />
                      </label>
                      <label>
                        Nhóm kỹ năng
                        <select
                          value={newSkill.category}
                          onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        >
                          {SKILL_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Mức độ thành thạo: <b>{newSkill.proficiency}%</b>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={newSkill.proficiency}
                          onChange={(e) => setNewSkill({ ...newSkill, proficiency: Number(e.target.value) })}
                        />
                      </label>
                      <button type="submit" className="btn primary" style={{ width: '100%', marginTop: '12px' }}>
                        <Plus /> Thêm kỹ năng
                      </button>
                    </form>
                  </aside>

                  <main>
                    <div className="web-ide-tab-header">
                      <div>
                        <h3>Kỹ năng hiển thị trên Trang chủ & Profile</h3>
                        <p>Kéo trượt mức độ thành thạo (%) hoặc sửa trực tiếp tên kỹ năng.</p>
                      </div>
                    </div>

                    <div className="web-ide-skills-list">
                      {skillsList.map((skill, index) => (
                        <div key={skill.id || index} className="web-ide-skill-item">
                          <div className="web-ide-skill-meta">
                            <input
                              className="input-inline"
                              value={skill.name}
                              onChange={(e) => {
                                const val = e.target.value
                                setSkillsList((prev) => prev.map((s) => (s.id === skill.id ? { ...s, name: val } : s)))
                              }}
                            />
                            <select
                              className="select-inline"
                              value={skill.category}
                              onChange={(e) => {
                                const val = e.target.value
                                setSkillsList((prev) => prev.map((s) => (s.id === skill.id ? { ...s, category: val } : s)))
                              }}
                            >
                              {SKILL_CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="web-ide-skill-slider">
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={skill.proficiency}
                              onChange={(e) => {
                                const val = Number(e.target.value)
                                setSkillsList((prev) => prev.map((s) => (s.id === skill.id ? { ...s, proficiency: val } : s)))
                              }}
                            />
                            <span>{skill.proficiency}%</span>
                            <button
                              type="button"
                              className="btn-icon danger"
                              title="Xóa kỹ năng"
                              onClick={() => handleDeleteSkill(skill.id)}
                            >
                              <Trash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </main>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <footer>
              <span className={message ? 'visible' : ''}>{message}</span>
              <button type="button" onClick={() => setEditing(false)}>
                Hủy
              </button>
              <button className="frontend-save" disabled={saving}>
                {saving ? <LoaderCircle className="spin" /> : <Check />}
                {saving ? 'Đang lưu Web IDE…' : 'Lưu & Cập nhật trang chủ'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </>
  )
}
