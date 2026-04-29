import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  text: string
  className?: string
  style?: React.CSSProperties
}

export default function BlurText({ text, className = '', style }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true) },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const words = text.split(' ')

  return (
    <p
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em', ...style }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={triggered
            ? { filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'], opacity: [0, 0.5, 1], y: [50, -5, 0] }
            : {}
          }
          transition={{ duration: 0.7, delay: (i * 100) / 1000, ease: 'easeOut', times: [0, 0.5, 1] }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}
