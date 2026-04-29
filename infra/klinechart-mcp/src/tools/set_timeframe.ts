import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { navigate, getCurrentSymbol } from "../browser.js";

export function registerSetTimeframe(server: McpServer): void {
  server.tool(
    "set_timeframe",
    "Change the chart timeframe while keeping the current symbol. Waits for data-ready before returning.",
    {
      tf: z.string().describe("Timeframe e.g. 1M 1W 1D 4H 1H 30M 15M 5M"),
    },
    async ({ tf }) => {
      await navigate(getCurrentSymbol(), tf);
      return {
        content: [{ type: "text", text: "ok" }],
      };
    }
  );
}
