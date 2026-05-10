import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPage } from "../browser.js";

export function registerClearOverlays(server: McpServer): void {
  server.tool(
    "clear_overlays",
    "Remove all drawn overlays (zones, price lines, annotations) from the chart.",
    {},
    async () => {
      const page = getPage();

      const result = await page.evaluate(() => {
        const widget = (window as any).__kwidget;
        if (!widget) return { ok: false as const, error: "No __kwidget on window" };

        try {
          widget.removeOverlay();
          return { ok: true as const };
        } catch (e: any) {
          return { ok: false as const, error: String(e) };
        }
      });

      if (!result.ok) {
        throw new Error(`clear_overlays failed: ${result.error}`);
      }

      return {
        content: [{ type: "text", text: JSON.stringify({ removed: true }) }],
      };
    }
  );
}
