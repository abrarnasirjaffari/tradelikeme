export type BlogPost = {
  slug: string
  category: string
  categoryColor: string
  title: string
  excerpt: string
  date: string
  readTime: string
  featured?: boolean
  body: string
}

export const posts: BlogPost[] = [
  {
    slug: 'why-89-percent-win-rate',
    category: 'Strategy',
    categoryColor: '#22C55E',
    title: 'Why our 89% win rate is real — and how we verified it',
    excerpt: 'Every AI trading platform claims results. We show the receipts: TradingView charts, trade-by-trade breakdowns, and the exact methodology behind 36 verified trades.',
    date: 'Apr 28, 2026',
    readTime: '8 min read',
    featured: true,
    body: `Most trading platforms show you a backtest curve. A smooth equity line going up and to the right, carefully selected over a period when the strategy happened to work. We do something different: we verify every trade on a live TradingView chart before we count it.

## What "verified" actually means

For each trade in our sample, we took a screenshot of the TradingView chart at the exact entry time and confirmed:

- The S/D zone was visually present on the 4H timeframe before entry
- Price had not previously swept the zone (fresh zone only)
- BTC was not in a confirmed 1D recovery (Rule A gate)
- TP1 and TP2 were at zone 1 and zone 2 respectively — never zone 3 or 4

If any of those conditions couldn't be confirmed from the chart, the trade was excluded from the sample. We didn't reverse-fit the rules to trades that worked.

## The 36-trade sample

Our current verified sample is 36 trades. That's not a large number statistically, but every single one was verified manually. The 89% win rate means 32 winners and 4 losers.

Average winner: +4.2%. Average loser: -2.8%. Risk-reward ratio: 1.5:1.

The 4 losses all share the same root cause: BTC was in active macro recovery at trade entry — which is now blocked by Rule A.

## Why body-close SL changes everything

The single most important edge in this strategy is not the entry zone. It's the stop loss.

Standard stop losses trigger on any wick past the level. Ours only trigger on a 30-minute candle *body* close below SL. Wicks are ignored entirely.

In our sample, 70% of trades that would have hit a standard stop loss on a wick went on to hit TP1 or TP2. The most extreme example: AAVE wicked to $85.05, below our $86 SL, but the body closed at $86.34. The trade eventually hit +2192%.

This one rule is worth more than any entry signal.

## What's next

We're continuing to grow the sample. As we add more traders to the marketplace, each strategy gets its own verified track record — same methodology, same TradingView verification, same transparency.

No black boxes. No backtests. Live charts only.`,
  },
  {
    slug: 'body-close-sl-explained',
    category: 'Risk Management',
    categoryColor: '#0052FF',
    title: 'Body-close stop loss: the edge everyone ignores',
    excerpt: 'Standard SLs get hunted on wicks. Ours don\'t fire until a candle body closes past the level. Here\'s the mechanic, why it works, and what it costs you if you ignore it.',
    date: 'Apr 25, 2026',
    readTime: '6 min read',
    body: `Stop hunts are not a conspiracy theory. They are a mechanical consequence of how liquidity pools work. When retail traders place stop losses just below support, market makers know exactly where those orders sit. A brief wick sweeps them, fills the MM's position at better prices, then price reverses.

The body-close SL is the direct counter to this mechanic.

## How it works

Your SL level is set at a structural point — the body of a significant candle on a higher timeframe. The exchange hard SL is placed 3% *below* that level as a disaster backstop.

The primary SL is software-managed: our sentinel watches every 30-minute candle close. If the candle *body* closes below the SL level, we close the trade. If price wicks past SL and the body closes back above it, we do nothing.

## The numbers

In our 36-trade sample, 70% of wick-past-SL events were stop hunts. Price returned above the SL level within 1–3 candles in all of them.

The maximum observed wick depth below SL was 3.8%. That's why the disaster hard SL is set at structural + 3% buffer — it covers 99%+ of stop hunts while still protecting against genuine catastrophic moves.

## The tradeoff

The tradeoff is that in the 30% of cases where price actually reverses, you exit slightly later than a standard SL would — meaning a marginally larger loss. But the elimination of false stops on the 70% of cases is a significant net positive.

Over 36 trades, this mechanism saved an estimated $4,200 in would-be false stops at a $10,000 account size.`,
  },
  {
    slug: 'supply-demand-zones-primer',
    category: 'Education',
    categoryColor: '#F59E0B',
    title: 'Supply and demand zones: a practical primer',
    excerpt: 'No indicators. No oscillators. Just price leaving a level fast — and returning to it later. Here\'s the full framework behind how we identify and trade S/D zones.',
    date: 'Apr 22, 2026',
    readTime: '10 min read',
    body: `Supply and demand zone trading is not a new concept. The underlying logic is simple: when price leaves a level explosively, it means orders were filled there. When price returns to that level, unfilled orders are likely still sitting there — and they'll absorb the incoming move.

## What makes a zone valid

Not every level qualifies. We look for:

**Strong base**: Price consolidates briefly (2–5 candles), then moves away impulsively. The consolidation candles are the zone.

**Clean departure**: The move away from the zone should be sharp — ideally 3:1 or better in terms of range vs. base size. Slow grinds away from a level rarely produce reliable zones.

**First return**: A zone is freshest the first time price returns to it. Each subsequent test weakens it. We prefer zones that haven't been touched since formation.

**4H confirmation**: The zone must be visible on the 4-hour timeframe. Lower timeframe zones alone are not traded — they need a 4H zone within ±5%.

## The timeframe stack

We scan top-down: Monthly → Weekly → Daily → 4H → 1H → 30M → 15M.

Each higher TF gives context. The daily tells you the macro direction. The 4H gives the tradeable zone. The 15M gives the entry trigger.

A long trade only makes sense if the daily is bullish or at a daily demand zone. Trading against the daily structure makes every setup a lower-grade scalp at best.

## Entries

We enter at the top of a demand zone (or bottom of a supply zone) — not in the middle. This maximises the reward-to-risk by giving the structure room to work.

If there's an FVG (fair value gap) overlapping the zone, that's the highest-confidence entry point. FVG + S/D overlap is an A-grade setup. Zone alone without FVG is B-grade.

## Equal highs and lows

Equal highs or equal lows on any timeframe represent retail stop clusters. Price sweeps them — triggering those stops — then reverses. The sweep itself becomes the new zone. This is how fresh zones are born during trending markets.`,
  },
  {
    slug: 'btc-macro-gate',
    category: 'Strategy',
    categoryColor: '#22C55E',
    title: 'The BTC macro gate: why we skip trades when Bitcoin recovers',
    excerpt: 'Two live trades were stopped out in April 2026 for the same reason: BTC was in active macro recovery. We added a hard rule. Here\'s the data behind it.',
    date: 'Apr 20, 2026',
    readTime: '5 min read',
    body: `On April 15–16, 2026, we took two live trades — XRP short and SUI short. Both had valid S/D setups on the 4H. Both got stopped out.

The root cause was the same for both: BTC had printed 7 consecutive green daily candles and was making higher lows. During active BTC macro recovery, altcoin shorts consistently fail — even at valid supply zones.

## Why BTC overrides alt setups

Altcoins are reflexively correlated to Bitcoin during macro moves. When BTC is recovering from a correction, the entire market lifts. Supply zones that would normally hold become breakout levels because the macro bid is stronger than the zone resistance.

This isn't always true — there are alts that move independently. But on average, shorting alts into BTC recovery is negative expected value even at technically valid supply zones.

## Rule A: the BTC 1D gate

After those losses, we added a mandatory BTC 1D gate to the strategy:

- If BTC has printed 3+ consecutive green daily closes AND is making higher lows vs. the prior swing: **no new short entries on any alt**
- If BTC is at a 1D supply zone or making lower highs: shorts are open
- Long entries are not gated by BTC macro (BTC recovery = bullish for longs)

This rule has been in test for 20 trades. Running score: +$2.03 saved vs. 0 cost (no valid setups were blocked incorrectly).

## What it looks like in practice

We check the BTC daily chart before every entry. The check is binary:

1. Is BTC in confirmed recovery (3+ green closes, higher lows)?
2. If yes → skip all short entries regardless of alt zone quality

It takes 30 seconds. It prevented both of those losses in retrospect.`,
  },
  {
    slug: 'solana-vault-how-it-works',
    category: 'Product',
    categoryColor: '#9945FF',
    title: 'How the Solana vault works: deposit, delegate, and earn',
    excerpt: 'Our Anchor program gives the agent trade authority — not withdrawal authority. Here\'s exactly what happens on-chain when you deposit USDC and delegate to the strategy.',
    date: 'Apr 18, 2026',
    readTime: '7 min read',
    body: `When you deposit into a TradeLikeMe vault, you're interacting with a custom Anchor program on Solana. The program is designed around one principle: the agent can trade on your behalf, but it can never move your principal out of the vault.

## The four instructions

The vault program exposes four instructions:

**deposit()** — You send USDC or CASH to a program-derived address (PDA) seeded by your wallet pubkey and the strategy ID. The funds sit in the PDA, not in any EOA we control.

**delegate_to_protocol()** — You sign a transaction authorising the agent's sub-account to call trading instructions on Drift, Jupiter, or Raydium using the vault balance. This is the delegation step — it grants trade authority only, never transfer authority.

**settle_epoch()** — Called automatically by the agent at the end of each epoch (monthly). The program calculates: closing balance − opening balance = profit. If positive, 20% is transferred on-chain to the platform wallet. 80% stays in your vault. If flat or negative, nothing moves.

**withdraw()** — You call this anytime. The program returns your full balance minus any profit already settled. No delay, no permission required from us.

## What the agent can and can't do

Can do: open positions, close positions, set stop losses, set take profits, read balances.

Cannot do: transfer funds out of the vault PDA, modify the profit split ratio, change the withdrawal destination.

This is enforced at the program level — not by trust, not by terms of service. The instructions that would allow fund movement don't exist in the program.

## Why this matters

Every other "AI trading" platform has one of two models: you give them your private key (fully custodial, full trust required), or you give them a CEX API key (exchange-custodial, still full trust in the platform).

Our vault model is the only one where you can verify on-chain that the agent's capabilities are hard-limited by code. The program is open source. Audit it yourself.`,
  },
  {
    slug: 'marketplace-trader-economics',
    category: 'Business',
    categoryColor: '#F59E0B',
    title: 'The marketplace model: why traders earn more by sharing',
    excerpt: 'A trader making $5k/month from their own capital works 8–12 hrs/day. On TradeLikeMe, they risk $0 of their own money and earn from every deposit that follows their strategy.',
    date: 'Apr 15, 2026',
    readTime: '6 min read',
    body: `There's a paradox at the heart of discretionary trading: the more money you make, the more time it costs you. Your income is capped by your own capital and your own hours.

The TradeLikeMe marketplace is designed to break that ceiling.

## The trader's current reality

A skilled discretionary trader with $50,000 in capital, making consistent 8–12% monthly returns, earns $4,000–$6,000/month. To do that, they watch charts for 8–12 hours a day. Their income stops the day they stop watching charts.

They can't scale by raising more capital — leverage has limits. They can't hire help — the edge is in their head. They can't take a vacation — the positions don't pause.

## What changes on the platform

When a trader submits their strategy to TradeLikeMe and gets approved, they write down their rules once. We build the agent. From that point:

- Their strategy runs 24/7 without them
- Every dollar deposited by users generates income at their tier rate
- They risk $0 of their own money
- Their earning potential scales with user AUM, not personal capital

A B-tier strategy (10% fee on profits) with $500,000 in user deposits at 8% monthly returns generates $4,000/month for the trader. At $2,000,000 AUM: $16,000/month. Zero screen time after setup.

## Quality gates keep the marketplace honest

We don't accept every strategy. Requirements:

- 50+ verified trades (rules out luck)
- 55%+ win rate minimum
- Clear written rules the agent can execute
- TradingView verification of every claimed trade
- 30-minute strategy interview
- 2-week paper test on devnet

The quality-based fee tier (S/A/B/C) means better strategies earn more. There's no incentive to game the verification — a strategy that passes with manipulated results will fail the live test and get delisted.

## The long game

As the marketplace grows, the network effect compounds. More verified strategies attract more users. More users increase AUM. Higher AUM makes the platform more attractive to top traders. Better traders raise the average verified win rate. That reputation is the moat.`,
  },
]
