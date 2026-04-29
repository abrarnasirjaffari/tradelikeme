import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { navigate, getCurrentTf } from "../browser.js";

export function registerSetSymbol(server: McpServer): void {
  server.tool(
    "set_symbol",
    "Change the chart symbol while keeping the current timeframe. Waits for data-ready before returning.",
    {
      symbol: z.string().describe("Trading pair symbol e.g. BTCUSDT"),
    },
    async ({ symbol }) => {
      await navigate(symbol, getCurrentTf());
      return {
        content: [{ type: "text", text: "ok" }],
      };
    }
  );
}
