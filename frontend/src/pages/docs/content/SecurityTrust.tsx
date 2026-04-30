import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function SecurityTrust() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge>Platform</DocBadge>
        <DocH1>Security & Trust</DocH1>
        <DocP>
          TradeLikeMe is built around a single principle: the agent should never be able to take your money. Every design decision — from Drift delegation to encrypted API keys — exists to enforce this boundary.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Mode A — Solana Vault</DocH2>
        <DocUl items={[
          'You sign a delegation transaction via Phantom — not a withdrawal authorization',
          'The delegation grants trade authority only (open/close positions)',
          'The agent cannot withdraw, transfer, or move funds to any external address',
          'Your USDC/CASH stays in your Drift sub-account vault at all times',
          'Revoke delegation instantly via Drift\'s interface — no waiting period',
          'Smart contract (Anchor program) handles profit settlement on-chain — no manual steps',
        ]} />
        <DocCallout type="success">
          Trustless by design. No counterparty risk on your principal. Even if TradeLikeMe disappears, your funds remain in your wallet and can be withdrawn directly via Drift.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Mode B — CEX API</DocH2>
        <DocUl items={[
          'You provide a trade-only API key — not a withdrawal key',
          'Trade-only keys are a standard exchange feature — they cannot authorize withdrawals',
          'API keys are encrypted at rest using AES-256',
          'Keys are never stored or transmitted in plaintext',
          'You can revoke the API key from your exchange at any time — agent access ends immediately',
        ]} />
        <DocCallout type="warning">
          Never provide an API key with withdrawal permissions. TradeLikeMe will only request trade-only keys during setup, and will warn you if the key has unnecessary permissions.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Infrastructure security</DocH2>
        <DocTable
          headers={['Layer', 'Protection']}
          rows={[
            ['Transport', 'TLS 1.3 on all API endpoints and WebSocket connections'],
            ['At-rest encryption', 'AES-256 for API keys and sensitive user data'],
            ['Authentication', 'BetterAuth — sessions, 2FA/TOTP, rate limiting, signed JWTs'],
            ['Access control', 'Role-based (admin / trader / user) — users cannot access other users\' data'],
            ['Rate limiting', 'Applied on all public endpoints — brute force and enumeration protection'],
            ['Server', 'AWS EC2 in Singapore, no public ports except 443 (HTTPS) and 22 (SSH, key-only)'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Disaster scenarios</DocH2>
        <DocTable
          headers={['Scenario', 'What happens']}
          rows={[
            ['Sentinel goes down', 'Disaster SL on exchange fires. Hard stop at structural + 3% buffer. Telegram alert sent.'],
            ['Agent crashes', 'TP1, TP2, and disaster SL remain live on exchange. Positions are still managed.'],
            ['EC2 goes down', 'All exchange orders stay live. No new entries possible until server restarts. Health check alert fires.'],
            ['TradeLikeMe shuts down', 'Mode A: your funds are in your Drift vault — withdraw directly. Mode B: revoke API key from exchange.'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Responsible disclosure</DocH2>
        <DocP>
          If you discover a security vulnerability, please report it to security@tradelikeme.xyz. Do not disclose publicly until we have had a chance to address it. We aim to respond within 48 hours.
        </DocP>
      </DocSection>
    </DocPage>
  )
}
