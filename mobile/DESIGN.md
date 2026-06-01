---
version: alpha
name: TradeLikeMe-Mobile
description: |
  A premium mobile trading vault app that reads like Coinbase meets Revolut —
  institutional trust with consumer accessibility. Dark-first canvas (#0A0D14)
  with TradeLikeMe Blue (#0052FF) as the single brand voltage. Large numeric
  displays for P&L and balances using DM Sans at tight tracking. Pill-shaped
  CTAs, generous 16px+ touch targets, and trading-grade green/red semantics.
  The app feels like a private wealth terminal in your pocket — zero clutter,
  maximum clarity, every pixel earns its place.

colors:
  primary: "#0052FF"
  primary-soft: "#0052FF1A"
  primary-hover: "#003EC7"
  on-primary: "#FFFFFF"
  canvas: "#0A0D14"
  canvas-elevated: "#111620"
  surface-card: "#161C28"
  surface-card-hover: "#1C2333"
  surface-input: "#1A2030"
  surface-soft: "#0F1219"
  on-surface: "#F2F4F7"
  on-surface-muted: "#8A94A6"
  on-surface-faint: "#525C6E"
  hairline: "rgba(255,255,255,0.08)"
  hairline-strong: "rgba(255,255,255,0.14)"
  trading-up: "#00D68F"
  trading-up-soft: "#00D68F1A"
  trading-down: "#FF4D4F"
  trading-down-soft: "#FF4D4F1A"
  accent-gold: "#FFB800"
  accent-gold-soft: "#FFB8001A"
  warning: "#FF8C00"
  canvas-light: "#FFFFFF"
  surface-light: "#F7F8FA"
  on-light: "#0A0D14"
  on-light-muted: "#525C6E"

typography:
  display-xl:
    fontFamily: DM Sans
    fontSize: 40px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: -1.6px
  display-lg:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: 700
    lineHeight: 36px
    letterSpacing: -1.2px
  display-md:
    fontFamily: DM Sans
    fontSize: 28px
    fontWeight: 700
    lineHeight: 32px
    letterSpacing: -0.8px
  heading-lg:
    fontFamily: DM Sans
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: -0.4px
  heading-md:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: 600
    lineHeight: 24px
    letterSpacing: -0.2px
  heading-sm:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22px
    letterSpacing: 0
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0.1px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.2px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 18px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.3px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 600
    lineHeight: 14px
    letterSpacing: 0.5px
  number-display:
    fontFamily: DM Sans
    fontSize: 36px
    fontWeight: 700
    lineHeight: 40px
    letterSpacing: -1.4px
  number-lg:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: -0.6px
  number-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0
  number-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  xxl: 24px
  pill: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  section: 48px
  safe-bottom: 34px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    padding: 16px 32px
    height: 52px
  button-primary-sm:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    padding: 10px 20px
    height: 36px
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    padding: 16px 32px
    height: 52px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
  button-success:
    backgroundColor: "{colors.trading-up}"
    textColor: "{colors.canvas}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    padding: 16px 32px
    height: 52px
  button-danger:
    backgroundColor: "{colors.trading-down}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.pill}"
    padding: 16px 32px
    height: 52px
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 20px
  card-stat:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.on-surface}"
    typography: "{typography.number-lg}"
    rounded: "{rounded.lg}"
    padding: 16px
  card-trade:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 16px
  input-field:
    backgroundColor: "{colors.surface-input}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: 16px
    height: 56px
  chip-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
    height: 32px
  chip-default:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
    height: 32px
  tab-bar:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.none}"
    height: 84px
  status-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-surface}"
    height: 44px
  nav-header:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-surface}"
    typography: "{typography.heading-md}"
    height: 56px
  badge-verified:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-profit:
    backgroundColor: "{colors.trading-up-soft}"
    textColor: "{colors.trading-up}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 4px 8px
  badge-loss:
    backgroundColor: "{colors.trading-down-soft}"
    textColor: "{colors.trading-down}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: 4px 8px
  list-item:
    backgroundColor: transparent
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    padding: 16px 0
  divider:
    backgroundColor: "{colors.hairline}"
    height: 1px
  bottom-sheet:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xxl}"
    padding: 24px
---

## Overview

TradeLikeMe Mobile is a premium trading vault app designed for the Solana ecosystem.
The visual language communicates **institutional trust** (Coinbase-grade calm) with
**consumer accessibility** (Revolut-grade polish). Every screen prioritizes numbers —
P&L, balances, win rates — displayed in large DM Sans Bold with tight negative tracking.

## Design Principles

1. **Numbers First** — Portfolio value, P&L, and win rate are always the largest elements.
   Use display-xl or number-display typography. Users open the app to see their money.

2. **Dark by Default** — Canvas is #0A0D14 (blue-tinted near-black). Cards float above
   at #161C28. Never use pure black. The blue tint ties everything to the brand.

3. **One Brand Color** — #0052FF is used sparingly: primary CTAs, verified badges,
   active states, and the occasional accent. Overusing blue dilutes trust.

4. **Trading Semantics** — Green (#00D68F) = profit/long/up. Red (#FF4D4F) = loss/short/down.
   Gold (#FFB800) = premium/verified/top-tier. Never mix these meanings.

5. **Generous Touch Targets** — Minimum 44px tap targets. Buttons are 52px height.
   Cards have 16-20px internal padding. Bottom nav is 84px with safe area.

6. **Zero Clutter** — No decorative elements. No gradients unless absolutely necessary.
   Depth comes from surface color shifts, not shadows. Borders are 8% white opacity max.

## Typography Strategy

**DM Sans** (Headlines + Numbers): Tight tracking creates density without feeling cramped.
Used for all monetary values, percentages, and section headers. Weight 600-700.

**Inter** (Body + Labels): Exceptional legibility at 12-14px on mobile retina displays.
Used for descriptions, metadata, timestamps, and interactive labels. Weight 400-600.

## Color Usage Rules

- Primary blue on max 2 elements per screen (usually CTA + one accent)
- Trading green/red ONLY for financial direction — never for success/error UI states
- Gold reserved for verified badges, leaderboard crowns, and premium features
- Muted text (#8A94A6) for secondary info. Faint (#525C6E) for timestamps/metadata only.

## Layout Rules

- Screen padding: 20px horizontal
- Card gap: 12px
- Section gap: 32px
- Bottom tab bar: 84px total (50px content + 34px safe area)
- Status bar: 44px (iOS)
- Cards: No borders. Use surface-card background to separate from canvas.
- Lists: Use hairline (8% white) dividers between items, never between card and content.

## Mobile-Specific Patterns

- **Pull to refresh** on all data screens (Dashboard, Trades, Strategies)
- **Swipe actions** on trade cards (close position, set alert)
- **Bottom sheets** for confirmations (deposit, withdraw, close trade)
- **Haptic feedback** on successful actions (trade entered, deposit confirmed)
- **Skeleton loading** with surface-card colored placeholders

## Screen Inventory (29 screens)

### Auth Flow
1. Splash — Logo centered, canvas background, subtle fade-in
2. Onboarding 1 — "Verified strategies" + vault illustration
3. Onboarding 2 — "Agent trades 24/7" + automation visual
4. Onboarding 3 — "You keep 80% of profits" + P&L example
5. Login — Email/password + social buttons (Google, Apple, Phantom wallet)
6. Signup — Name, email, password, agree to terms
7. Forgot Password — Email input + send reset link

### Main App (Tab Bar: Home, Trades, Strategies, Vault, Settings)
8. Dashboard (Home) — Total balance (number-display), today's P&L (green/red badge), active trades count, sparkline chart, quick actions (Deposit, Withdraw)
9. Active Trade Detail — Coin pair, direction (LONG/SHORT badge), entry price, current price, unrealized P&L, TP1/TP2 levels, SL level, duration, close button
10. Trade History — List of closed trades, filter chips (All, Won, Lost), per-trade P&L
11. Trade History Detail — Full trade breakdown: entry, exit, duration, P&L, fees, strategy used
12. Strategies List — Cards showing each strategy: name, win rate, monthly return, subscribers, verified badge
13. Strategy Detail — Hero stat (89% win rate), monthly returns chart, trade log, risk modes, subscribe CTA
14. Vault Overview — Balance, deposited amount, profit earned, profit share breakdown (80/20), recent transactions
15. Deposit — Amount input (number pad), select token (USDC/CASH), confirm bottom sheet
16. Withdraw — Amount input, destination wallet, processing time notice, confirm
17. Transaction History — All deposits/withdrawals with status (pending, confirmed, failed)
18. Pick Strategy — Browse available strategies before subscribing
19. Pick Risk Mode — Conservative/Medium/Aggressive cards with leverage + margin details
20. Connect Exchange — Paste API key flow for CEX mode (WEEX, Bybit, Binance)

### Secondary Screens
21. Settings — Profile, Security, Notifications, Connected Exchanges, Risk Mode, About, Logout
22. Profile — Avatar, name, email, wallet address, member since
23. Security — 2FA toggle, change password, active sessions
24. Notification Preferences — Toggle per event type (entries, TPs, SLs, daily summary)
25. Connected Exchanges — List of connected API keys with status
26. Leaderboard — Ranked list: position, avatar, username, % return, badge (gold/silver/bronze)
27. Referral — Unique link, copy button, share button, earnings from referrals, referred users list
28. Notifications List — Chronological alerts with icon per type (green=TP, red=SL, blue=entry)
29. Notification Detail — Full alert: trade info, timestamp, action taken by agent
