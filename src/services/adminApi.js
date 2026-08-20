import { request } from './httpClient'

const json = (method, data) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })

export const adminLogin = (data) => request('/admin/auth/login', json('POST', data))

export const adminVerify2Fa = async (data) => {
  const result = await request('/admin/auth/verify-2fa', json('POST', data))
  if (result && result.token) {
    localStorage.setItem('portfolio_admin_token', result.token)
  }
  return result
}

export const adminReset2Fa = () => request('/admin/auth/reset-2fa', { method: 'POST' })

export const checkAdminAccess = () => request('/admin/auth/access-check')
export const adminMe = () => request('/admin/auth/me')

export const adminLogout = async () => {
  try {
    await request('/admin/auth/logout', { method: 'POST' })
  } finally {
    localStorage.removeItem('portfolio_admin_token')
  }
}

export const getDashboard = () => request('/admin/dashboard')
export const getAdminArticles = () => request('/admin/knowledge/articles')
export const getAdminWorkItems = () => request('/admin/work-items')
export const getAdminComments = () => request('/admin/comments')
export const getAdminContacts = () => request('/admin/contacts')
export const getAdminGuests = () => request('/admin/guests')
export const getAdminLikes = () => request('/admin/likes')
export const getAdminAiFacts = () => request('/admin/ai-facts')
export const updateProfile = (data) => request('/admin/profile', json('PUT', data))
export const createAdminItem = (resource, data) => request(`/admin/${resource}`, json('POST', data))
export const updateAdminItem = (resource, id, data) => request(`/admin/${resource}/${id}`, json('PUT', data))
export const deleteAdminItem = (resource, id) => request(`/admin/${resource}/${id}`, { method: 'DELETE' })
export const moderateComment = (type, id, status) => request(`/admin/comments/${type}/${id}`, json('PATCH', { status }))

// Admin Users Management
export const getAdminUsers = () => request('/admin/users')
export const createAdminUser = (data) => request('/admin/users', json('POST', data))
export const updateAdminUser = (id, data) => request(`/admin/users/${id}`, json('PUT', data))
export const deleteAdminUser = (id) => request(`/admin/users/${id}`, { method: 'DELETE' })

// Global Allowed IPs Whitelist
export const getAllowedIps = () => request('/admin/allowed-ips')
export const createAllowedIp = (data) => request('/admin/allowed-ips', json('POST', data))
export const deleteAllowedIp = (id) => request(`/admin/allowed-ips/${id}`, { method: 'DELETE' })

// Resumes (CV) Management & Cloudinary Upload
export const getAdminResumes = () => request('/admin/resumes')
export const createAdminResume = (data) => request('/admin/resumes', json('POST', data))
export const updateAdminResume = (id, data) => request(`/admin/resumes/${id}`, json('PUT', data))
export const deleteAdminResume = (id) => request(`/admin/resumes/${id}`, { method: 'DELETE' })
export const setPrimaryResume = (id) => request(`/admin/resumes/${id}/primary`, { method: 'PUT' })

export const uploadFileToCloudinary = async (file, folder = 'portfolio/resumes') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  return request('/admin/uploads', {
    method: 'POST',
    body: formData,
  })
}
