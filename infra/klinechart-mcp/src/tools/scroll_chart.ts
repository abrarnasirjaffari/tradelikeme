import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPage } from "../browser.js";

export function registerScrollChart(server: McpServer): void {
  server.tool(
    "scroll_chart",
    "Scroll the chart left (back in time) or right (forward) by N bars. Positive bars = scroll left/back, negative = scroll right/forward. Use scrollToLatest=true to jump back to the most recent candle.",
    {
      bars: z.number().int().optional().describe("Number of bars to scroll. Positive = back in time, negative = forward. Defaults to 100."),
      scrollToLatest: z.boolean().optional().describe("If true, scroll back to the latest (real-time) candle, ignoring bars param."),
    },
    async ({ bars = 100, scrollToLatest = false }) => {
      const page = getPage();

      const result = await page.evaluate(
        ({ bars, scrollToLatest }) => {
          const widget = (window as any).__kwidget;
          if (!widget) return { ok: false, error: "No __kwidget on window — ensure index.html sets it" };
          try {
            if (scrollToLatest) {
              widget.scrollToRealTime();
              return { ok: true, action: "scrollToRealTime" };
            }
            // barSpace is pixels per bar; positive distance scrolls left (back in time)
            const { bar: barSpace } = widget.getBarSpace();
            widget.scrollByDistance(bars * barSpace);
            return { ok: true, action: "scrollByDistance", bars, pxPerBar: barSpace };
          } catch (e: any) {
            return { ok: false, error: String(e) };
          }
        },
        { bars, scrollToLatest }
      );

      if (!result.ok) {
        throw new Error(`scroll_chart failed: ${result.error}`);
      }

      const msg = result.action === "scrollToRealTime"
        ? "scrolled to latest candle"
        : `scrolled ${bars > 0 ? "back" : "forward"} ${Math.abs(bars)} bars`;

      return {
        content: [{ type: "text", text: msg }],
      };
    }
  );
}
