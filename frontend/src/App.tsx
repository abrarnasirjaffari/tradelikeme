import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Capabilities from './components/Capabilities'
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

const HR = <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 10rem' }} />

function usePage() {
  const [page, setPage] = useState(() => window.location.pathname)
  useEffect(() => {
    const handler = () => { setPage(window.location.pathname); window.scrollTo(0, 0) }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])
  return page
}

export default function App() {
  const page = usePage()

  if (page === '/waitlist' || page === '/')  return <Waitlist />
  if (page === '/join-waitlist')  return <JoinWaitlist />
  if (page === '/how-it-works')  return <HowItWorksPage />
  if (page === '/pricing')       return <PricingPage />
  if (page === '/open-source')   return <OpenSourcePage />
  if (page === '/signup')         return <SignupPage />
  if (page === '/login')          return <SignupPage />
  if (page === '/privacy')       return <PrivacyPage />
  if (page === '/terms')         return <TermsPage />
  if (page.startsWith('/docs'))  return <DocsPage />
  if (page === '/blog')         return <BlogPage />
  if (page.startsWith('/blog/')) return <BlogPostPage slug={page.replace('/blog/', '')} />

  return (
    <div style={{ background: '#000' }}>
      {/* Fixed cinematic 3D video — parallax applied inside */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{
          position: 'fixed',
          top: 0,
          left: '-10%',
          width: '120%',
          height: '120%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollProgress />
        <Navbar />

        {/* Hero + Capabilities — transparent, video shows through */}
        <div style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 100%)' }}>
          <Hero />
        </div>
        {/* Solid content sections — sit above video like a dark sheet */}
        <div style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(2px)' }}>
          <StatsBar />
          {HR}
          <FeatureMarketplace />
          {HR}
          <FeatureDualMode />
          {HR}
          <FeatureResults />
          {HR}
          <HowItWorks />
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
