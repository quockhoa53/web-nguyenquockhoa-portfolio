import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { KnowledgeDetailPage, KnowledgePage } from './pages/KnowledgeApiPages'
import { ProfilePage } from './pages/ProfilePage'
import { ProjectDetailPage, ProjectsPage } from './pages/ProjectPages'
import { WorkDetailPage, WorkProcessPage } from './pages/WorkApiPages'
import { NotFoundPage } from './pages/NotFoundPage'
import { EngagementPanel } from './features/engagement/EngagementPanel'
import { lazy, Suspense } from 'react'

const AdminLayout = lazy(() => import('./admin/AdminLayout').then(module => ({ default: module.AdminLayout })))
const AdminLoginPage = lazy(() => import('./admin/AdminLoginPage').then(module => ({ default: module.AdminLoginPage })))
const AdminDashboardPage = lazy(() => import('./admin/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })))
const AdminContentPage = lazy(() => import('./admin/AdminContentPage').then(module => ({ default: module.AdminContentPage })))
const AdminUsersPage = lazy(() => import('./admin/AdminUsersPage').then(module => ({ default: module.AdminUsersPage })))
const AdminResumesPage = lazy(() => import('./admin/AdminResumesPage').then(module => ({ default: module.AdminResumesPage })))
const AdminSettingsPage = lazy(() => import('./admin/AdminSettingsPage').then(module => ({ default: module.AdminSettingsPage })))

import { ToastProvider } from './components/common/ToastContext'

export default function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<div className="admin-loading-screen"><div className="admin-spinner" /></div>}><Routes>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="resumes" element={<AdminResumesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path=":section" element={<AdminContentPage />} />
        </Route>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailWithEngagement />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="knowledge/:slug" element={<KnowledgeDetailPage />} />
          <Route path="work-process" element={<WorkProcessPage />} />
          <Route path="work-process/:slug" element={<WorkDetailPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="index" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes></Suspense>
    </ToastProvider>
  )
}

function ProjectDetailWithEngagement() {
  const { id } = useParams()
  return <><ProjectDetailPage/><section className="section engagement-section"><div className="content-shell"><EngagementPanel type="project" id={id}/></div></section></>
}
