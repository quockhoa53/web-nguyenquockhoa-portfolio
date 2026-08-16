import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin, checkAdminAccess } from '../services/adminApi'
import { AdminAccessDenied } from './AdminAccessDenied'

import { useToast } from '../components/common/ToastContext'

export function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [access, setAccess] = useState({ loading: true, allowed: false, ip: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    checkAdminAccess()
      .then(result => setAccess({ loading: false, ...result }))
      .catch(() => setAccess({ loading: false, allowed: false, ip: 'Không xác định' }))
  }, [])

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await adminLogin(form)
      toast.success('Đăng nhập quản trị thành công!')
      navigate('/admin')
    } catch (requestError) {
      if (requestError.status === 403) {
        setAccess(current => ({ ...current, allowed: false }))
        toast.error('Địa chỉ IP của bạn không có quyền truy cập!')
      } else {
        const errMsg = requestError.message || 'Tên đăng nhập hoặc mật khẩu không chính xác'
        setError(errMsg)
        toast.error('Đăng nhập thất bại: ' + errMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  if (access.loading) return <div className="admin-loading">Đang kiểm tra IP Wi-Fi…</div>
  if (!access.allowed) return <AdminAccessDenied ip={access.ip} />

  return (
    <main className="admin-login">
      <div className="login-glow" />
      <form onSubmit={submit}>
        <div className="login-shield"><ShieldCheck /></div>
        <h1>Admin Portal</h1>
        <p>IP {access.ip} đã được cấp quyền. Vui lòng đăng nhập để tiếp tục.</p>
        <label>Tên đăng nhập<div><UserRound /><input required autoComplete="username" value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} /></div></label>
        <label>Mật khẩu<div><LockKeyhole /><input required type="password" autoComplete="current-password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /></div></label>
        {error && <span className="admin-error">{error}</span>}
        <button disabled={loading}>{loading ? 'Đang xác thực…' : 'Đăng nhập bảo mật'}</button>
        <small>IP được kiểm tra lại trên mọi yêu cầu quản trị</small>
      </form>
    </main>
  )
}
