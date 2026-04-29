// Binance Futures public REST datafeed for KLineChart Pro
// No API key required. Cache exposed on window for MCP get_ohlcv tool.
// Pyth benchmarks API used as fallback if Binance fails.

const BINANCE_BASE = 'https://fapi.binance.com/fapi/v1'
const PYTH_BASE = 'https://benchmarks.pyth.network/v1/shims/tradingview'

// window-level cache: { "SOLUSDT_4h": KLineData[] }
window.__ohlcvCache = {}

function toBinanceInterval(period) {
  const { multiplier, timespan } = period
  const map = { minute: 'm', hour: 'h', day: 'd', week: 'w', month: 'M' }
  return `${multiplier}${map[timespan] ?? timespan}`
}

// "SOLUSDT" -> "Crypto.SOL/USD", "BTCUSDT" -> "Crypto.BTC/USD"
function toPythSymbol(ticker) {
  const base = ticker.replace(/USDT$/, '').replace(/BUSD$/, '')
  return `Crypto.${base}/USD`
}

// period multiplier + timespan -> Pyth resolution in minutes
function toPythResolution(period) {
  const { multiplier, timespan } = period
  const minutesMap = { minute: 1, hour: 60, day: 1440, week: 10080, month: 43200 }
  return String((minutesMap[timespan] ?? 1) * multiplier)
}

async function fetchFromPyth(symbol, period) {
  const pythSymbol = encodeURIComponent(toPythSymbol(symbol.ticker))
  const resolution = toPythResolution(period)
  const to = Math.floor(Date.now() / 1000)
  const from = to - 500 * (parseInt(resolution) * 60)
  const url = `${PYTH_BASE}/history?symbol=${pythSymbol}&resolution=${resolution}&from=${from}&to=${to}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.s !== 'ok' || !Array.isArray(data.t)) return null
  return data.t.map((ts, i) => ({
    timestamp: ts * 1000,
    open: data.o[i],
    high: data.h[i],
    low: data.l[i],
    close: data.c[i],
    volume: data.v[i] ?? 0,
    turnover: 0
  }))
}

class CryptoDatafeed {
  async searchSymbols(search = '') {
    const res = await fetch(`${BINANCE_BASE}/exchangeInfo`)
    const data = await res.json()
    const q = search.toUpperCase()
    return (data.symbols || [])
      .filter(s => s.contractType === 'PERPETUAL' && s.symbol.includes(q))
      .slice(0, 50)
      .map(s => ({
        ticker: s.symbol,
        name: s.symbol,
        shortName: s.symbol,
        market: 'crypto',
        exchange: 'Binance Futures',
        priceCurrency: 'USDT',
        type: 'perpetual'
      }))
  }

  async getHistoryKLineData(symbol, period, from, to) {
    const interval = toBinanceInterval(period)
    const cacheKey = `${symbol.ticker}_${interval}`

    // Primary: Binance Futures
    try {
      const url = `${BINANCE_BASE}/klines?symbol=${symbol.ticker}&interval=${interval}&limit=500`
      const res = await fetch(url)
      const raw = await res.json()
      if (Array.isArray(raw) && raw.length > 0) {
        const bars = raw.map(k => ({
          timestamp: k[0],
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
          turnover: parseFloat(k[7])
        }))
        window.__ohlcvCache[cacheKey] = bars
        return bars
      }
    } catch (_) {}

    // Fallback: Pyth benchmarks HTTP API
    try {
      const bars = await fetchFromPyth(symbol, period)
      if (bars && bars.length > 0) {
        window.__ohlcvCache[cacheKey] = bars
        return bars
      }
    } catch (_) {}

    return []
  }

  subscribe(symbol, period, callback) {
    const interval = toBinanceInterval(period)
    const stream = `${symbol.ticker.toLowerCase()}@kline_${interval}`
    this._ws = new WebSocket(`wss://fstream.binance.com/stream?streams=${stream}`)
    this._ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      const k = msg?.data?.k
      if (!k) return
      callback({
        timestamp: k.t,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v),
        turnover: parseFloat(k.q)
      })
    }
  }

  unsubscribe(symbol, period) {
    this._ws?.close()
    this._ws = null
  }
}

window.__cryptoDatafeed = new CryptoDatafeed()
