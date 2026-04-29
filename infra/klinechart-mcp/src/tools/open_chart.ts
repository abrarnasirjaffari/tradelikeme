import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { navigate } from "../browser.js";

export function registerOpenChart(server: McpServer): void {
  server.tool(
    "open_chart",
    "Open the KLineChart for a given symbol and timeframe. Must be called before screenshot or any other chart tool.",
    {
      symbol: z.string().describe("Trading pair symbol e.g. SOLUSDT"),
      tf: z.string().describe("Timeframe e.g. 1M 1W 1D 4H 1H 30M 15M 5M"),
    },
    async ({ symbol, tf }) => {
      await navigate(symbol, tf);
      return {
        content: [{ type: "text", text: "ok" }],
      };
    }
  );
}
