import { request } from './httpClient'

export const getPortfolio = () => request('/portfolio')
export const getProfile = () => request('/profile')
export const getSkills = () => request('/skills')
export const getExperiences = () => request('/experiences')
export const getProjects = () => request('/projects')
export const getProject = (id) => request(`/projects/${id}`)
export const getKnowledgeCategories = () => request('/knowledge/categories')
export const getKnowledgeArticles = () => request('/knowledge/articles')
export const getKnowledgeArticle = (slug) => request(`/knowledge/articles/${slug}`)
export const getWorkItems = () => request('/work-items')
export const getWorkItem = (slug) => request(`/work-items/${slug}`)
export const registerGuest = (data) => request('/guests', jsonOptions('POST', data))
export const likeKnowledge = (id) => request(`/knowledge/articles/${id}/like`, { method: 'PUT' })
export const unlikeKnowledge = (id) => request(`/knowledge/articles/${id}/like`, { method: 'DELETE' })
export const getKnowledgeComments = (id) => request(`/knowledge/articles/${id}/comments`)
export const commentKnowledge = (id, data) => request(`/knowledge/articles/${id}/comments`, jsonOptions('POST', data))
export const likeProject = (id) => request(`/projects/${id}/like`, { method: 'PUT' })
export const unlikeProject = (id) => request(`/projects/${id}/like`, { method: 'DELETE' })
export const getProjectComments = (id) => request(`/projects/${id}/comments`)
export const commentProject = (id, data) => request(`/projects/${id}/comments`, jsonOptions('POST', data))

function jsonOptions(method, data) {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}

export const sendContact = (data) => request('/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})

// Public Resumes & Download
export const getResumes = () => request('/resumes')
export const getPrimaryResume = () => request('/resumes/primary')
export const recordResumeDownload = (id) => request(`/resumes/${id}/download`, { method: 'POST' })
