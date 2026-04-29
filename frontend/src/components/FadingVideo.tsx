import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const FADE_MS = 500
const FADE_OUT_LEAD = 0.55

interface Props {
  src: string
  className?: string
  style?: React.CSSProperties
}

export default function FadingVideo({ src, className = '', style }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number>(0)
  const fadingOutRef = useRef(false)
  const { scrollY } = useScroll()

  // Subtle cinematic parallax — video drifts up + slightly zooms as you scroll
  const y = useTransform(scrollY, [0, 4000], [0, -180])
  const scale = useTransform(scrollY, [0, 4000], [1, 1.12])

  function fadeTo(target: number) {
    cancelAnimationFrame(rafRef.current)
    const video = videoRef.current
    if (!video) return
    const startTime = performance.now()
    const from = parseFloat(video.style.opacity ?? '0')
    const diff = target - from
    function tick(now: number) {
      const t = Math.min((now - startTime) / FADE_MS, 1)
      if (video) video.style.opacity = String(from + diff * t)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onLoaded = () => { video.style.opacity = '0'; video.play().catch(() => {}); fadeTo(1) }
    const onTimeUpdate = () => {
      const remaining = video.duration - video.currentTime
      if (!fadingOutRef.current && remaining <= FADE_OUT_LEAD && remaining > 0) {
        fadingOutRef.current = true; fadeTo(0)
      }
    }
    const onEnded = () => {
      video.style.opacity = '0'
      setTimeout(() => { video.currentTime = 0; video.play().catch(() => {}); fadingOutRef.current = false; fadeTo(1) }, 100)
    }
    video.addEventListener('loadeddata', onLoaded)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)
    return () => {
      cancelAnimationFrame(rafRef.current)
      video.removeEventListener('loadeddata', onLoaded)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [])

  // Extract position/size from style prop — apply to wrapper, video fills it
  const { objectFit, objectPosition, ...wrapperStyle } = style ?? {}

  return (
    <motion.div style={{ ...wrapperStyle, y, scale, transformOrigin: 'center top', overflow: 'hidden' }} className={className}>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{ opacity: 0, width: '100%', height: '100%', objectFit: (objectFit as any) ?? 'cover', objectPosition: objectPosition ?? 'top' }}
      />
    </motion.div>
  )
}
