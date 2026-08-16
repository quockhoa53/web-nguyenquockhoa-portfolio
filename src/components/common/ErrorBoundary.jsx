import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 24px',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #fee2e2',
          margin: '24px auto',
          maxWidth: '600px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
        }}>
          <AlertTriangle style={{ width: '44px', height: '44px', color: '#ef4444', marginBottom: '14px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
            Đã xảy ra lỗi khi hiển thị trang
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
            {this.state.error?.message || 'Không thể tải thông tin. Vui lòng thử tải lại trang.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              background: '#6366f1',
              color: '#ffffff',
              border: 0,
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw style={{ width: '15px', height: '15px' }} /> Tải lại trang
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
