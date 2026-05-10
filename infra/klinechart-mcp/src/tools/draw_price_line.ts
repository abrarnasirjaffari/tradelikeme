import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPage } from "../browser.js";

export function registerDrawPriceLine(server: McpServer): void {
  server.tool(
    "draw_price_line",
    "Draw a labeled horizontal price line on the chart (use for TP1, TP2, SL, Entry lines). Returns the overlay id.",
    {
      price:  z.number().describe("Price level for the horizontal line"),
      label:  z.string().describe('Label text e.g. "TP1", "TP2", "SL", "Entry"'),
      style:  z.enum(["solid", "dashed"]).default("dashed").describe("Line style (default: dashed)"),
      color:  z.string().optional().describe("Hex color. Defaults: TP lines=#22c55e, SL=#ef4444, Entry=#3b82f6, other=#94a3b8"),
    },
    async ({ price, label, style, color }) => {
      const page = getPage();

      // Derive a sensible default color from the label if none supplied
      const resolvedColor = color ?? (() => {
        const upper = label.toUpperCase();
        if (upper.startsWith("TP"))    return "#22c55e";
        if (upper.startsWith("SL"))    return "#ef4444";
        if (upper.startsWith("ENTRY")) return "#3b82f6";
        return "#94a3b8";
      })();

      const result = await page.evaluate(
        ({ price, label, style, color }) => {
          const widget = (window as any).__kwidget;
          if (!widget) return { ok: false as const, error: "No __kwidget on window" };

          try {
            const id = widget.createOverlay({
              name: "priceLine",
              points: [{ value: price }],
              extendData: label,
              styles: {
                line: {
                  color,
                  size: 1.5,
                  style: style === "dashed" ? "dashed" : "solid",
                  dashedValue: [6, 4],
                },
                text: { color },
              },
            });
            return { ok: true as const, id };
          } catch (e: any) {
            return { ok: false as const, error: String(e) };
          }
        },
        { price, label, style, color: resolvedColor }
      );

      if (!result.ok) {
        throw new Error(`draw_price_line failed: ${result.error}`);
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
