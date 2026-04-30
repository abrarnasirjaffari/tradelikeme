import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function ReadingDashboard() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#0052FF">Investors</DocBadge>
        <DocH1>Reading Your Dashboard</DocH1>
        <DocP>
          Your dashboard shows everything you need to monitor the agent's activity — open positions, trade history, P&L, and account health. Here's what each section means.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Overview cards</DocH2>
        <DocTable
          headers={['Card', 'What it shows']}
          rows={[
            ['Total balance', 'Your current account balance including unrealised P&L from open positions'],
            ['Available margin', 'Balance available for new trades (total minus margin in open positions)'],
            ['Open positions', 'Number of currently active trades (max 2)'],
            ['Today\'s P&L', 'Realised profit and loss for the current calendar day'],
            ['Win rate', 'Percentage of winning closed trades (all time for this strategy)'],
            ['Total return', 'Percentage return since you started following this strategy'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Open positions</DocH2>
        <DocP>Each open position shows:</DocP>
        <DocUl items={[
          'Symbol and direction (LONG/SHORT)',
          'Entry price and entry time',
          'Current price and unrealised P&L',
          'TP1 and TP2 levels',
          'SL level (disaster SL — the exchange hard stop)',
          'Status: WATCHING (sentinel active) / TP1 HIT (SL moved to entry)',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Trade history</DocH2>
        <DocP>Every closed trade shows:</DocP>
        <DocUl items={[
          'Symbol, direction, entry, exit price',
          'Entry and exit time',
          'P&L in USD and percentage',
          'Exit reason: TP1, TP2, SL (body close), SL (disaster), Manual',
          'Risk mode active at trade time',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>P&L summary</DocH2>
        <DocTable
          headers={['Metric', 'Definition']}
          rows={[
            ['Realised P&L (today)', 'Sum of closed trade profits/losses today'],
            ['Realised P&L (this epoch)', 'Sum of closed trade profits/losses since last profit settlement'],
            ['Unrealised P&L', 'Current mark-to-market value of open positions'],
            ['Win rate (all time)', 'Winning trades / total closed trades'],
            ['Average winner', 'Average P&L % of winning trades'],
            ['Average loser', 'Average P&L % of losing trades'],
            ['Profit factor', 'Total profit / total loss (above 1.0 is profitable)'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Agent status</DocH2>
        <DocTable
          headers={['Status', 'Meaning']}
          rows={[
            ['Scanning', 'Zone scanner is running — initial scan in progress (~40 min on startup)'],
            ['Active', 'Agent is live, sentinel watching, entries enabled'],
            ['Paused', 'You or the system has paused new entries. Open positions still managed.'],
            ['Offline', 'Agent process is down — disaster SL on exchange is active. Check alerts.'],
          ]}
        />
        <DocCallout type="warning">
          If you see "Offline" status, your exchange stop losses are still active. Contact support@tradelikeme.xyz immediately.
        </DocCallout>
      </DocSection>
    </DocPage>
  )
}
