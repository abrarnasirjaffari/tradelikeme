import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function DepositWithdraw() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#0052FF">Investors</DocBadge>
        <DocH1>Deposit & Withdraw</DocH1>
        <DocP>
          How deposits, withdrawals, and profit settlement work for both modes.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Mode A — Solana Vault</DocH2>
        <DocH2>Depositing</DocH2>
        <DocUl items={[
          'Go to your dashboard → Vault → Deposit',
          'Enter amount in USDC or CASH',
          'Approve the transaction in Phantom — funds move to your Drift sub-account vault',
          'Deposit is available immediately — agent can trade on it in the next zone refresh',
        ]} />

        <DocH2>Withdrawing</DocH2>
        <DocUl items={[
          'Go to your dashboard → Vault → Withdraw',
          'Enter amount (up to full available balance)',
          'Withdrawal window: minimum 3 days, maximum 30 days (set by strategy)',
          'TradeLikeMe default strategy: 30-day withdrawal window',
          'Withdrawal processed on-chain — funds return to your Phantom wallet',
        ]} />
        <DocCallout type="info">
          The withdrawal window exists to prevent mid-trade withdrawals that would leave open positions without sufficient margin. Open positions reduce the withdrawable amount until they close.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Mode B — CEX API</DocH2>
        <DocP>
          In Mode B, your funds stay entirely on the exchange. There is no deposit to TradeLikeMe — you deposit and withdraw directly from your exchange account. The agent only reads your balance and places trades.
        </DocP>
        <DocCallout type="success">
          To stop the agent from trading, either remove the API key from TradeLikeMe or change the passphrase on the exchange. Your funds remain on the exchange regardless.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Profit settlement</DocH2>
        <DocTable
          headers={['Mode', 'How it works', 'When']}
          rows={[
            ['Mode A', 'Smart contract auto-deducts 20% of profit before withdrawal. Happens on-chain, trustless.', 'On withdrawal (epoch closes)'],
            ['Mode B', 'Per-trade P&L tracked. Monthly invoice emailed. Payment via USDT transfer.', 'Monthly (1st of each month)'],
          ]}
        />
        <DocCallout type="warning">
          Mode B profit share is currently on an honour system for Phase 1. Automated enforcement via exchange balance monitoring will be added in a future release.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Compounding</DocH2>
        <DocP>
          Profits left in the vault compound automatically — the agent uses the full available balance for position sizing each epoch. You do not need to manually reinvest.
        </DocP>
        <DocUl items={[
          'Mode A: profits stay in the vault until you withdraw',
          'Mode B: exchange balance grows with each winning trade',
          'Position sizing recalculates based on current balance every 72 hours',
        ]} />
      </DocSection>
    </DocPage>
  )
}
