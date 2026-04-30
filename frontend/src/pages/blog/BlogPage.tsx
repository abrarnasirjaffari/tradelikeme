import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { VIEW, fadeUp, stagger } from '../../lib/animate'
import WaitlistNavbar from '../WaitlistNavbar'
import Footer from '../../components/Footer'
import FadingVideo from '../../components/FadingVideo'
import ScrollProgress from '../../components/ScrollProgress'
import { posts, type BlogPost } from './blogData'

function navigate(path: string) {
  window.history.pushState({}, '', path)
  window.scrollTo(0, 0)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const CATEGORIES = ['All', ...Array.from(new Set(posts.map(p => p.category)))]

function PostCard({ post, large }: { post: BlogPost; large?: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.article
      variants={fadeUp}
      onClick={() => navigate(`/blog/${post.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        borderRadius: large ? '1.5rem' : '1.25rem',
        padding: large ? '2.5rem' : '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: large ? '1.25rem' : '1rem',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        background: hovered ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
        transition: 'border-color 0.2s, background 0.2s',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* category + read time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{
          fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '10px',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: post.categoryColor, background: `${post.categoryColor}18`,
          border: `1px solid ${post.categoryColor}30`,
          borderRadius: 9999, padding: '3px 10px',
        }}>{post.category}</span>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>
          {post.readTime}
        </span>
      </div>

      {/* title */}
      <h2 style={{
        fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
        color: '#fff', margin: 0, lineHeight: 1.15, letterSpacing: '-0.5px',
        fontSize: large ? 'clamp(1.5rem, 2.5vw, 2rem)' : '1.2rem',
        transition: 'opacity 0.2s',
        opacity: hovered ? 0.85 : 1,
      }}>{post.title}</h2>

      {/* excerpt */}
      <p style={{
        fontFamily: "'Barlow', sans-serif", fontWeight: 300,
        fontSize: large ? '1rem' : '0.9rem',
        color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0,
        flex: 1,
      }}>{post.excerpt}</p>

      {/* footer row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
          {post.date}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: hovered ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}>
          <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '12px' }}>Read</span>
          <ArrowUpRight size={12} />
        </div>
      </div>
    </motion.article>
  )
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const featured = posts.find(p => p.featured)!
  const rest = posts.filter(p => !p.featured)
  const filtered = activeCategory === 'All' ? rest : rest.filter(p => p.category === activeCategory)

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
        <div style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)', paddingTop: '10rem', paddingBottom: '4rem' }}>
          <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}
            className="sec" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <motion.div variants={fadeUp}>
              <span style={{
                fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px',
                letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
              }}>TradeLikeMe Blog</span>
            </motion.div>
            <motion.h1 variants={fadeUp} style={{
              fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
              color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              lineHeight: 1.05, letterSpacing: '-2px', margin: 0, maxWidth: '16ch',
            }}>
              Strategy. Proof. Transparency.
            </motion.h1>
            <motion.p variants={fadeUp} style={{
              fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0, maxWidth: '52ch',
            }}>
              How we trade, why we trade it, and the data behind every claim we make.
            </motion.p>
          </motion.div>
        </div>

        <div style={{ background: 'rgba(2,4,12,0.92)', backdropFilter: 'blur(2px)' }}>

          {/* Featured post */}
          <section className="sec" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
            <motion.div initial="hidden" whileInView="show" viewport={VIEW} variants={stagger(0.1)}>
              <motion.p variants={fadeUp} style={{
                fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '11px',
                letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                marginBottom: '1.25rem',
              }}>Featured</motion.p>
              <motion.article
                variants={fadeUp}
                onClick={() => navigate(`/blog/${featured.slug}`)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '1.5rem',
                  padding: 'clamp(1.75rem, 4vw, 3rem)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '2rem',
                  alignItems: 'end',
                  background: 'rgba(0,82,255,0.06)',
                  border: '1px solid rgba(0,82,255,0.18)',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                whileHover={{ borderColor: 'rgba(0,82,255,0.35)', backgroundColor: 'rgba(0,82,255,0.09)' } as any}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: '10px',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: featured.categoryColor, background: `${featured.categoryColor}18`,
                      border: `1px solid ${featured.categoryColor}30`,
                      borderRadius: 9999, padding: '3px 10px',
                    }}>{featured.category}</span>
                    <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{featured.readTime}</span>
                  </div>
                  <h2 style={{
                    fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                    color: '#fff', margin: 0, lineHeight: 1.1, letterSpacing: '-1px',
                    fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', maxWidth: '24ch',
                  }}>{featured.title}</h2>
                  <p style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 300, fontSize: '1rem',
                    color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0, maxWidth: '58ch',
                  }}>{featured.excerpt}</p>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{featured.date}</span>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(0,82,255,0.15)', border: '1px solid rgba(0,82,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ArrowUpRight size={18} color="#0052FF" />
                </div>
              </motion.article>
            </motion.div>
          </section>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 clamp(1.25rem, 5vw, 10rem)' }} />

          {/* Filter tabs */}
          <section className="sec" style={{ paddingTop: '2.5rem', paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: '13px',
                    padding: '6px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: activeCategory === cat ? '#0052FF' : 'rgba(255,255,255,0.06)',
                    color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                >{cat}</button>
              ))}
            </div>
          </section>

          {/* Post grid */}
          <section className="sec" style={{ paddingBottom: '5rem' }}>
            <motion.div
              key={activeCategory}
              initial="hidden" animate="show" variants={stagger(0.07)}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                gap: '1.25rem',
              }}
            >
              {filtered.map(post => <PostCard key={post.slug} post={post} />)}
            </motion.div>
            {filtered.length === 0 && (
              <p style={{ fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.3)', fontSize: '14px', textAlign: 'center', padding: '4rem 0' }}>
                No posts in this category yet.
              </p>
            )}
          </section>
        </div>

        <Footer />
      </div>
    </div>
  )
}
