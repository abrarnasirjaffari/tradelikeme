import { LayoutDashboard, Target, BarChart2, BookOpen, Bot, Wallet, Settings, FlaskConical } from 'lucide-react'

export type DashboardPage = 'overview' | 'positions' | 'trades' | 'strategy' | 'agent' | 'vault' | 'settings' | 'verification'

interface Props {
  activePage: DashboardPage
  onNavigate: (page: DashboardPage) => void
  user: { name?: string | null; email?: string | null; image?: string | null } | null
  agentStatus: 'running' | 'stopped' | 'scanning'
  openPositionCount: number
}

const navItems: { id: DashboardPage; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} /> },
  { id: 'positions', label: 'Positions', icon: <Target size={15} /> },
  { id: 'trades', label: 'Trades', icon: <BarChart2 size={15} /> },
  { id: 'strategy', label: 'Strategy', icon: <BookOpen size={15} /> },
  { id: 'agent', label: 'Agent', icon: <Bot size={15} /> },
  { id: 'vault', label: 'Vault', icon: <Wallet size={15} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={15} /> },
  { id: 'verification', label: 'Verification', icon: <FlaskConical size={15} /> },
]

export default function DashboardSidebar({ activePage, onNavigate, user, agentStatus, openPositionCount }: Props) {
  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .dash-sidebar {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 60px !important;
            flex-direction: row !important;
            border-right: none !important;
            border-top: 1px solid rgba(255,255,255,0.07) !important;
          }
          .dash-sidebar-logo { display: none !important; }
          .dash-sidebar-user { display: none !important; }
          .dash-nav-list {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-around !important;
            flex: 1 !important;
            overflow: visible !important;
            padding: 0 !important;
          }
          .dash-nav-item {
            flex: 1 !important;
            flex-direction: column !important;
            gap: 0.2rem !important;
            padding: 0.5rem 0.25rem !important;
            border-radius: 0 !important;
            margin: 0 !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .dash-nav-label { font-size: 9px !important; }
          .dash-nav-badge { display: none !important; }
        }
      `}</style>

      <div
        className="dash-sidebar"
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
        <div className="dash-sidebar-logo" style={{ padding: '1.5rem 1.25rem 1rem' }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.3px' }}>
            TradeLikeMe
          </span>
        </div>
        <div className="dash-sidebar-logo" style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 1rem' }} />

        <div
          className="dash-nav-list"
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
                className="dash-nav-item"
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
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
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
                  className="dash-nav-label"
                  style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13.5px' }}
                >
                  {item.label}
                </span>

                {item.id === 'positions' && openPositionCount > 0 && (
                  <span
                    className="dash-nav-badge"
                    style={{
                      marginLeft: 'auto',
                      fontFamily: "'Barlow', sans-serif",
                      fontWeight: 600,
                      fontSize: '10px',
                      background: '#0052FF',
                      color: '#fff',
                      borderRadius: 9999,
                      padding: '1px 7px',
                      minWidth: 18,
                      textAlign: 'center',
                    }}
                  >
                    {openPositionCount}
                  </span>
                )}

                {item.id === 'agent' && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background:
                        agentStatus === 'running'
                          ? '#22c55e'
                          : agentStatus === 'scanning'
                          ? '#60a5fa'
                          : 'rgba(255,255,255,0.3)',
                      boxShadow:
                        agentStatus === 'running'
                          ? '0 0 5px #22c55e'
                          : agentStatus === 'scanning'
                          ? '0 0 5px #60a5fa'
                          : 'none',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="dash-sidebar-user" style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 1rem' }} />
        <div
          className="dash-sidebar-user"
          style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#0052FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '12px', color: '#fff' }}>
              {(user?.name ?? user?.email ?? 'T').charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0 }}>
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 500,
                fontSize: '12.5px',
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name ?? user?.email?.split('@')[0] ?? 'trader'}
            </span>
            <span
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 300,
                fontSize: '11px',
                color: 'rgba(255,255,255,0.35)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email ?? ''}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
