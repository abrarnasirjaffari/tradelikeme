import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPage, getCurrentSymbol, getCurrentTf } from "../browser.js";

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

export function registerGetPrice(server: McpServer): void {
  server.tool(
    "get_price",
    "Return the latest close price for the current chart symbol from the datafeed cache. Call open_chart first.",
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

      const result = await page.evaluate(
        (key) => {
          const cache = (window as any).__ohlcvCache;
          if (!cache) return { ok: false, error: "No __ohlcvCache on window" };
          const bars: any[] = cache[key];
          if (!bars || bars.length === 0) return { ok: false, error: `No data for key "${key}"` };
          const last = bars[bars.length - 1];
          return { ok: true, close: last.close, timestamp: last.timestamp };
        },
        cacheKey
      );

      if (!result.ok) {
        throw new Error(
          `get_price failed: ${result.error}. Call open_chart("${sym}", "${timeframe}") first.`
        );
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ symbol: sym, tf: timeframe, price: result.close, timestamp: result.timestamp }),
          },
        ],
      };
    }
  );
}
