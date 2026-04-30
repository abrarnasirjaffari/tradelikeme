import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout } from '../DocComponents'

export default function SubmitStrategy() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#22C55E">Traders</DocBadge>
        <DocH1>How to Submit Your Strategy</DocH1>
        <DocP>
          The submission process is designed to be thorough — we verify everything before building your agent. Plan for approximately 3 weeks from submission to live listing.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Step 1 — Initial email</DocH2>
        <DocP>
          Email traders@tradelikeme.xyz with the subject line "Strategy Submission". Include:
        </DocP>
        <DocUl items={[
          'Your approximate win rate and number of verified trades',
          'A brief description of your strategy approach (2–3 sentences)',
          'The asset class and exchanges you trade',
          'Your Telegram handle (for quick communication)',
        ]} />
        <DocCallout type="info">
          This is a screening email only. You do not need to reveal your strategy rules at this stage. We just need to know if you meet minimum requirements before scheduling a call.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Step 2 — Verification call</DocH2>
        <DocP>
          If your initial email passes screening, we schedule a 30-minute TradingView verification call. On this call:
        </DocP>
        <DocUl items={[
          'You share your TradingView screen',
          'We walk through 10–15 of your trades on chart',
          'We verify entry/exit match your stated rules',
          'We check for consistency — same rules applied every time',
          'We assess the logical codifiability of your rules',
        ]} />
        <DocCallout type="warning">
          If your rules require real-time judgment that cannot be expressed as explicit conditions, we will discuss how to adapt them for automation before proceeding.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Step 3 — Written strategy document</DocH2>
        <DocP>
          After the call, you write your complete strategy document. We provide a template. It must cover:
        </DocP>
        <DocUl items={[
          'Entry conditions (explicit, step-by-step)',
          'Direction logic (what tells you long vs short)',
          'Stop loss placement rule',
          'TP1 and TP2 levels',
          'Timeframe stack',
          'Coin/market selection criteria',
          'Entry filters and gates',
          'Risk mode parameters (Conservative / Medium / Aggressive)',
          'Edge cases and special conditions',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Step 4 — Agent build</DocH2>
        <DocP>
          Our team converts your written rules into a Python asyncio agent. You are not expected to write code. We handle the implementation — you review and approve the behavior.
        </DocP>
        <DocUl items={[
          'Build time: approximately 1 week',
          'You review a paper trade simulation before devnet deployment',
          'We iterate until the agent\'s behavior matches your rules exactly',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Step 5 — Devnet paper trial</DocH2>
        <DocP>
          The agent runs on Solana devnet for 2 weeks. You monitor and approve every trade decision. See the Devnet Paper Trial page for details.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Step 6 — Live listing</DocH2>
        <DocP>
          After you approve the devnet trial, the strategy goes live on the marketplace. Users can begin depositing immediately.
        </DocP>
        <DocCallout type="success">
          Timeline summary: Initial email → 2 days screening → verification call → 1 week rule writing → 1 week agent build → 2 weeks devnet trial → live. Total: approximately 3 weeks from submission to earnings.
        </DocCallout>
      </DocSection>
    </DocPage>
  )
}
