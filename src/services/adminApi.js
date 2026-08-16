import { request } from './httpClient'

const json = (method, data) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })

export const adminLogin = async (data) => {
  const result = await request('/admin/auth/login', json('POST', data))
  if (result && result.token) {
    localStorage.setItem('portfolio_admin_token', result.token)
  }
  return result
}

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
export const updateProfile = (data) => request('/admin/profile', json('PUT', data))
export const createAdminItem = (resource, data) => request(`/admin/${resource}`, json('POST', data))
export const updateAdminItem = (resource, id, data) => request(`/admin/${resource}/${id}`, json('PUT', data))
export const deleteAdminItem = (resource, id) => request(`/admin/${resource}/${id}`, { method: 'DELETE' })
export const moderateComment = (type, id, status) => request(`/admin/comments/${type}/${id}`, json('PATCH', { status }))
