import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPage, getCurrentSymbol, getCurrentTf } from "../browser.js";

// Maps our TF strings to the Binance interval keys used as cache keys in datafeed.js
const TF_TO_INTERVAL: Record<string, string> = {
  "1M": "1M",
  "1W": "1w",
  "1D": "1d",
  "4H": "4h",
  "1H": "1h",
  "30M": "30m",
  "15M": "15m",
  "5M": "5m",
};

export function registerGetOhlcv(server: McpServer): void {
  server.tool(
    "get_ohlcv",
    "Return the raw OHLCV candle data currently loaded in the chart as a JSON array. Each bar has {timestamp, open, high, low, close, volume}. Uses the current symbol/timeframe unless overridden. Call open_chart first.",
    {
      symbol: z.string().optional().describe("Override symbol e.g. SOLUSDT (defaults to current chart symbol)"),
      tf: z.string().optional().describe("Override timeframe e.g. 4H (defaults to current chart timeframe)"),
    },
    async ({ symbol, tf }) => {
      const page = getPage();
      const sym = symbol ?? getCurrentSymbol();
      const timeframe = tf ?? getCurrentTf();
      const interval = TF_TO_INTERVAL[timeframe] ?? timeframe.toLowerCase();
      const cacheKey = `${sym}_${interval}`;

      const bars = await page.evaluate(
        (key) => {
          const cache = (window as any).__ohlcvCache;
          if (!cache) return null;
          return cache[key] ?? null;
        },
        cacheKey
      );

      if (!bars) {
        throw new Error(
          `No OHLCV data in cache for key "${cacheKey}". Call open_chart("${sym}", "${timeframe}") first.`
        );
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ symbol: sym, tf: timeframe, bars }),
          },
        ],
      };
    }
  );
}
