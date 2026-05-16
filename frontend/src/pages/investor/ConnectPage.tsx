import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: 24,
  marginBottom: '1rem',
  fontFamily: "'Barlow', sans-serif",
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'Barlow', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  color: 'rgba(255,255,255,0.5)',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '10px 14px',
  color: '#fff',
  fontFamily: "'Barlow', sans-serif",
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

const blueBtnStyle: React.CSSProperties = {
  background: '#3b82f6',
  border: 'none',
  borderRadius: 8,
  padding: '10px 20px',
  color: '#fff',
  fontFamily: "'Barlow', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

const disabledBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '10px 20px',
  color: 'rgba(255,255,255,0.3)',
  fontFamily: "'Barlow', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: 'not-allowed',
}

const securityNote: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginTop: 12,
  fontSize: 12,
  color: 'rgba(255,255,255,0.4)',
  fontFamily: "'Barlow', sans-serif",
}

type Exchange = 'WEEX' | 'Bybit' | 'Binance'

export default function ConnectPage() {
  const [activeTab, setActiveTab] = useState<'solana' | 'cex'>('solana')
  const [walletConnected, setWalletConnected] = useState(false)
  const [activeExchange, setActiveExchange] = useState<Exchange>('WEEX')
  const [depositAmount, setDepositAmount] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')

  const exchanges: Exchange[] = ['WEEX', 'Bybit', 'Binance']

  const guideLinks: Record<Exchange, string> = {
    WEEX: 'https://support.weex.com/en/articles/api-key-creation',
    Bybit: 'https://www.bybit.com/en/help-center/article/How-to-create-your-API-key',
    Binance: 'https://www.binance.com/en/support/faq/how-to-create-api-360002502072',
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', paddingTop: '1rem' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 8 }}>
            Connect Your Account
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Choose how you want to trade. You can switch or add modes anytime.
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { key: 'solana' as const, label: '🔷 Solana Vault' },
            { key: 'cex' as const, label: '🏦 CEX API Keys' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
                padding: '0.75rem 1.25rem',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Barlow', sans-serif",
                color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SOLANA TAB ── */}
        {activeTab === 'solana' && (
          <div>
            {/* Step 1 */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#9945FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  👻
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                    Step 1
                  </div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>Connect Phantom Wallet</h3>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
                Connect your Solana wallet. The agent will be delegated trade-only access — it can never withdraw your funds.
              </p>
              {!walletConnected ? (
                <button
                  onClick={() => setWalletConnected(true)}
                  style={{
                    background: '#9945FF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '11px 22px',
                    color: '#fff',
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Connect Phantom Wallet
                </button>
              ) : (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(153,69,255,0.12)', border: '1px solid rgba(153,69,255,0.3)',
                  borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#c084fc',
                }}>
                  ✓ Wallet connected: HgcX7tJ...awP7F
                </div>
              )}
              <div style={securityNote}>
                🔒 Trade-only delegation. No withdrawal access ever.
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ ...cardStyle, opacity: walletConnected ? 1 : 0.45 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Step 2
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: 16, fontWeight: 700, color: '#fff' }}>Delegate to Agent</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
                Sign a delegation transaction to authorize the TradeLikeMe agent to trade on your behalf using Drift Protocol.
              </p>
              <button
                disabled={!walletConnected}
                style={walletConnected ? blueBtnStyle : disabledBtnStyle}
              >
                Sign Delegation TX
              </button>
            </div>

            {/* Step 3 */}
            <div style={{ ...cardStyle, opacity: walletConnected ? 1 : 0.45 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Step 3
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: 16, fontWeight: 700, color: '#fff' }}>Deposit USDC</h3>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Amount (USDC)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    disabled={!walletConnected}
                    style={{ ...inputStyle, opacity: walletConnected ? 1 : 0.5 }}
                  />
                </div>
                <button
                  disabled={!walletConnected || !depositAmount}
                  style={walletConnected && depositAmount ? blueBtnStyle : disabledBtnStyle}
                >
                  Deposit
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                Minimum deposit: $100 USDC. Withdrawals available anytime (30-day window).
              </p>
            </div>
          </div>
        )}

        {/* ── CEX TAB ── */}
        {activeTab === 'cex' && (
          <div>
            {/* Exchange selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
              {exchanges.map(ex => (
                <button
                  key={ex}
                  onClick={() => setActiveExchange(ex)}
                  style={{
                    background: 'none',
                    border: activeExchange === ex ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    padding: '8px 20px',
                    color: activeExchange === ex ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* API Key form */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                {activeExchange} API Keys
              </h3>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>API Key</label>
                <input
                  type="text"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>API Secret</label>
                <input
                  type="password"
                  placeholder="Enter your API secret"
                  value={apiSecret}
                  onChange={e => setApiSecret(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Permission checklist */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Required Permissions
                </div>
                {[
                  { icon: '✅', label: 'Futures Trading', ok: true },
                  { icon: '✅', label: 'Read Account', ok: true },
                  { icon: '❌', label: 'Withdrawals', ok: false, note: 'We never request this' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13 }}>
                    <span>{item.icon}</span>
                    <span style={{ color: item.ok ? 'rgba(255,255,255,0.7)' : '#ef4444', textDecoration: item.ok ? 'none' : 'line-through' }}>
                      {item.label}
                    </span>
                    {item.note && (
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>— {item.note}</span>
                    )}
                  </div>
                ))}
              </div>

              <button
                style={{ ...blueBtnStyle, width: '100%', padding: '12px', fontSize: 15 }}
              >
                Connect {activeExchange}
              </button>

              <div style={securityNote}>
                🔒 Keys are encrypted with AES-256. We only request futures trading + read permissions.
              </div>
            </div>

            {/* Guide link */}
            <div style={{ marginTop: 8 }}>
              <a
                href={guideLinks[activeExchange]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b82f6', fontSize: 13, textDecoration: 'none', fontFamily: "'Barlow', sans-serif" }}
                onMouseEnter={e => { (e.target as HTMLAnchorElement).style.textDecoration = 'underline' }}
                onMouseLeave={e => { (e.target as HTMLAnchorElement).style.textDecoration = 'none' }}
              >
                How to create a trade-only API key on {activeExchange} →
              </a>
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}
