import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocDivider } from '../DocComponents'

const terms: { term: string; definition: string }[] = [
  { term: 'Supply/Demand Zone (S/D Zone)', definition: 'A price area where the market previously showed a strong imbalance between buyers and sellers. Supply zones are areas of prior selling pressure; demand zones are areas of prior buying pressure. The strategy enters when price returns to these zones.' },
  { term: 'Body-close Stop Loss', definition: 'A stop loss triggered only when a candle BODY closes past the SL level — not when the wick touches it. Wicks past SL are treated as stop hunts and ignored. This is the primary risk management mechanic on TradeLikeMe.' },
  { term: 'Stop Hunt / Wick', definition: 'A momentary price spike below a stop loss level that immediately reverses. Market makers often hunt stops before reversing direction. Body-close SL logic ignores these wicks.' },
  { term: 'Sentinel', definition: 'A lightweight WebSocket price watcher that runs 24/7 and uses zero AI tokens. It monitors prices and wakes the agent only when a meaningful event occurs (zone touch, TP hit, body-close SL).' },
  { term: 'Disaster SL', definition: 'A hard stop loss placed on the exchange at structural level + 3% buffer. It only fires if the sentinel process goes down. It is not the primary SL.' },
  { term: 'TP1 / TP2', definition: 'Take Profit 1 and Take Profit 2. TP1 closes 50% of the position at the first target zone. TP2 closes the remaining 50% at the second target zone. After TP1, the SL is moved to break-even.' },
  { term: 'Break-even', definition: 'Moving the stop loss to the entry price after TP1 is hit. This means the trade can no longer result in a loss — the worst outcome is closing at the entry price.' },
  { term: 'Zone 1 / Zone 2', definition: 'The nearest S/D zones in the direction of the trade. TP1 targets Zone 1, TP2 targets Zone 2. Zones 3 and 4 are never used as TP levels — verified on 36-trade dataset.' },
  { term: '4H Zone Gate', definition: 'A rule requiring that any trade setup identified on lower timeframes (1H, 30M, 15M) must have a corresponding 4H zone within ±5%. Prevents entries on low-quality setups.' },
  { term: 'BTC 1D Gate (Rule A)', definition: 'A rule that blocks alt-coin entries when BTC\'s daily structure is against the trade direction. If BTC is making higher lows and consecutive green closes, no short entries on alts.' },
  { term: 'FVG (Fair Value Gap)', definition: 'A price inefficiency created by a fast-moving candle where the wicks of adjacent candles do not overlap. Used as additional entry confluence when aligned with an S/D zone.' },
  { term: 'Timeframe Stack', definition: 'The 7-timeframe analysis sequence: 1M → 1W → 1D → 4H → 1H → 30M → 15M. Higher timeframes define the directional bias; lower timeframes provide the execution entry.' },
  { term: 'Mode A (Solana Vault)', definition: 'The Drift Protocol integration. Users deposit USDC or CASH, delegate trade authority via Phantom, and the agent trades on-chain. Trustless — agent can trade, never withdraw.' },
  { term: 'Mode B (CEX API)', definition: 'The centralized exchange integration. Users paste a trade-only API key from WEEX, Bybit, or Binance. Agent routes trades to the correct exchange.' },
  { term: 'Epoch', definition: 'A 30-day profit settlement period. At the end of each epoch, the smart contract (Mode A) or profit tracker (Mode B) calculates profit and deducts the platform share.' },
  { term: 'Drift Protocol', definition: 'A decentralized perpetuals exchange on Solana. TradeLikeMe\'s Mode A uses Drift for on-chain trade execution. The agent interacts via the driftpy SDK.' },
  { term: 'Pyth Network', definition: 'A real-time price oracle on Solana used by Drift, Jupiter Perps, and Raydium Perps. The agent uses Pyth WebSocket for price feeds in Mode A.' },
  { term: 'Helius', definition: 'A Solana RPC provider. TradeLikeMe uses Helius for all Solana RPC calls (free tier, ~5% usage).' },
  { term: 'KLineChart Pro', definition: 'An open-source charting engine used as a self-hosted TradingView replacement for zone scanning. Runs headlessly on EC2 via Playwright.' },
  { term: 'Dokploy', definition: 'The self-hosted PaaS used to deploy all TradeLikeMe services. Runs on EC2. Manages Docker containers, routing, SSL, monitoring, and deploy notifications.' },
  { term: 'CROSS leverage', definition: 'A leverage mode where the entire account balance is used as margin, reducing liquidation risk compared to isolated leverage.' },
  { term: 'Perpetual futures (perps)', definition: 'Derivative contracts with no expiry date. The primary instrument traded by the TradeLikeMe agent. Available on both Solana protocols and CEXs.' },
]

export default function Glossary() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge>Platform</DocBadge>
        <DocH1>Glossary</DocH1>
        <DocP>Key terms used across the TradeLikeMe platform and documentation.</DocP>
      </DocSection>

      <DocDivider />

      {terms.map((t, i) => (
        <div key={i}>
          <DocSection>
            <DocH2>{t.term}</DocH2>
            <DocP>{t.definition}</DocP>
          </DocSection>
          {i < terms.length - 1 && <DocDivider />}
        </div>
      ))}
    </DocPage>
  )
}
