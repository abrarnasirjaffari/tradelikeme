import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable, DocCodeBlock } from '../DocComponents'

export default function NotificationsSetup() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge>Platform</DocBadge>
        <DocH1>Notifications Setup</DocH1>
        <DocP>
          TradeLikeMe sends real-time alerts for every meaningful trade event. You can receive notifications via Telegram, with WhatsApp support coming in a future release.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Connecting Telegram</DocH2>
        <DocUl items={[
          '1. Open Telegram and search for @tradelikeme_alerts_bot',
          '2. Send /start to the bot',
          '3. The bot will return a 6-digit verification code',
          '4. Enter the code in your TradeLikeMe dashboard under Settings → Notifications',
          '5. Send /verify [code] to complete the link',
        ]} />
        <DocCallout type="success">
          Once linked, you will receive alerts for all events on any strategy you are subscribed to.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Notification events</DocH2>
        <DocTable
          headers={['Event', 'When it fires', 'Example message']}
          rows={[
            ['ZONE_TOUCH', 'Price enters a watched S/D zone', '📍 SOL touched demand zone $87.00–87.20'],
            ['TRADE_ENTERED', 'Market order filled', '✅ LONG SOL entered at $87.05 | SL $84.00 | TP1 $90.50 | TP2 $94.00'],
            ['TP1_HIT', 'TP1 order filled', '🎯 TP1 hit — SOL $90.50. SL moved to break-even $87.05'],
            ['TP2_HIT', 'TP2 order filled', '🏆 TP2 hit — SOL $94.00. Trade closed. +8.2%'],
            ['SL_HIT', 'Body-close SL triggered', '🛑 SL triggered — SOL body closed below $84.00. Position closed. -3.1%'],
            ['BALANCE_LOW', 'Balance approaches MIN floor', '⚠️ Balance $37.20 — approaching minimum $35 floor'],
            ['AGENT_DOWN', 'Agent health check failure', '🔴 Agent offline. Disaster SL on exchange is active.'],
            ['DAILY_SUMMARY', 'Daily P&L report', '📊 Daily summary: 1 trade, +$1.43, balance $48.27'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Telegram bot commands</DocH2>
        <DocCodeBlock label="Available commands">{`/status        — show agent status, open positions, balance
/positions     — list all open positions
/balance       — current account balance
/trades        — last 10 trades with P&L
/winrate       — win rate for current strategy
/pause         — pause new entries (current positions stay open)
/resume        — resume entries
/pnl           — P&L summary (today / week / all time)
/notify on|off — toggle notifications on/off`}</DocCodeBlock>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>WhatsApp (coming soon)</DocH2>
        <DocP>
          WhatsApp notifications via Twilio are planned for a future release. The notification architecture supports multiple channels — once WhatsApp is enabled, you will be able to receive the same alerts on WhatsApp without any reconfiguration.
        </DocP>
        <DocCallout type="info">
          Telegram is the primary notification channel. WhatsApp will be opt-in when available.
        </DocCallout>
      </DocSection>
    </DocPage>
  )
}
