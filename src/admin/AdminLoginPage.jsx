import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  LockKeyhole,
  ShieldCheck,
  UserRound,
  KeyRound,
  QrCode,
  Copy,
  Check,
  ArrowLeft,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react'
import { adminLogin, adminVerify2Fa } from '../services/adminApi'
import { useToast } from '../components/common/ToastContext'

export function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [step, setStep] = useState(1) // 1: Credentials, 2: 2FA TOTP
  const [showPassword, setShowPassword] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [totpData, setTotpData] = useState({
    preAuthToken: '',
    isSetup: false,
    totpSecret: '',
    otpAuthUri: '',
    username: ''
  })
  const [otpCode, setOtpCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  // Step 1: Submit Username & Password
  async function submitCredentials(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await adminLogin(form)
      if (res && res.requiresTotp) {
        setTotpData({
          preAuthToken: res.preAuthToken,
          isSetup: res.isSetup || false,
          totpSecret: res.totpSecret || '',
          otpAuthUri: res.otpAuthUri || '',
          username: res.username
        })
        setStep(2)
        toast.info(
          res.isSetup
            ? 'Vui lòng quét mã QR vào Google Authenticator để thiết lập 2FA!'
            : 'Vui lòng nhập mã OTP từ ứng dụng Google Authenticator trên điện thoại.'
        )
      } else if (res && res.token) {
        toast.success('Đăng nhập thành công!')
        navigate('/admin')
      }
    } catch (err) {
      const errMsg = err.message || 'Tên đăng nhập hoặc mật khẩu không chính xác'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Submit 6-digit TOTP Code
  async function submit2Fa(e) {
    e.preventDefault()
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã xác thực.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await adminVerify2Fa({
        preAuthToken: totpData.preAuthToken,
        code: otpCode.trim()
      })
      toast.success('Xác thực 2FA thành công! Chào mừng bạn quay trở lại.')
      navigate('/admin')
    } catch (err) {
      const errMsg = err.message || 'Mã xác thực 2FA không chính xác hoặc đã hết hạn.'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  function handleCopySecret() {
    if (totpData.totpSecret) {
      navigator.clipboard.writeText(totpData.totpSecret)
      setCopied(true)
      toast.success('Đã sao chép khóa bí mật 2FA vào clipboard!')
      setTimeout(() => setCopied(false), 2500)
    }
  }

  function handleBackToStep1() {
    setStep(1)
    setOtpCode('')
    setError('')
  }

  return (
    <main className="admin-login">
      <div className="login-glow" />

      {step === 1 ? (
        <form onSubmit={submitCredentials} className="reveal">
          <div className="login-shield">
            <ShieldCheck size={32} />
          </div>
          <h1>Admin Portal</h1>
          <p className="login-subtitle">
            Hệ thống quản trị bảo mật 2 lớp (2FA / Google Authenticator)
          </p>

          <label>
            Tên đăng nhập
            <div>
              <UserRound size={18} />
              <input
                required
                autoComplete="username"
                placeholder="Nhập username quản trị..."
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
              />
            </div>
          </label>

          <label>
            Mật khẩu
            <div>
              <LockKeyhole size={18} />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu..."
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && <span className="admin-error">{error}</span>}

          <button type="submit" disabled={loading} className="login-btn-primary">
            {loading ? 'Đang xác thực tài khoản…' : 'Tiếp tục với 2FA →'}
          </button>
        </form>
      ) : (
        <form onSubmit={submit2Fa} className="reveal totp-form-step">
          <div className="login-shield totp-shield">
            <Smartphone size={30} />
          </div>

          <h1>Xác Thực 2 Lớp (2FA)</h1>
          <p className="login-subtitle">
            Tài khoản: <strong>{totpData.username}</strong>
          </p>

          {totpData.isSetup ? (
            <div className="totp-setup-card">
              <div className="totp-badge">
                <QrCode size={14} /> Thiết lập lần đầu
              </div>
              <p className="totp-instruction">
                1. Mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Microsoft Authenticator</strong> trên điện thoại.
                <br />
                2. Quét mã QR dưới đây (hoặc nhập khóa bí mật):
              </p>

              <div className="qr-code-wrapper">
                {totpData.otpAuthUri ? (
                  <QRCodeSVG
                    value={totpData.otpAuthUri}
                    size={168}
                    bgColor="#ffffff"
                    fgColor="#0a0f1d"
                    level="Q"
                    includeMargin
                  />
                ) : null}
              </div>

              <div className="secret-copy-box">
                <span className="secret-label">Khóa bí mật dự phòng (Nhập thủ công nếu không quét được QR):</span>
                <div className="secret-row">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    readOnly
                    value={totpData.totpSecret}
                    className="secret-input font-mono"
                    aria-label="Khóa bí mật 2FA"
                  />
                  <button
                    type="button"
                    className="secret-action-btn"
                    onClick={() => setShowSecret(!showSecret)}
                    title={showSecret ? 'Ẩn mã khóa' : 'Xem mã khóa'}
                  >
                    {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    type="button"
                    className="secret-action-btn"
                    onClick={handleCopySecret}
                    title="Sao chép khóa bí mật"
                  >
                    {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="totp-prompt-card">
              <p className="totp-instruction">
                Mở ứng dụng <strong>Google Authenticator</strong> trên điện thoại của bạn và nhập mã OTP 6 số:
              </p>
            </div>
          )}

          <label className="otp-input-label">
            Nhập mã OTP 6 số
            <div className="otp-input-wrapper">
              <KeyRound size={20} />
              <input
                required
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoFocus
                placeholder="• • • • • •"
                className="otp-code-input font-mono"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
          </label>

          {error && <span className="admin-error">{error}</span>}

          <button type="submit" disabled={loading || otpCode.length !== 6} className="login-btn-primary">
            {loading ? 'Đang kiểm tra mã 2FA…' : totpData.isSetup ? 'Kích hoạt 2FA & Đăng nhập' : 'Xác nhận & Vào Dashboard'}
          </button>

          <button
            type="button"
            className="login-back-btn"
            onClick={handleBackToStep1}
            disabled={loading}
          >
            <ArrowLeft size={15} /> Quay lại đăng nhập tài khoản khác
          </button>
        </form>
      )}
    </main>
  )
}
