export type Exchange = 'binance' | 'weex' | 'bybit' | 'bingx' | 'blofin' | 'bitget' | 'other'
export type Mode = 'solana' | 'cex' | ''
export type Notification = 'whatsapp' | 'telegram' | 'email'

export interface InvestorFields {
  name: string
  email: string
  whatsapp: string
  telegram: string
  depositAmount: number
  mode: Mode
  exchanges: Exchange[]
  otherExchange: string
  notifications: Notification[]
  heardFrom: string
  frustration: string
  country: string
}

export const defaultInvestorFields: InvestorFields = {
  name: '',
  email: '',
  whatsapp: '',
  telegram: '',
  depositAmount: 500,
  mode: '',
  exchanges: [],
  otherExchange: '',
  notifications: [],
  heardFrom: '',
  frustration: '',
  country: '',
}

export const EXCHANGES: { val: Exchange; label: string }[] = [
  { val: 'binance', label: 'Binance' },
  { val: 'weex',    label: 'WEEX' },
  { val: 'bybit',   label: 'Bybit' },
  { val: 'bingx',   label: 'BingX' },
  { val: 'blofin',  label: 'Blofin' },
  { val: 'bitget',  label: 'Bitget' },
  { val: 'other',   label: 'Other' },
]

export const NOTIFICATIONS: { val: Notification; label: string; sub: string }[] = [
  { val: 'email',    label: 'Email',    sub: 'Trade alerts by email' },
  { val: 'telegram', label: 'Telegram', sub: 'Instant alerts' },
  { val: 'whatsapp', label: 'WhatsApp', sub: 'Mobile notifications' },
]

export const FRUSTRATIONS = [
  "I keep getting stopped out",
  "I don't have time to watch charts",
  "I don't know when to enter or exit",
  "I've lost money on other platforms",
  "I want passive income from crypto",
  "Other",
]
