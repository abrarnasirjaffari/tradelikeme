import { useState } from 'react'
import { Search } from 'lucide-react'

type Role = 'admin' | 'trader' | 'investor'
type Status = 'active' | 'banned'

interface MockUser {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  joinDate: string
  aum: string
  initials: string
}

const MOCK_USERS: MockUser[] = [
  { id: '1', name: 'Abrar Nasir', email: 'abrar@tradelikeme.xyz', role: 'admin', status: 'active', joinDate: 'Apr 6, 2026', aum: '$—', initials: 'AN' },
  { id: '2', name: 'Sarah Chen', email: 'sarah.chen@gmail.com', role: 'trader', status: 'active', joinDate: 'Apr 12, 2026', aum: '$48,200', initials: 'SC' },
  { id: '3', name: 'Marco Rossi', email: 'marco.r@outlook.com', role: 'investor', status: 'active', joinDate: 'Apr 14, 2026', aum: '$125,000', initials: 'MR' },
  { id: '4', name: 'James Keller', email: 'james.k@gmail.com', role: 'investor', status: 'active', joinDate: 'Apr 15, 2026', aum: '$32,500', initials: 'JK' },
  { id: '5', name: 'Priya Mehta', email: 'priya.m@yahoo.com', role: 'investor', status: 'active', joinDate: 'Apr 17, 2026', aum: '$200,000', initials: 'PM' },
  { id: '6', name: 'Alex Torres', email: 'alex_t@proton.me', role: 'trader', status: 'active', joinDate: 'Apr 19, 2026', aum: '$67,400', initials: 'AT' },
  { id: '7', name: 'Ben Walsh', email: 'ben.walsh@hotmail.com', role: 'investor', status: 'banned', joinDate: 'Apr 21, 2026', aum: '$8,000', initials: 'BW' },
  { id: '8', name: 'Nadia Okonkwo', email: 'nadia.ok@gmail.com', role: 'investor', status: 'active', joinDate: 'May 2, 2026', aum: '$15,800', initials: 'NO' },
]

const ROLE_COLORS: Record<Role, { bg: string; color: string }> = {
  admin: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  trader: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
  investor: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
}

type Filter = 'all' | Role

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'investor', label: 'Investor' },
  { id: 'trader', label: 'Trader' },
  { id: 'admin', label: 'Admin' },
]

export default function AdminUserManagement() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = MOCK_USERS.filter(u => {
    const matchFilter = filter === 'all' || u.role === filter
    const matchSearch = search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const total = MOCK_USERS.length
  const active = MOCK_USERS.filter(u => u.status === 'active').length
  const banned = MOCK_USERS.filter(u => u.status === 'banned').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Summary chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {[
          { label: `${total} total`, color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' },
          { label: `${active} active`, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
          { label: `${banned} banned`, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
        ].map(c => (
          <span key={c.label} style={{
            fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '12px',
            color: c.color, background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 9999, padding: '4px 12px',
          }}>{c.label}</span>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {/* Search */}
          <div style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '8px 14px',
          }}>
            <Search size={14} color="rgba(255,255,255,0.35)" />
            <input
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '13px',
                color: '#fff',
              }}
            />
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px',
                  color: filter === f.id ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: filter === f.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: `1px solid ${filter === f.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 9999, padding: '5px 14px', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >{f.label}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'AUM', 'Actions'].map(col => (
                  <th key={col} style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '11px',
                    color: 'rgba(255,255,255,0.35)', textAlign: 'left',
                    padding: '0 12px 10px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  {/* Avatar + Name */}
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: u.role === 'admin' ? '#ef4444' : u.role === 'trader' ? '#8b5cf6' : '#3b82f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: '#fff' }}>{u.initials}</span>
                      </div>
                      <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px', color: '#fff' }}>{u.name}</span>
                    </div>
                  </td>
                  {/* Email */}
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12.5px', color: 'rgba(255,255,255,0.5)' }}>{u.email}</span>
                  </td>
                  {/* Role badge */}
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{
                      fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '11px',
                      color: ROLE_COLORS[u.role].color,
                      background: ROLE_COLORS[u.role].bg,
                      borderRadius: 9999, padding: '3px 10px',
                      textTransform: 'capitalize',
                    }}>{u.role}</span>
                  </td>
                  {/* Status */}
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: u.status === 'active' ? '#22c55e' : '#ef4444',
                        display: 'block',
                      }} />
                      <span style={{
                        fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12.5px',
                        color: u.status === 'active' ? '#22c55e' : '#ef4444',
                        textTransform: 'capitalize',
                      }}>{u.status}</span>
                    </div>
                  </td>
                  {/* Join Date */}
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12.5px', color: 'rgba(255,255,255,0.4)' }}>{u.joinDate}</span>
                  </td>
                  {/* AUM */}
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: '#fff' }}>{u.aum}</span>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button style={{
                        fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '11.5px',
                        color: '#3b82f6',
                        background: 'rgba(59,130,246,0.1)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                      }}>View</button>
                      <select
                        defaultValue={u.role}
                        style={{
                          fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '11.5px',
                          color: 'rgba(255,255,255,0.6)',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                        }}
                      >
                        <option value="investor">Investor</option>
                        <option value="trader">Trader</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button style={{
                        fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '11.5px',
                        color: u.status === 'banned' ? '#22c55e' : '#ef4444',
                        background: u.status === 'banned' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                        border: `1px solid ${u.status === 'banned' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                      }}>{u.status === 'banned' ? 'Unban' : 'Ban'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', fontFamily: "'Barlow', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
              No users match your search.
            </div>
          )}
        </div>

        {/* Pagination stub */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
            Showing {filtered.length} of {total} users
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['← Prev', '1', 'Next →'].map(label => (
              <button key={label} style={{
                fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px',
                color: label === '1' ? '#fff' : 'rgba(255,255,255,0.45)',
                background: label === '1' ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
