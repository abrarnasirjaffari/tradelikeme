import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerOpenChart } from "./tools/open_chart.js";
import { registerSetSymbol } from "./tools/set_symbol.js";
import { registerSetTimeframe } from "./tools/set_timeframe.js";
import { registerScreenshot } from "./tools/screenshot.js";

const server = new McpServer({
  name: "klinechart-mcp",
  version: "1.0.0",
});

registerOpenChart(server);
registerSetSymbol(server);
registerSetTimeframe(server);
registerScreenshot(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("KLineChart MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
