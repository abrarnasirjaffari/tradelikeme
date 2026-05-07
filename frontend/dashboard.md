# Dashboard — Hackathon Build Tasks

> All elements selected for the demo dashboard. Grouped by section.

---

## Stat Cards

- [x] D1. Vault balance (deposited amount) — VaultCard shows `vault.balance` + currency
- [x] D2. Current vault value (with profit/loss) — StatCards shows `pnl.vaultValue` with P&L sub-line
- [x] D3. Total profit $ amount — StrategyStats shows `totalPnl`
- [x] D4. Total profit % return — StatCards shows `pnl.totalPnlPct`
- [x] D5. Win rate % — StrategyStats shows `winRate`
- [x] D6. Total trades count — StrategyStats shows `totalTrades`
- [x] D7. Active positions count — StatCards shows `pnl.activePositions`
- [x] D8. Avg trade duration — StatCards shows `pnl.avgDuration`
- [x] D9. Best trade (highest P&L %) — StatCards shows `pnl.bestTrade`
- [x] D10. Worst trade (lowest P&L %) — StatCards shows `pnl.worstTrade`
- [x] D11. Max drawdown % — StrategyStats shows `maxDrawdown`
- [x] D12. Profit factor (winners $ / losers $) — StatCards shows `pnl.profitFactor`
- [x] D13. Risk-reward ratio — StrategyStats shows `rrr`
- [x] D14. Monthly return % — StatCards shows `pnl.monthlyReturn`
- [x] D15. Weekly return % — StatCards shows `pnl.weeklyReturn`
- [x] D16. Streak (current winning/losing streak) — StatCards shows `pnl.streak + streakType`

---

## Open Positions Panel

- [x] D17. Coin/symbol column — OpenPositions table
- [x] D18. Direction (LONG/SHORT) — DirBadge in OpenPositions
- [x] D19. Entry price — OpenPositions table
- [x] D20. Current price — OpenPositions table
- [x] D21. Unrealized P&L $ — OpenPositions table
- [x] D22. Unrealized P&L % — OpenPositions table
- [x] D23. Position size (qty) — OpenPositions table (hide-mobile)
- [x] D24. Leverage used — OpenPositions table (hide-mobile)
- [x] D25. SL price — OpenPositions table (hide-mobile)
- [x] D26. TP1 price — OpenPositions table (hide-mobile)
- [x] D27. TP2 price — OpenPositions table (hide-mobile)
- [x] D28. Time open (duration) — OpenPositions table (hide-mobile)
- [x] D29. Margin used — OpenPositions table (hide-mobile)
- [x] D30. Liquidation price — OpenPositions table (hide-mobile)
- [x] D31. Close position button — OpenPositions table, calls onClose(id)

---

## Trade History Panel

- [x] D32. Coin/symbol — TradeHistory table, "Coin" column
- [x] D33. Direction — TradeHistory table, DirBadge (LONG/SHORT)
- [x] D34. Entry price — TradeHistory table, "Entry" column (hidden on mobile)
- [x] D35. Exit price — TradeHistory table, "Exit" column (hidden on mobile, shows "—" if open)
- [x] D36. Outcome (TP1 / TP2 / SL / Manual) — TradeHistory table, StatusBadge
- [x] D37. Realized P&L $ — TradeHistory table, "P&L$" column
- [x] D38. Realized P&L % — TradeHistory table, "P&L%" column
- [x] D39. Duration — TradeHistory table, "Duration" column (hide-mobile)
- [x] D40. Date/time opened — TradeHistory table, "Date" column
- [x] D41. Date/time closed — TradeHistory table, "Closed" column (hide-mobile)
- [x] D42. On-chain tx link (Solscan) — ExternalLink icon in Status cell

---

## Vault / Deposit Section

- [x] D43. Deposit button + amount input — VaultCard + DepositModal
- [x] D44. Withdraw button + amount input — VaultCard + WithdrawModal
- [x] D45. Deposit history — VaultHistory component
- [x] D46. Withdraw history — VaultHistory component (type='withdraw' rows)
- [x] D47. Vault address (copyable) — VaultCard address row with Copy icon + toast
- [x] D48. View vault on Solscan link — VaultCard "View on Solscan" link

---

## Strategy Info

- [x] D49. Strategy name + description — StrategyInfo header + description
- [x] D50. Strategy rules summary — StrategyInfo numbered rules list
- [x] D51. Trader profile / name — StrategyInfo "Verified Trader" row + CheckCircle2 icon
- [x] D52. Strategy grade (S/A/B/C tier) — StrategyInfo grade badge
- [x] D53. Fee tier shown (e.g. "20% profit share") — StrategyInfo fee row
- [x] D54. Coins traded list — StrategyInfo coin chips
- [x] D55. Timeframes used — StrategyInfo timeframe chips (4H/15M highlighted)
- [x] D56. Max concurrent positions — StrategyInfo info grid
- [x] D57. Strategy start date — StrategyInfo "Active Since" row
- [x] D58. Total AUM in this strategy — StrategyInfo AUM row

---

## Risk Mode

- [x] D59. Risk mode selector (Conservative / Medium / Aggressive) — RiskModeSelector
- [x] D60. Current mode displayed — RiskModeSelector header badge
- [x] D61. Explanation of what each mode means — RiskModeSelector card descriptions

---

## Agent Status

- [x] D72. Agent status indicator (Running / Stopped / Scanning) — AgentStatus pulsing dot
- [x] D73. Last scan time — AgentStatus relative time
- [x] D74. Next scan time — AgentStatus relative time
- [x] D75. Coins being watched list — AgentStatus watchlist chips
- [x] D76. Current sentinel watches — AgentStatus sentinel watches list

---

## Account / Settings

- [x] D77. Connected wallet address — AccountSettings wallet row (copyable)
- [x] D78. Connected OAuth provider — AccountSettings provider badge
- [x] D79. 2FA status — AccountSettings 2FA row + DashboardPage banner
- [x] D80. Logout button — AccountSettings logout button
- [x] D81. Dark/light mode toggle — AccountSettings dark mode placeholder

---

## On-Chain Verification

- [x] D82. Link to all trades on Solscan — OnChainVerification trades link
- [x] D83. Vault PDA address on Solscan — OnChainVerification vault address row
- [x] D84. Strategy registration tx link — OnChainVerification strategy tx row
- [x] D85. "Verify our win rate" button — OnChainVerification CTA button

---

## Summary

| Section | Items | Done | Remaining |
|---------|-------|------|-----------|
| Stat Cards | D1–D16 | 16 | 0 |
| Open Positions | D17–D31 | 15 | 0 |
| Trade History | D32–D42 | 11 | 0 |
| Vault / Deposit | D43–D48 | 6 | 0 |
| Strategy Info | D49–D58 | 10 | 0 |
| Risk Mode | D59–D61 | 3 | 0 |
| Agent Status | D72–D76 | 5 | 0 |
| Account / Settings | D77–D81 | 5 | 0 |
| On-Chain Verification | D82–D85 | 4 | 0 |
| **Total** | **75** | **75** | **0** |

---

## Skipped (post-hackathon)

- Charts / Graphs (equity curve, P&L bars, pie charts, heatmaps)
- Notification settings panel
- Recent alerts feed
- Test notification button
