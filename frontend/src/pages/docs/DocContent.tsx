import React from 'react'
import PlatformOverview from './content/PlatformOverview'
import HowAgentWorks from './content/HowAgentWorks'
import SentinelSystem from './content/SentinelSystem'
import NotificationsSetup from './content/NotificationsSetup'
import MarketplaceOverview from './content/MarketplaceOverview'
import SecurityTrust from './content/SecurityTrust'
import Glossary from './content/Glossary'
import Changelog from './content/Changelog'
import ContactSupport from './content/ContactSupport'
import GettingStartedSolana from './content/GettingStartedSolana'
import GettingStartedCex from './content/GettingStartedCex'
import DepositWithdraw from './content/DepositWithdraw'
import RiskModes from './content/RiskModes'
import ReadingDashboard from './content/ReadingDashboard'
import ProfitShare from './content/ProfitShare'
import SecurityCustody from './content/SecurityCustody'
import InvestorFaq from './content/InvestorFaq'
import TraderOverview from './content/TraderOverview'
import Requirements from './content/Requirements'
import SubmitStrategy from './content/SubmitStrategy'
import BuildAgent from './content/BuildAgent'
import DevnetTrial from './content/DevnetTrial'
import FeeTiers from './content/FeeTiers'
import ManageStrategy from './content/ManageStrategy'
import TraderFaq from './content/TraderFaq'

const MAP: Record<string, () => React.ReactElement> = {
  'platform-overview':      PlatformOverview,
  'how-agent-works':        HowAgentWorks,
  'sentinel-system':        SentinelSystem,
  'notifications-setup':    NotificationsSetup,
  'marketplace-overview':   MarketplaceOverview,
  'security-trust':         SecurityTrust,
  'glossary':               Glossary,
  'changelog':              Changelog,
  'contact-support':        ContactSupport,
  'getting-started-solana': GettingStartedSolana,
  'getting-started-cex':    GettingStartedCex,
  'deposit-withdraw':       DepositWithdraw,
  'risk-modes':             RiskModes,
  'reading-dashboard':      ReadingDashboard,
  'profit-share':           ProfitShare,
  'security-custody':       SecurityCustody,
  'investor-faq':           InvestorFaq,
  'trader-overview':        TraderOverview,
  'requirements':           Requirements,
  'submit-strategy':        SubmitStrategy,
  'build-agent':            BuildAgent,
  'devnet-trial':           DevnetTrial,
  'fee-tiers':              FeeTiers,
  'manage-strategy':        ManageStrategy,
  'trader-faq':             TraderFaq,
}

export default function DocContent({ docId }: { docId: string }) {
  const Component = MAP[docId] || PlatformOverview
  return <Component />
}
