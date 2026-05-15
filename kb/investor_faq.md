# Investor FAQ — TradeLikeMe

## How does depositing work?
You deposit USDC (or CASH stablecoin) into a Solana smart contract vault built on the Drift Protocol. Your funds never leave your control — the vault smart contract only grants the TradeLikeMe agent permission to trade on your behalf. The agent can open and close positions but can never withdraw your funds to any external wallet.

## How do withdrawals work?
You can request a withdrawal at any time through your dashboard. The minimum processing window is 3 days; the default is 30 days. This window exists so open trades can be settled cleanly before your capital is returned. The smart contract automatically deducts any outstanding profit share before releasing funds to your wallet.

## What are the fees?
Zero subscription fees. Zero management fees. We only earn when you earn. Our strategy charges a 20% profit share on net profits per epoch (settled monthly). If the strategy has a losing month, we earn nothing that month.

## What are the risk modes?
There are three presets — you pick one when you sign up, and you cannot manually override leverage or margin:
- **Conservative**: 50-100x leverage, 0.25-0.5% margin per trade. 20+ trade buffer before liquidation risk. Best for large deposits or risk-averse users.
- **Medium**: 50-200x leverage, 0.5-1% margin per trade. 8-10 trade buffer. Most popular choice.
- **Aggressive**: 50-300x leverage, 1-2% margin per trade. 4-5 trade buffer. For experienced users with smaller deposits.

The strategy logic — entry, stop loss, take profit — is identical across all three modes. Only the position sizing changes.

## Is my money safe?
Your USDC stays in a Solana smart contract vault. The agent has delegation authority to trade only — it cannot transfer or withdraw your principal. The smart contract code is open source and auditable. We enforce a minimum balance floor ($35) so the agent stops trading before any liquidation risk. The body-close stop loss rule (ignoring price wicks) has demonstrated a 70% wick survival rate, including one case where ignoring a wick saved a +2192% winning trade.

## How is profit calculated and distributed?
At the end of each epoch (monthly), the smart contract compares your closing vault balance to your opening balance. If there is a profit, 20% goes to the TradeLikeMe platform wallet on-chain automatically — no manual settlement needed. The remaining 80% stays in your vault. You can compound it or withdraw it.

## Can I follow multiple strategies?
Yes. Each strategy runs in its own isolated vault. You can deposit into multiple strategy vaults simultaneously, each with its own risk mode and profit share terms.
