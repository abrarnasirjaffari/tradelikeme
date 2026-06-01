export const investorFAQs = [
  {
    q: 'Is my money safe?',
    a: 'In Solana Vault mode, your funds never leave your wallet. You delegate trade authority to the agent via Drift Protocol — it can open and close positions but can never withdraw your money. In CEX mode, you connect a trade-only API key with no withdrawal permissions. In both modes, there is absolutely no way for us to touch, move, or access your funds — by design.',
  },
  {
    q: 'How does the 20% profit share work?',
    a: 'Simple — we charge nobody upfront. No fees for investors, no fees for traders. Everything is covered from the profit the agent generates. When you profit, 20% of that profit is split between the trader (12%), infrastructure costs that keep the agent running 24/7 (3%), and the platform (5%). You keep 80%. If there is no profit, nobody pays anything.',
  },
  {
    q: 'Can I withdraw anytime?',
    a: 'In Solana Vault mode, one click in Phantom revokes all delegation — your funds are immediately yours again. In CEX mode, you can remove your API key anytime and your exchange balance is untouched.',
  },
  {
    q: 'What is the minimum deposit?',
    a: 'The minimum balance to start is $100. The agent uses very small margin per trade so your capital is spread across many trades, keeping individual risk low.',
  },
  {
    q: 'What exchanges are supported?',
    a: 'At launch — Decentralized: Drift Protocol, Jupiter Perps, Raydium Perps (all on Solana). Centralized: WEEX, Bybit, Binance, BingX, Blofin, Bitget. All CEX modes use trade-only API keys with no withdrawal access.',
  },
  {
    q: 'What is the difference between Solana Vault and CEX API mode?',
    a: 'Solana Vault: you connect your Phantom wallet and give the agent permission to trade. Your USDC stays in your wallet the entire time — it is mathematically impossible for the agent to send your money anywhere. Profit share is deducted automatically by the smart contract before you withdraw. CEX mode: you create a trade-only API key on your exchange with no withdrawal permissions — we literally cannot move your funds even if we wanted to. At the end of each month, you manually send us 20% of your profits to continue trading with the agent the following month. No payment, no trading. Same strategy, same agent, different rails.',
  },
  {
    q: 'What happens if the agent makes a losing trade?',
    a: 'Losses are a normal part of trading — even the best traders in the world lose trades. We only allow highly profitable, verified traders onto the platform. The agent uses very small margin per trade on purpose — this keeps individual losses tiny while letting winners run much further. Over time, a single winning trade can cover several losing ones. We charge zero fees during any drawdown or recovery period — nothing until you surpass your previous all-time high.',
  },
  {
    q: 'How is this different from copy trading?',
    a: 'With TradeLikeMe you can see every live trade — open positions, entries, exits, take profits, and stop losses — in real time. What stays private is the strategy itself: the rules, the method, the logic behind each trade. The trader chooses whether to share that or not. To help you pick a trader, we show their track record — so you can make an informed choice. The agent runs 24/7 with no trader involvement, and we earn only on profit.',
  },
  {
    q: 'Do I need to know anything about trading?',
    a: 'Nothing at all. You choose a risk mode (Conservative, Medium, or Aggressive), deposit, and the agent handles everything — finding setups, entering trades, taking profits, and managing exits.',
  },
  {
    q: 'What coins does the agent trade?',
    a: 'The agent trades whatever coins the trader themselves trade — any coin where a valid setup exists. There is no fixed list. We are also building a feature that lets you choose which specific coins you want to trade, giving you full control over your exposure. This coin filter is not part of the initial launch but is coming soon.',
  },
  {
    q: 'Can I pause or stop the agent anytime?',
    a: 'Yes. In Solana mode, revoke delegation in Phantom. In CEX mode, delete the API key on your exchange. The agent stops immediately. No lock-in, no exit fee, no waiting period.',
  },
  {
    q: 'When does the platform go live?',
    a: 'We are launching soon. The full platform is already open source on GitHub (github.com/abrarnasirjaffari/tradelikeme) — website, agent code, and Solana vault.',
  },
  {
    q: 'Is TradeLikeMe open source?',
    a: 'Yes. The entire platform — website and agent code — is MIT licensed and already live on GitHub (github.com/abrarnasirjaffari/tradelikeme). The trading strategy itself is private IP, but everything else is fully open for anyone to inspect, fork, or build on.',
  },
  {
    q: 'What if I want to invest more than $10,000?',
    a: 'We offer institutional access for larger deposits — lower fees, higher leverage, and dedicated support. Join the waitlist and select $10,000 on the deposit slider to get in touch with our team.',
  },
]

export const traderFAQs = [
  {
    q: 'How do I become a trader on the marketplace?',
    a: 'Right now, join the waitlist as a Trader and our team will contact you directly to discuss your strategy and get you onboarded early. Once we launch, you can sign up on the platform and apply to join the marketplace — submit your strategy, we review your track record, verify your trades, run a short paper test, and you are live. No complicated process.',
  },
  {
    q: 'How much can I earn as a marketplace trader?',
    a: 'Here is a real example. Say $500,000 in user deposits follow your strategy and it generates $250,000 in profit that month. We take 20% from users — that is $50,000. Users keep $200,000 (80%). From that $50,000: you as the trader earn a fixed 12% of total profit = $30,000. 3% goes to infrastructure and API costs that keep the agent running 24/7 = $7,500. The platform keeps 5% = $12,500. So: users keep $200,000, you earn $30,000, infra costs $7,500, platform earns $12,500 — for zero hours of your time.',
  },
  {
    q: 'Do I need to risk my own money?',
    a: 'No. You submit your strategy rules and we run the agent. You earn from user deposits, not your own capital. Zero financial risk for you.',
  },
  {
    q: 'Does sharing my strategy expose my edge?',
    a: 'No. Users can see live open positions, entries, exits, take profits, and stop losses — but the strategy itself (the rules and logic behind each trade) stays completely private unless you choose to share it. Investors pick you based on your track record, not your method. Your edge is yours to keep.',
  },
  {
    q: 'What happens if my strategy performs poorly?',
    a: 'Your tier adjusts based on ongoing results. If performance drops consistently, we review and may temporarily pause your strategy to protect users. You are always notified before any action is taken.',
  },
  {
    q: 'What strategy styles are accepted?',
    a: 'Any style is welcome — price action, indicator-based, supply and demand, support and resistance, ICT concepts, order flow, volume analysis, breakout trading, mean reversion, scalping, swing trading, algo/bot strategies, or any mix of the above. As long as your rules are clear, repeatable, and can be written down, we can code it. If you have a method that works, we want it on the platform.',
  },
]
