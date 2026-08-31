const defaultApiUrl = `${window.location.protocol}//${window.location.hostname}:8080/api/v1`
export const API_BASE = (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/$/, '')
const API_URL = API_BASE

export async function request(path, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('portfolio_admin_token') : null
  const guestToken = typeof localStorage !== 'undefined' ? localStorage.getItem('portfolio_guest_token') : null
  const headers = { ...options.headers }
  if (token) {
    headers['X-Admin-Token'] = token
    headers['Authorization'] = `Bearer ${token}`
  }
  if (guestToken) {
    headers['X-Guest-Token'] = guestToken
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  })

  // Read response as text first to safely handle empty HTTP response bodies (e.g. 204 or void actions)
  const text = await response.text()
  let body = null
  if (text && text.trim().length > 0) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  // Handle HTTP Error status (4xx, 5xx)
  if (!response.ok) {
    const errMsg = (body && typeof body === 'object' && (body.message || body.error)) || 'Không thể kết nối máy chủ'
    const requestError = new Error(errMsg)
    requestError.status = response.status
    requestError.data = body
    throw requestError
  }

  if (response.status === 204 || body === null) return null

  // If response is wrapped in backend ApiResponse structure ({ success, message, data })
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) {
      const apiErr = new Error(body.message || 'Thao tác không thành công')
      apiErr.status = response.status
      apiErr.data = body.data
      throw apiErr
    }
    // Unwrap inner data payload if present, else fallback to message/body
    return body.data !== undefined ? body.data : body
  }

  return body
}
