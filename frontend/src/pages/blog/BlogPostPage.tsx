import { motion, type TargetAndTransition } from 'framer-motion'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { VIEW, fadeUp, stagger } from '../../lib/animate'
import WaitlistNavbar from '../WaitlistNavbar'
import Footer from '../../components/Footer'
import FadingVideo from '../../components/FadingVideo'
import ScrollProgress from '../../components/ScrollProgress'
import { posts } from './blogData'

function renderBody(body: string) {
  const lines = body.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} style={{
          fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
          color: '#fff', fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)',
          lineHeight: 1.15, letterSpacing: '-0.5px',
          margin: '2.5rem 0 1rem',
        }}>{line.slice(3)}</h2>
      )
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={i} style={{
          fontFamily: "'Barlow', sans-serif", fontWeight: 600,
          fontSize: '1rem', color: '#fff', margin: '1.25rem 0 0.25rem', lineHeight: 1.6,
        }}>{line.slice(2, -2)}</p>
      )
    } else if (line.trim() === '') {
      // skip blank lines (spacing handled by margins)
    } else {
      elements.push(
        <p key={i} style={{
          fontFamily: "'Barlow', sans-serif", fontWeight: 300,
          fontSize: '1.05rem', color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.75, margin: '0 0 1rem',
        }}>{line}</p>
      )
    }
    i++
  }
  return elements
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const post = posts.find(p => p.slug === slug)
  const related = posts.filter(p => p.slug !== slug).slice(0, 2)

  if (!post) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Post not found.</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#000' }}>
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        style={{ position: 'fixed', top: 0, left: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center top', zIndex: 0 }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollProgress />
        <WaitlistNavbar />

        {/* Hero */}
        <div style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 100%)', paddingTop: '9rem', paddingBottom: '4rem' }}>
          <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.08)}
            className="sec" style={{ maxWidth: '780px' }}
          >
            {/* back */}
            <motion.button variants={fadeUp}
              onClick={() => navigate('/blog')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px',
                color: 'rgba(255,255,255,0.35)', marginBottom: '2rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            >
              <ArrowLeft size={13} /> All posts
            </motion.button>

            {/* meta */}
            <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{
                fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '10px',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: post.categoryColor, background: `${post.categoryColor}18`,
                border: `1px solid ${post.categoryColor}30`,
                borderRadius: 9999, padding: '3px 10px',
              }}>{post.category}</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{post.date}</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{post.readTime}</span>
            </motion.div>

            {/* title */}
            <motion.h1 variants={fadeUp} style={{
              fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
              color: '#fff', margin: 0, lineHeight: 1.08, letterSpacing: '-1.5px',
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            }}>{post.title}</motion.h1>

            {/* excerpt */}
            <motion.p variants={fadeUp} style={{
              fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '1.5rem 0 0',
            }}>{post.excerpt}</motion.p>
          </motion.div>
        </div>

        <div style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(2px)' }}>

          {/* Article body */}
          <section className="sec" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
            <div style={{ maxWidth: '680px' }}>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '3rem' }} />
              <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}>
                {renderBody(post.body)}
              </motion.div>
            </div>
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 clamp(1.25rem, 5vw, 10rem)' }} />

          {/* Related posts */}
          {related.length > 0 && (
            <section className="sec" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
              <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}>
                <motion.p variants={fadeUp} style={{
                  fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px',
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                  marginBottom: '1.5rem',
                }}>More posts</motion.p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.25rem' }}>
                  {related.map(r => {
                    return (
                      <motion.article
                        key={r.slug}
                        variants={fadeUp}
                        onClick={() => navigate(`/blog/${r.slug}`)}
                        style={{
                          cursor: 'pointer', borderRadius: '1.25rem', padding: '1.75rem',
                          display: 'flex', flexDirection: 'column', gap: '1rem',
                          border: '1px solid rgba(255,255,255,0.07)',
                          background: 'rgba(255,255,255,0.02)',
                          transition: 'border-color 0.2s, background 0.2s',
                        }}
                        whileHover={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.04)' } as TargetAndTransition}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '10px',
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                            color: r.categoryColor, background: `${r.categoryColor}18`,
                            border: `1px solid ${r.categoryColor}30`,
                            borderRadius: 9999, padding: '3px 10px',
                          }}>{r.category}</span>
                          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>{r.readTime}</span>
                        </div>
                        <h3 style={{
                          fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                          color: '#fff', margin: 0, lineHeight: 1.15, letterSpacing: '-0.5px', fontSize: '1.2rem',
                        }}>{r.title}</h3>
                        <p style={{
                          fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '0.875rem',
                          color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0, flex: 1,
                        }}>{r.excerpt}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{r.date}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'rgba(255,255,255,0.3)' }}>
                            <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px' }}>Read</span>
                            <ArrowUpRight size={12} />
                          </div>
                        </div>
                      </motion.article>
                    )
                  })}
                </div>
              </motion.div>
            </section>
          )}

          {/* CTA */}
          <section className="sec" style={{ paddingBottom: '5rem' }}>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={fadeUp}
              style={{
                borderRadius: '1.5rem', padding: 'clamp(2rem, 5vw, 3.5rem)',
                background: 'rgba(0,82,255,0.06)', border: '1px solid rgba(0,82,255,0.18)',
                display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'flex-start',
              }}
            >
              <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0052FF' }}>Ready to trade?</span>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                color: '#fff', margin: 0, lineHeight: 1.1, letterSpacing: '-1px',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', maxWidth: '22ch',
              }}>Ready to let a proven agent trade for you?</h2>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '14px',
                  background: '#0052FF', color: '#fff', borderRadius: 9999,
                  padding: '11px 24px', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                Start Trading <ArrowUpRight size={14} />
              </button>
            </motion.div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  )
}
