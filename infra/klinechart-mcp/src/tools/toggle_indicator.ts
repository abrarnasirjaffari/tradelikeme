import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPage } from "../browser.js";

export function registerToggleIndicator(server: McpServer): void {
  server.tool(
    "toggle_indicator",
    "Show or hide an indicator on the chart by name. Indicator names: MA, EMA, BOLL, SAR, BBI (main pane) or VOL, MACD, RSI, KDJ, KD, DMI, BIAS, CCI, MTM, EMV, CR, PSY, DMA, TRIX, OBV, VR, WR, ROC, PVT, BRAR (sub pane). Call open_chart first.",
    {
      name: z.string().describe("Indicator name e.g. RSI, MACD, VOL, MA, EMA, BOLL"),
      visible: z.boolean().describe("true to show, false to hide"),
    },
    async ({ name, visible }) => {
      const page = getPage();
      const result = await page.evaluate(
        ({ name, visible }) => {
          // klinecharts exposes a Chart instance via window.__kwidget (set in index.html)
          const widget = (window as any).__kwidget;
          if (!widget) return { ok: false, error: "No __kwidget on window — ensure index.html sets it" };
          try {
            widget.overrideIndicator({ name, visible });
            return { ok: true };
          } catch (e: any) {
            return { ok: false, error: String(e) };
          }
        },
        { name, visible }
      );
      if (!result.ok) {
        throw new Error(`toggle_indicator failed: ${result.error}`);
      }
      return {
        content: [{ type: "text", text: `${name} visibility set to ${visible}` }],
      };
    }
  );
}
