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

const ZONE_STYLES: Record<string, { fill: string; border: string }> = {
  demand:  { fill: "rgba(34,197,94,0.18)",   border: "#22c55e" },
  supply:  { fill: "rgba(239,68,68,0.18)",   border: "#ef4444" },
  neutral: { fill: "rgba(59,130,246,0.18)",  border: "#3b82f6" },
};

export function registerDrawZone(server: McpServer): void {
  server.tool(
    "draw_zone",
    "Draw a Supply or Demand zone rectangle on the chart. Returns the overlay id.",
    {
      price_top:    z.number().describe("Top of zone (higher price)"),
      price_bottom: z.number().describe("Bottom of zone (lower price)"),
      zone_type:    z.enum(["demand", "supply", "neutral"]).describe("demand=green, supply=red, neutral=blue"),
      label:        z.string().optional().describe("Optional text label drawn at price_top"),
      symbol:       z.string().optional().describe("Defaults to current chart symbol"),
      tf:           z.string().optional().describe("Defaults to current chart timeframe"),
    },
    async ({ price_top, price_bottom, zone_type, label, symbol, tf }) => {
      const page = getPage();
      const sym       = symbol ?? getCurrentSymbol();
      const timeframe = tf ?? getCurrentTf();
      const interval  = TF_TO_INTERVAL[timeframe] ?? timeframe.toLowerCase();
      const cacheKey  = `${sym}_${interval}`;

      const result = await page.evaluate(
        ({ cacheKey, price_top, price_bottom, zone_type, label, ZONE_STYLES }) => {
          const widget = (window as any).__kwidget;
          if (!widget) return { ok: false as const, error: "No __kwidget on window" };

          const cache = (window as any).__ohlcvCache;
          if (!cache || !cache[cacheKey]) {
            return { ok: false as const, error: `No OHLCV cache for key "${cacheKey}". Call open_chart first.` };
          }

          const bars    = cache[cacheKey] as Array<{ timestamp: number }>;
          const firstTs = bars[0].timestamp;
          const lastTs  = bars[bars.length - 1].timestamp;

          const { fill, border } = ZONE_STYLES[zone_type];

          try {
            const rectId = widget.createOverlay({
              name: "rect",
              points: [
                { timestamp: firstTs, value: price_top    },
                { timestamp: lastTs,  value: price_bottom },
              ],
              styles: {
                polygon: { color: fill, borderColor: border, borderSize: 1 },
              },
            });

            let lineId: string | null = null;
            if (label) {
              lineId = widget.createOverlay({
                name: "priceLine",
                points: [{ value: price_top }],
                extendData: label,
                styles: {
                  line: { color: border, size: 1, style: "dashed", dashedValue: [4, 4] },
                  text: { color: border },
                },
              });
            }

            return { ok: true as const, rectId, lineId };
          } catch (e: any) {
            return { ok: false as const, error: String(e) };
          }
        },
        { cacheKey, price_top, price_bottom, zone_type, label, ZONE_STYLES }
      );

      if (!result.ok) {
        throw new Error(`draw_zone failed: ${result.error}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ rectId: result.rectId, lineId: result.lineId ?? null }),
          },
        ],
      };
    }
  );
}
