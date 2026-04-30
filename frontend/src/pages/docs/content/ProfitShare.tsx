import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function ProfitShare() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#0052FF">Investors</DocBadge>
        <DocH1>How Profit Share Works</DocH1>
        <DocP>
          TradeLikeMe earns 20% of profits generated. You keep 80%. There are no subscription fees, no per-trade commissions, and no fees on your principal. We only earn when you earn.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>The split</DocH2>
        <DocTable
          headers={['Deposit', 'Monthly return (8%)', 'You keep (80%)', 'Platform earns (20%)']}
          rows={[
            ['$1,000', '$80', '$64', '$16'],
            ['$10,000', '$800', '$640', '$160'],
            ['$100,000', '$8,000', '$6,400', '$1,600'],
            ['$500,000', '$40,000', '$32,000', '$8,000'],
          ]}
        />
        <DocCallout type="info">
          The 8% monthly return is illustrative based on strategy performance. Actual returns vary and are not guaranteed.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>How it's calculated</DocH2>
        <DocP>
          Profit is calculated as: closing balance of the epoch minus opening balance. Only realised profits are counted — unrealised P&L from open positions is excluded until those positions close.
        </DocP>
        <DocUl items={[
          'Epoch opens: balance recorded as base',
          'Agent trades throughout the epoch',
          'Epoch closes (30 days): closing balance calculated',
          'Profit = closing balance − opening balance',
          'If profit > 0: 20% deducted, 80% stays',
          'If profit = 0 or negative: nothing deducted — no fees on losses',
        ]} />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Settlement by mode</DocH2>
        <DocTable
          headers={['Mode', 'How it settles', 'Manual step required?']}
          rows={[
            ['Mode A — Solana Vault', 'Smart contract auto-deducts on withdrawal. Trustless, on-chain.', 'No — fully automated'],
            ['Mode B — CEX API', 'Monthly invoice via email. Pay via USDT transfer.', 'Yes — manual transfer'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>No profit, no fee</DocH2>
        <DocCallout type="success">
          If a month ends with a flat or negative balance, the platform earns nothing. The 20% only applies to real profits. Your principal is never touched by the profit share calculation.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Compounding</DocH2>
        <DocP>
          If you leave profits in the vault, the next epoch starts with a larger balance. Position sizing scales with balance — so each compound epoch, the agent can generate more absolute profit on the same percentage return.
        </DocP>
        <DocUl items={[
          'Epoch 1: $10,000 → +8% → $10,800. You keep $10,640, platform takes $160.',
          'Epoch 2: $10,640 → +8% → $11,491. You keep $11,148, platform takes $170.',
          'After 12 months compounding at 8%: $21,589 (vs $19,600 without compounding)',
        ]} />
      </DocSection>
    </DocPage>
  )
}
