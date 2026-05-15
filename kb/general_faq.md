# General FAQ — TradeLikeMe

## What is TradeLikeMe?
TradeLikeMe is a verified-strategy trading marketplace on Solana. Users deposit USDC into a smart contract vault, delegate trading authority to our automated agent, and earn 80% of profits. The agent uses a human-cloned trading strategy with a verified 89% win rate. We earn 20% profit share only when you profit. No subscriptions, no management fees.

## How is this different from other AI trading platforms?
Most AI trading platforms use black-box machine learning with no documented results. None of the 43+ AI trading projects in recent Solana hackathons could show a verified win rate, live trade history, or documented risk management rules.

TradeLikeMe is different in three ways. First, the strategy is verified — every trade is confirmed on TradingView charts with documented entry, exit, and P&L. Second, the strategy was cloned from a real profitable human trader, not invented by an AI. Third, the stop loss logic ignores price wicks (stop hunts), which standard platforms do not do.

## Is TradeLikeMe safe to use?
Your funds stay in a Solana smart contract. The agent has delegation authority only — it can trade but cannot withdraw your money. The smart contract is open source. We enforce a hard minimum balance floor so the agent stops trading before any liquidation scenario.

That said, crypto trading carries real financial risk. Past performance (89% win rate) does not guarantee future results. The strategy performs best when Bitcoin is in a neutral or bullish macro environment.

## What blockchains and exchanges does TradeLikeMe support?
Currently Solana via Drift Protocol for decentralized perpetuals (Mode A). CEX support for WEEX, Bybit, and Binance via API key connection is coming in Phase 2. The Solana vault is the primary offering.

## What is the Solana Frontier Hackathon?
TradeLikeMe was built for the Solana Frontier Hackathon organized by Colosseum and the Solana Foundation (April-May 2026). The platform was submitted on May 11, 2026. Winners are announced June 23, 2026. Building for a hackathon does not affect how the platform works — the strategy, agent, and vault are real.

## Who is behind TradeLikeMe?
The platform was built by Abrar Nasir Jaffari (lead engineer, Solana and full-stack) and Wasiq Amir (data and analytics). The underlying trading strategy was cloned from a profitable trader's Telegram channel after a 200-agent deep analysis validated the edge across 36 documented trades.

## How do I get started?
Go to tradelikeme.xyz. Sign in with Google, GitHub, Twitter, or email — no crypto wallet required initially. Choose a strategy from the marketplace. Pick a risk mode (Conservative, Medium, or Aggressive). Connect a Phantom wallet or use Phantom's email sign-in to deposit USDC into the vault. That's it — the agent trades for you automatically and you get Telegram notifications on every trade event.

## Where can I see my trade history and P&L?
Log in at tradelikeme.xyz and go to your dashboard. You will see all open positions, trade history, and P&L by strategy and by time period. Live positions update in real time via WebSocket.
