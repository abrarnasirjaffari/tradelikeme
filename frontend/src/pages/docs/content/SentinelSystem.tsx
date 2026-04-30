import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function SentinelSystem() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge>Platform</DocBadge>
        <DocH1>Sentinel System</DocH1>
        <DocP>
          The sentinel is a lightweight WebSocket price watcher that runs 24/7 and burns zero AI tokens. Instead of running the full agent loop continuously, the agent wakes only when the sentinel detects a meaningful event.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Why a sentinel?</DocH2>
        <DocP>
          Running Claude Opus 4.6 every tick would be prohibitively expensive and slow. The sentinel solves this by watching prices with pure WebSocket math — no AI, no API calls. It only triggers the agent when something real happens.
        </DocP>
        <DocCallout type="success">
          The sentinel watches all positions 24/7 at near-zero cost. The agent (which uses AI for zone analysis) only activates on actual trade events.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Three watches</DocH2>
        <DocTable
          headers={['Watch', 'Trigger', 'Agent action']}
          rows={[
            ['Zone touch', 'Price enters a watched zone (WebSocket tick)', 'Wake agent → validate setup → place 4 orders'],
            ['TP1 hit', 'Price crosses TP1 level (WebSocket tick)', 'Wake agent → move SL to break-even entry'],
            ['30m body-close SL', 'Every 30-minute candle close', 'Check if candle BODY closed below SL. If yes → wake agent → close position'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Body-close stop loss logic</DocH2>
        <DocP>
          This is one of the most important mechanics on the platform. Most exchanges trigger stop losses on wicks — a momentary price spike that immediately reverses. Sonum's strategy ignores wicks entirely.
        </DocP>
        <DocUl items={[
          'Wick past SL level → sentinel ignores it, position stays open',
          'Candle BODY closes past SL level → sentinel signals agent → position closed',
          '70% wick survival rate — 70% of the time, wicks past SL reverse before the candle closes',
          'Real example: AAVE wicked to $85.05 (below $86 SL), body closed at $86.34 → trade continued → +2192%',
        ]} />
        <DocCallout type="warning">
          The exchange hard SL (disaster SL) is set at structural level + 3% buffer. It only fires if the sentinel process goes down. It is NOT the primary stop loss.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>On entry — 4 orders placed simultaneously</DocH2>
        <DocUl items={[
          '1. Market order — fills entry at current price',
          '2. TP1 limit order — 50% of position qty at zone 1',
          '3. TP2 limit order — 50% of position qty at zone 2',
          '4. Disaster SL — 100% qty at structural level + 3% buffer (exchange hard stop)',
        ]} />
        <DocP>
          After TP1 fills, the agent modifies the disaster SL to the entry price (break-even). From this point, the sentinel continues watching the 30-minute candle body close only.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Resilience</DocH2>
        <DocTable
          headers={['Scenario', 'What happens']}
          rows={[
            ['Sentinel goes down', 'Disaster SL on exchange fires automatically at structural + 3%'],
            ['WebSocket disconnects', 'Auto-reconnect with exponential backoff'],
            ['Agent crashes after entry', 'Exchange orders (TP1, TP2, disaster SL) remain live — positions still managed'],
            ['Sentinel health check fails', 'Telegram alert sent immediately'],
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
