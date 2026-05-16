import { useState } from 'react'
import FadingVideo from '../../components/FadingVideo'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminOverview from '../../components/admin/AdminOverview'
import AdminUserManagement from '../../components/admin/AdminUserManagement'
import AdminApprovalQueue from '../../components/admin/AdminApprovalQueue'
import AdminAnalytics from '../../components/admin/AdminAnalytics'
import { useAuth } from '../../context/AuthContext'
import type { AdminPage as AdminPageType } from '../../components/admin/AdminSidebar'

const PAGE_TITLES: Record<AdminPageType, string> = {
  overview: 'Overview',
  users: 'User Management',
  approvals: 'Approval Queue',
  analytics: 'Analytics',
}

export default function AdminPage() {
  const { user } = useAuth()
  const [activePage, setActivePage] = useState<AdminPageType>('overview')

  function renderPage() {
    switch (activePage) {
      case 'overview':
        return <AdminOverview />
      case 'users':
        return <AdminUserManagement />
      case 'approvals':
        return <AdminApprovalQueue />
      case 'analytics':
        return <AdminAnalytics />
      default:
        return null
    }
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex' }}>
      <style>{`@media (max-width: 767px) { .admin-content { margin-left: 0 !important; padding-bottom: 70px !important; } }`}</style>

      {/* Background video */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{
          position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%',
          objectFit: 'cover', objectPosition: 'center top', zIndex: 0,
        }}
      />
      {/* Dark overlay */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'rgba(0,0,0,0.65)', pointerEvents: 'none' }} />

      {/* Sidebar */}
      <AdminSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
      />

      {/* Main content */}
      <div
        className="admin-content"
        style={{
          position: 'relative', zIndex: 1,
          marginLeft: 220, flex: 1,
          display: 'flex', flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Sticky header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 2rem',
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '15px',
              color: '#fff', margin: 0,
            }}>
              Admin — {PAGE_TITLES[activePage]}
            </h2>
            <p style={{
              fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px',
              color: 'rgba(255,255,255,0.35)', margin: 0,
            }}>
              {user?.name ?? user?.email?.split('@')[0] ?? 'admin'} · Admin access
            </p>
          </div>

          {/* ADMIN badge */}
          <span style={{
            fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px',
            color: '#ef4444', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 9999, padding: '5px 14px',
            letterSpacing: '0.08em',
          }}>
            ADMIN
          </span>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  )
}
