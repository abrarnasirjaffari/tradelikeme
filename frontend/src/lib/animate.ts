// Shared animation presets — amount:0 means fire the instant 1px enters viewport
export const VIEW = { once: true, amount: 0 } as const

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
} as const

export const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
} as const

export const fadeRight = {
  hidden: { opacity: 0, x: 32 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
} as const

export const stagger = (delay = 0.1) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay } },
} as const)
