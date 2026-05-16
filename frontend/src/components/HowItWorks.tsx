import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { VIEW, fadeUp } from '../lib/animate'

const MONTHLY_RATE = 0.08
const PLATFORM_CUT = 0.20

export default function HowItWorks() {
  const [deposit, setDeposit] = useState(1000)
  const [months, setMonths] = useState(12)

  const results = useMemo(() => {
    let balance = deposit
    let totalProfit = 0
    let totalFees = 0
    for (let i = 0; i < months; i++) {
      const profit = balance * MONTHLY_RATE
      const fee = profit * PLATFORM_CUT
      totalProfit += profit - fee
      totalFees += fee
      balance += profit - fee
    }
    return { finalBalance: balance, totalProfit, totalFees }
  }, [deposit, months])

  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n).toLocaleString()}`

  return (
    <section className="sec sec-v" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}>
        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>compounding calculator</p>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.9, letterSpacing: '-2px' }}>
          Watch your money<br />compound.
        </h2>
      </motion.div>

      <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}
        className="liquid-glass"
        style={{ borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        {/* Inputs */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Initial Deposit</label>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>{fmt(deposit)}</span>
            </div>
            <input
              type="range" min={100} max={100000} step={100} value={deposit}
              onChange={e => setDeposit(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0052FF', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>$100</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>$100k</span>
            </div>
          </div>

          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '12px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Time Period</label>
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#fff', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>{months}mo</span>
            </div>
            <input
              type="range" min={1} max={36} step={1} value={months}
              onChange={e => setMonths(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0052FF', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>1 month</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>36 months</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Final Balance', value: fmt(results.finalBalance), color: '#22C55E' },
            { label: 'Your Profit',   value: fmt(results.totalProfit),  color: '#fff' },
            { label: 'Platform Fee',  value: fmt(results.totalFees),    color: 'rgba(255,255,255,0.4)' },
          ].map(s => (
            <div key={s.label} style={{ flex: '1 1 120px', background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>{s.label}</p>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: '2rem', color: s.color, letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '12px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
          Based on ~8% avg monthly return. 20% profit share deducted each month. Past performance does not guarantee future results.
        </p>
      </motion.div>
    </section>
  )
}
