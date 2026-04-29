export type TraderExchange = 'binance' | 'weex' | 'bybit' | 'bingx' | 'bitget' | 'other'
export type StrategyType = 'sd' | 'ict' | 'price_action' | 'indicators' | 'algo' | 'other'
export type Experience = '<1yr' | '1-3yr' | '3-5yr' | '5yr+'
export type RR = '1:1' | '1:2' | '1:3' | '1:4+'

export interface TraderFields {
  name: string
  email: string
  whatsapp: string
  telegram: string
  experience: Experience | ''
  winRate: number
  tradeCount: number
  strategy: StrategyType | ''
  exchanges: TraderExchange[]
  coins: string[]
  customCoin: string
  rr: RR | ''
  uniqueEdge: string
  notifications: string[]
  heardFrom: string
}

export const defaultTraderFields: TraderFields = {
  name: '',
  email: '',
  whatsapp: '',
  telegram: '',
  experience: '',
  winRate: 65,
  tradeCount: 50,
  strategy: '',
  exchanges: [],
  coins: [],
  customCoin: '',
  rr: '',
  uniqueEdge: '',
  notifications: [],
  heardFrom: '',
}

export const TRADER_EXCHANGES: { val: TraderExchange; label: string }[] = [
  { val: 'binance', label: 'Binance' },
  { val: 'weex',    label: 'WEEX' },
  { val: 'bybit',   label: 'Bybit' },
  { val: 'bingx',   label: 'BingX' },
  { val: 'bitget',  label: 'Bitget' },
  { val: 'other',   label: 'Other' },
]

export const STRATEGY_TYPES: { val: StrategyType; label: string }[] = [
  { val: 'sd',           label: 'S&D Zones' },
  { val: 'ict',          label: 'ICT' },
  { val: 'price_action', label: 'Price Action' },
  { val: 'indicators',   label: 'Indicators' },
  { val: 'algo',         label: 'Algo / Bot' },
  { val: 'other',        label: 'Other' },
]

export const POPULAR_COINS = [
  'BTC', 'ETH', 'SOL', 'XRP', 'BNB',
  'SUI', 'DOGE', 'ADA', 'LINK', 'DOT',
  'UNI', 'AAVE', 'LTC', 'TAO', 'WIF',
]

export const EXPERIENCE_OPTIONS: { val: Experience; label: string }[] = [
  { val: '<1yr',  label: 'Under 1 year' },
  { val: '1-3yr', label: '1 – 3 years' },
  { val: '3-5yr', label: '3 – 5 years' },
  { val: '5yr+',  label: '5+ years' },
]

export const RR_OPTIONS: RR[] = ['1:1', '1:2', '1:3', '1:4+']

export const TRADER_NOTIFICATIONS = [
  { val: 'email',    label: 'Email',    sub: 'Trade alerts by email' },
  { val: 'telegram', label: 'Telegram', sub: 'Instant alerts' },
  { val: 'whatsapp', label: 'WhatsApp', sub: 'Mobile notifications' },
]
