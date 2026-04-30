import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function GettingStartedSolana() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#0052FF">Investors</DocBadge>
        <DocH1>Getting Started — Solana Vault</DocH1>
        <DocP>
          Mode A uses Drift Protocol on Solana. You deposit USDC or CASH into a vault, delegate trade authority to the agent via Phantom, and the agent trades on your behalf. Your funds never leave your wallet's control.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What you need</DocH2>
        <DocUl items={[
          'A Phantom wallet — download at phantom.app (or use Phantom\'s email sign-in)',
          'USDC or CASH stablecoin in your wallet',
          'A TradeLikeMe account (free, takes 2 minutes)',
        ]} />
        <DocCallout type="info">
          Don't have a crypto wallet? Phantom supports email sign-in — you can create a wallet with just an email address. No seed phrase required to get started.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Step-by-step setup</DocH2>
        <DocUl items={[
          '1. Visit tradelikeme.xyz and click "Get Started"',
          '2. Sign in with Phantom (email or wallet connect)',
          '3. Choose Mode A — Solana Vault',
          '4. Browse strategies — review win rate, return history, risk mode',
          '5. Select a strategy and click "Follow"',
          '6. Choose your risk mode: Conservative, Medium, or Aggressive',
          '7. Enter deposit amount in USDC or CASH',
          '8. Approve the deposit transaction in Phantom',
          '9. Sign the delegation transaction — this authorizes the agent to trade (not withdraw)',
          '10. Done. The agent begins scanning on your next zone refresh.',
        ]} />
        <DocCallout type="success">
          The delegation transaction is a one-time setup per strategy. You do not need to sign anything again unless you revoke and re-delegate.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Supported assets</DocH2>
        <DocTable
          headers={['Asset', 'Protocol', 'Max leverage']}
          rows={[
            ['USDC', 'Drift + Jupiter + Raydium', '20–250x depending on protocol'],
            ['CASH', 'Drift + Raydium', '20–50x'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Revoking access</DocH2>
        <DocP>
          You can revoke the agent's trade delegation at any time. Go to your dashboard and click "Revoke Delegation", or use Drift's interface directly. Revocation takes effect immediately — no pending trades will be placed after revocation.
        </DocP>
        <DocCallout type="warning">
          Revoking delegation does not close any open positions. If the agent has active trades when you revoke, those positions remain open until they hit TP or SL. You can close them manually on Drift.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Minimum deposit</DocH2>
        <DocP>
          There is no minimum deposit. However, the agent's position sizing (0.5% margin per trade) means smaller deposits will have fewer buffer trades before approaching the $35 minimum balance floor. See Risk Modes for details.
        </DocP>
      </DocSection>
    </DocPage>
  )
}
