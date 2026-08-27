import { createContext, useCallback, useContext, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, message, duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, message, duration }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg, dur) => addToast('success', msg, dur),
    error: (msg, dur) => addToast('error', msg, dur),
    warning: (msg, dur) => addToast('warning', msg, dur),
    info: (msg, dur) => addToast('info', msg, dur),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-${t.type} animate-toast-slide`}>
            <div className="toast-icon-wrap">
              {t.type === 'success' && <CheckCircle2 className="toast-icon success" size={18} />}
              {t.type === 'error' && <AlertCircle className="toast-icon error" size={18} />}
              {t.type === 'warning' && <AlertTriangle className="toast-icon warning" size={18} />}
              {t.type === 'info' && <Info className="toast-icon info" size={18} />}
            </div>
            <div className="toast-content">
              <strong className="toast-title">
                {t.type === 'success' ? 'Thành công' : t.type === 'error' ? 'Lỗi' : t.type === 'warning' ? 'Cảnh báo' : 'Thông báo'}
              </strong>
              <span className="toast-message">{t.message}</span>
            </div>
            <button className="toast-close" aria-label="Đóng" onClick={() => removeToast(t.id)}>
              <X size={14} />
            </button>
            <div
              className="toast-progress-bar"
              style={{ animationDuration: `${t.duration || 3500}ms` }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      success: (msg) => console.log('Toast Success:', msg),
      error: (msg) => console.error('Toast Error:', msg),
      warning: (msg) => console.warn('Toast Warning:', msg),
      info: (msg) => console.log('Toast Info:', msg),
    }
  }
  return context
}

