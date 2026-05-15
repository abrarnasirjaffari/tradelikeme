# Trader FAQ — TradeLikeMe

## What are the onboarding requirements?
To list your strategy on the TradeLikeMe marketplace, you must meet all of the following:
1. **50+ verified trades** — proves your edge is not luck. Must be checkable on TradingView charts.
2. **55%+ win rate minimum** — strategies below this threshold are rejected outright.
3. **Clear written rules** — explicit entry conditions, stop loss rules, take profit rules, position sizing. Our agent needs unambiguous logic to execute your strategy.
4. **TradingView verification** — we independently verify your trade history on charts.
5. **Strategy interview** — a 30-minute call with our team to validate the rules and edge.
6. **2-week paper test on devnet** — we run your strategy in simulation before going live.

## What are the fee tiers?
Strategies are graded by verified win rate:
- **S-tier (85%+ win rate)**: 15% total fee. You (the trader) receive 10.5%. Platform receives 4.5%.
- **A-tier (75-84%)**: 12% total fee. Trader 8.4%, platform 3.6%.
- **B-tier (65-74%)**: 10% total fee. Trader 7%, platform 3%.
- **C-tier (55-64%)**: 8% total fee. Trader 5.6%, platform 2.4%.
- **Below 55%**: Rejected. Not listed.

## Why share your strategy with us?
A trader earning $5,000/month from their own $50,000 capital works 8-12 hours per day. That income stops the moment they stop trading. With TradeLikeMe, your agent runs 24/7 and earns from ALL user deposits — not just your own capital. You risk $0 of your own money.

Example at B-tier (10% fee): if users deposit $500,000 into your strategy vault and it returns 8% monthly, the total fee pool is $4,000. You receive $2,800/month for zero hours of work. At $2 million in deposits, that is $11,200/month.

## Who builds and maintains the agent?
We do. Once your strategy is approved, our engineering team codes the agent instance based on your written rules. You do not need to write any code. We handle infrastructure, monitoring, and updates. You provide the strategy logic and verify it stays accurate over time.

## What do I control as a trader?
You define: which coins are traded, maximum concurrent positions, trading hours or session filters, leverage and margin for each of the three user risk modes (Conservative / Medium / Aggressive), and all entry/exit/stop loss/take profit parameters. Users cannot override your risk parameters — they only choose which preset to use.

## How does revenue settlement work?
For the Solana vault (Mode A), the on-chain smart contract auto-deducts the total fee before any user withdrawal. Your share is deposited to your registered wallet automatically. For CEX mode (Mode B, coming later), settlement is tracked per-trade and paid monthly. Non-payment results in the strategy being suspended.

## Can my strategy be removed?
Yes, if the live win rate drops below 55% for two consecutive months or if users report systematic rule violations. We re-verify against TradingView charts regularly.
