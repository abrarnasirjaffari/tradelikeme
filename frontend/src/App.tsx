import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import FeatureMarketplace from './components/FeatureMarketplace'
import FeatureDualMode from './components/FeatureDualMode'
import FeatureResults from './components/FeatureResults'
import HowItWorks from './components/HowItWorks'
import OpenSource from './components/OpenSource'
import Pricing from './components/Pricing'
import ForTraders from './components/ForTraders'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import FadingVideo from './components/FadingVideo'
import ScrollProgress from './components/ScrollProgress'
import Waitlist from './pages/Waitlist'
import HowItWorksPage from './pages/HowItWorksPage'
import PricingPage from './pages/PricingPage'
import OpenSourcePage from './pages/OpenSourcePage'
import JoinWaitlist from './pages/JoinWaitlist'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import SignupPage from './pages/SignupPage'
import DocsPage from './pages/docs/DocsPage'
import BlogPage from './pages/blog/BlogPage'
import BlogPostPage from './pages/blog/BlogPostPage'
import DashboardPage from './pages/DashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import TwoFactorSetupPage from './pages/TwoFactorSetupPage'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import SubmitStrategyPage from './pages/SubmitStrategyPage'
import VoiceCallButton from './components/VoiceCallButton'
import AdminPage from './pages/admin/AdminPage'
import StrategiesPage from './pages/investor/StrategiesPage'
import StrategyDetailPage from './pages/investor/StrategyDetailPage'
import VaultsPage from './pages/investor/VaultsPage'
import ConnectPage from './pages/investor/ConnectPage'
import TradeHistoryPage from './pages/investor/TradeHistoryPage'
import ActiveTradesPage from './pages/investor/ActiveTradesPage'
import AnalyticsPage from './pages/investor/AnalyticsPage'
import RiskSettingsPage from './pages/investor/RiskSettingsPage'
import NotificationSettingsPage from './pages/investor/NotificationSettingsPage'
import AccountSettingsPage from './pages/investor/AccountSettingsPage'
import ReferralPage from './pages/investor/ReferralPage'
import TraderEarningsPage from './pages/trader/TraderEarningsPage'
import TraderStrategyPage from './pages/trader/TraderStrategyPage'
import TraderOverviewPage from './pages/trader/TraderOverviewPage'
import TraderPerformancePage from './pages/trader/TraderPerformancePage'
import TraderTradeLogPage from './pages/trader/TraderTradeLogPage'
import TraderSubscribersPage from './pages/trader/TraderSubscribersPage'
import TraderSubmitStrategyPage from './pages/trader/TraderSubmitStrategyPage'

const HR = <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 10rem' }} />

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function HomePage() {
  return (
    <div style={{ background: '#000' }}>
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollProgress />
        <Navbar />
        <div style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 100%)' }}>
          <Hero />
        </div>
        <div style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(2px)' }}>
          <StatsBar />
          {HR}
          <FeatureMarketplace />
          {HR}
          <FeatureDualMode />
          {HR}
          <OpenSource />
          {HR}
          <Pricing />
          {HR}
          <ForTraders />
          {HR}
          <FAQ />
        </div>
        <FinalCTA />
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/join-waitlist" element={<JoinWaitlist />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/open-source" element={<OpenSourcePage />} />
        <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
        <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/docs/*" element={<DocsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/submit-strategy" element={<SubmitStrategyPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/2fa-setup" element={<ProtectedRoute><TwoFactorSetupPage /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

        {/* Investor — public */}
        <Route path="/strategies" element={<StrategiesPage />} />
        <Route path="/strategies/:id" element={<StrategyDetailPage />} />
        <Route path="/connect" element={<ConnectPage />} />

        {/* Investor — protected */}
        <Route path="/vaults" element={<ProtectedRoute><VaultsPage /></ProtectedRoute>} />
        <Route path="/trades" element={<ProtectedRoute><TradeHistoryPage /></ProtectedRoute>} />
        <Route path="/trades/active" element={<ProtectedRoute><ActiveTradesPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings/risk" element={<ProtectedRoute><RiskSettingsPage /></ProtectedRoute>} />
        <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettingsPage /></ProtectedRoute>} />
        <Route path="/settings/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
        <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />

        {/* Trader */}
        <Route path="/trader" element={<ProtectedRoute><TraderOverviewPage /></ProtectedRoute>} />
        <Route path="/trader/performance" element={<ProtectedRoute><TraderPerformancePage /></ProtectedRoute>} />
        <Route path="/trader/trades" element={<ProtectedRoute><TraderTradeLogPage /></ProtectedRoute>} />
        <Route path="/trader/earnings" element={<ProtectedRoute><TraderEarningsPage /></ProtectedRoute>} />
        <Route path="/trader/strategy" element={<ProtectedRoute><TraderStrategyPage /></ProtectedRoute>} />
        <Route path="/trader/subscribers" element={<ProtectedRoute><TraderSubscribersPage /></ProtectedRoute>} />
        <Route path="/trader/submit" element={<ProtectedRoute><TraderSubmitStrategyPage /></ProtectedRoute>} />
      </Routes>
      <VoiceCallButton variant="floating" />
    </>
  )
}
