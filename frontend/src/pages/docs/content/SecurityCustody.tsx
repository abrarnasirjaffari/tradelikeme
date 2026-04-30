import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout } from '../DocComponents'

export default function SecurityCustody() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#0052FF">Investors</DocBadge>
        <DocH1>Security & Custody</DocH1>
        <DocP>
          The single most important design principle on TradeLikeMe: the agent can never take your money. Here's exactly what the agent can and cannot do.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What the agent can do</DocH2>
        <DocUl items={[
          'Open perpetual positions on Drift, Jupiter, or Raydium (Mode A)',
          'Close perpetual positions (Mode A)',
          'Place take-profit and stop-loss orders (Mode A)',
          'Place market, limit, and stop orders on WEEX/Bybit/Binance (Mode B)',
          'Read your balance and position data',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>What the agent cannot do</DocH2>
        <DocUl items={[
          'Withdraw funds from any exchange or wallet',
          'Transfer funds to any external address',
          'Change your account settings or API permissions',
          'Access your seed phrase or private key',
          'Trade on any exchange not explicitly connected',
          'Place orders larger than the configured position size',
        ]} />
        <DocCallout type="success">
          Mode A: The Drift delegation transaction specifically excludes withdrawal authority. This is enforced at the smart contract level — it cannot be overridden by anyone, including TradeLikeMe.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Mode A — your funds never leave your control</DocH2>
        <DocP>
          In Mode A, your USDC or CASH is held in your own Drift sub-account vault. TradeLikeMe's agent is granted a scoped delegation — the Solana equivalent of a power of attorney limited to trading only.
        </DocP>
        <DocUl items={[
          'Funds are in your wallet, not in a TradeLikeMe custodial account',
          'You can revoke delegation at any time without TradeLikeMe\'s involvement',
          'If TradeLikeMe shuts down, you withdraw directly from Drift — no intermediary needed',
          'Profit share deducted on-chain by the smart contract — not by TradeLikeMe manually',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Mode B — trade-only API keys</DocH2>
        <DocP>
          Centralized exchanges offer trade-only API keys as a standard security feature. A trade-only key cannot authorize withdrawals even if the key is compromised.
        </DocP>
        <DocUl items={[
          'Always create a new API key specifically for TradeLikeMe',
          'Enable trade permissions only — never enable withdrawal permissions',
          'Set IP whitelist to 54.179.141.76 for maximum security',
          'Rotate your API key every 90 days as good practice',
          'Delete the key immediately if you suspect any unauthorized activity',
        ]} />
        <DocCallout type="warning">
          If you see unexpected trades in your exchange account that are not from TradeLikeMe, revoke the API key immediately and contact support@tradelikeme.xyz.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Two-factor authentication</DocH2>
        <DocP>
          We strongly recommend enabling 2FA (TOTP) on your TradeLikeMe account. Go to Settings → Security → Enable 2FA. This prevents unauthorized access to your dashboard and exchange connections even if your password is compromised.
        </DocP>
      </DocSection>
    </DocPage>
  )
}
