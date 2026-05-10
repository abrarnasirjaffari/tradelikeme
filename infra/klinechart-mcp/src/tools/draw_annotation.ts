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

export function registerDrawAnnotation(server: McpServer): void {
  server.tool(
    "draw_annotation",
    "Draw an arrow annotation at a specific price on the chart (use for marking entry points). Returns the overlay id.",
    {
      price:  z.number().describe("Price level for the annotation"),
      label:  z.string().describe('Text to show e.g. "Entry ↑" or "Entry ↓"'),
      color:  z.string().optional().describe("Hex color (default: #3b82f6 blue)"),
      symbol: z.string().optional().describe("Defaults to current chart symbol"),
      tf:     z.string().optional().describe("Defaults to current chart timeframe"),
    },
    async ({ price, label, color, symbol, tf }) => {
      const page = getPage();
      const sym       = symbol ?? getCurrentSymbol();
      const timeframe = tf ?? getCurrentTf();
      const interval  = TF_TO_INTERVAL[timeframe] ?? timeframe.toLowerCase();
      const cacheKey  = `${sym}_${interval}`;
      const resolvedColor = color ?? "#3b82f6";

      const result = await page.evaluate(
        ({ cacheKey, price, label, color }) => {
          const widget = (window as any).__kwidget;
          if (!widget) return { ok: false as const, error: "No __kwidget on window" };

          const cache = (window as any).__ohlcvCache;
          if (!cache || !cache[cacheKey]) {
            return { ok: false as const, error: `No OHLCV cache for key "${cacheKey}". Call open_chart first.` };
          }

          const bars   = cache[cacheKey] as Array<{ timestamp: number }>;
          const lastTs = bars[bars.length - 1].timestamp;

          try {
            const id = widget.createOverlay({
              name: "simpleAnnotation",
              points: [{ timestamp: lastTs, value: price }],
              extendData: label,
              styles: {
                line: { color },
                text: { color },
              },
            });
            return { ok: true as const, id };
          } catch (e: any) {
            return { ok: false as const, error: String(e) };
          }
        },
        { cacheKey, price, label, color: resolvedColor }
      );

      if (!result.ok) {
        throw new Error(`draw_annotation failed: ${result.error}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ id: result.id }),
          },
        ],
      };
    }
  );
}
