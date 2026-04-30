export type DocItem = {
  id: string
  label: string
}

export type DocSection = {
  id: string
  label: string
  audience: 'investor' | 'trader' | 'shared'
  items: DocItem[]
}

export const DOC_SECTIONS: DocSection[] = [
  {
    id: 'investors',
    label: 'For Investors',
    audience: 'investor',
    items: [
      { id: 'getting-started-solana',  label: 'Getting Started — Solana Vault' },
      { id: 'getting-started-cex',     label: 'Getting Started — CEX API' },
      { id: 'deposit-withdraw',        label: 'Deposit & Withdraw' },
      { id: 'risk-modes',              label: 'Risk Modes' },
      { id: 'reading-dashboard',       label: 'Reading Your Dashboard' },
      { id: 'profit-share',            label: 'How Profit Share Works' },
      { id: 'security-custody',        label: 'Security & Custody' },
      { id: 'investor-faq',            label: 'Investor FAQ' },
    ],
  },
  {
    id: 'traders',
    label: 'For Traders',
    audience: 'trader',
    items: [
      { id: 'trader-overview',         label: 'Trader Overview' },
      { id: 'requirements',            label: 'Requirements & Eligibility' },
      { id: 'submit-strategy',         label: 'How to Submit Your Strategy' },
      { id: 'build-agent',             label: 'How We Build Your Agent' },
      { id: 'devnet-trial',            label: 'Devnet Paper Trial' },
      { id: 'fee-tiers',               label: 'Fee Tiers & Earnings' },
      { id: 'manage-strategy',         label: 'Managing Your Live Strategy' },
      { id: 'trader-faq',              label: 'Trader FAQ' },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    audience: 'shared',
    items: [
      { id: 'platform-overview',       label: 'Platform Overview' },
      { id: 'how-agent-works',         label: 'How the Agent Works' },
      { id: 'sentinel-system',         label: 'Sentinel System' },
      { id: 'notifications-setup',     label: 'Notifications Setup' },
      { id: 'marketplace-overview',    label: 'Marketplace Overview' },
      { id: 'security-trust',          label: 'Security & Trust' },
      { id: 'glossary',                label: 'Glossary' },
      { id: 'changelog',               label: 'Changelog' },
      { id: 'contact-support',         label: 'Contact & Support' },
    ],
  },
]

export function findDoc(id: string): { section: DocSection; item: DocItem } | null {
  for (const section of DOC_SECTIONS) {
    const item = section.items.find(i => i.id === id)
    if (item) return { section, item }
  }
  return null
}

export const DEFAULT_DOC_ID = 'platform-overview'
