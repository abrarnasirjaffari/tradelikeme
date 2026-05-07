import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerOpenChart } from "./tools/open_chart.js";
import { registerSetSymbol } from "./tools/set_symbol.js";
import { registerSetTimeframe } from "./tools/set_timeframe.js";
import { registerScreenshot } from "./tools/screenshot.js";
import { registerToggleIndicator } from "./tools/toggle_indicator.js";
import { registerGetOhlcv } from "./tools/get_ohlcv.js";
import { registerScrollChart } from "./tools/scroll_chart.js";
import { registerGetPrice } from "./tools/get_price.js";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Serve the entire infra/ folder so chart/index.html can reach klinechart-pro/dist/ etc.
// __dirname = infra/klinechart-mcp/dist/ → ../../ = infra/
const INFRA_ROOT = path.resolve(__dirname, "../../");
const STATIC_PORT = 8765;

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".png":  "image/png",
  ".json": "application/json",
  ".map":  "application/json",
};

function startStaticServer(): Promise<void> {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const urlPath = req.url?.split("?")[0] ?? "/";
      const filePath = path.join(INFRA_ROOT, urlPath);
      const resolvedPath = path.resolve(filePath);
      // Prevent path traversal — resolved path must stay within INFRA_ROOT
      if (!resolvedPath.startsWith(INFRA_ROOT)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      const ext = path.extname(filePath);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream", "Access-Control-Allow-Origin": "*" });
        res.end(data);
      });
    });
    srv.listen(STATIC_PORT, "127.0.0.1", () => {
      console.error(`Static file server running on http://localhost:${STATIC_PORT}`);
      resolve();
    });
  });
}

const server = new McpServer({
  name: "klinechart-mcp",
  version: "1.0.0",
});

registerOpenChart(server);
registerSetSymbol(server);
registerSetTimeframe(server);
registerScreenshot(server);
registerToggleIndicator(server);
registerGetOhlcv(server);
registerScrollChart(server);
registerGetPrice(server);

async function main() {
  await startStaticServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("KLineChart MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
