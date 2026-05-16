import { LayoutDashboard, Users, CheckSquare, BarChart3 } from 'lucide-react'

export type AdminPage = 'overview' | 'users' | 'approvals' | 'analytics'

interface Props {
  activePage: AdminPage
  onNavigate: (page: AdminPage) => void
  user: { name?: string | null; email?: string | null; image?: string | null } | null
}

const navItems: { id: AdminPage; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} /> },
  { id: 'users', label: 'Users', icon: <Users size={15} /> },
  { id: 'approvals', label: 'Approvals', icon: <CheckSquare size={15} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={15} /> },
]

export default function AdminSidebar({ activePage, onNavigate, user }: Props) {
  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .admin-sidebar {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 60px !important;
            flex-direction: row !important;
            border-right: none !important;
            border-top: 1px solid rgba(255,255,255,0.07) !important;
          }
          .admin-sidebar-logo { display: none !important; }
          .admin-sidebar-user { display: none !important; }
          .admin-nav-list {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-around !important;
            flex: 1 !important;
            overflow: visible !important;
            padding: 0 !important;
          }
          .admin-nav-item {
            flex: 1 !important;
            flex-direction: column !important;
            gap: 0.2rem !important;
            padding: 0.5rem 0.25rem !important;
            border-radius: 0 !important;
            margin: 0 !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .admin-nav-label { font-size: 9px !important; }
        }
      `}</style>

      <div
        className="admin-sidebar"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 220,
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div className="admin-sidebar-logo" style={{ padding: '1.5rem 1.25rem 0.75rem' }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.3px' }}>
            TradeLikeMe
          </span>
          <div style={{ marginTop: 4 }}>
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 700,
              fontSize: '10px',
              color: '#ef4444',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Admin Panel
            </span>
          </div>
        </div>
        <div className="admin-sidebar-logo" style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.5rem 1rem 0' }} />

        {/* Nav */}
        <div
          className="admin-nav-list"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem 0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {navItems.map((item) => {
            const isActive = activePage === item.id
            return (
              <button
                key={item.id}
                className="admin-nav-item"
                onClick={() => onNavigate(item.id)}
                style={{
                  padding: '0.65rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderRadius: '0.75rem',
                  margin: '0.15rem 0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: isActive ? 'rgba(239,68,68,0.12)' : 'transparent',
                  color: isActive ? '#ef4444' : 'rgba(255,255,255,0.45)',
                  width: 'calc(100% - 1.5rem)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'
                  }
                }}
              >
                {item.icon}
                <span
                  className="admin-nav-label"
                  style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13.5px' }}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* User footer */}
        <div className="admin-sidebar-user" style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 1rem' }} />
        <div
          className="admin-sidebar-user"
          style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '12px', color: '#fff' }}>
              {(user?.name ?? user?.email ?? 'A').charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0 }}>
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 500,
              fontSize: '12.5px',
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.name ?? user?.email?.split('@')[0] ?? 'admin'}
            </span>
            <span style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              fontSize: '11px',
              color: 'rgba(255,255,255,0.35)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.email ?? ''}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
