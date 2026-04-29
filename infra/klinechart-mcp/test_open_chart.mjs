// KC37 — Test open_chart tool via JSON-RPC over stdio
import { spawn } from "child_process";

const server = spawn("node", ["dist/index.js"], {
  cwd: new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"),
  stdio: ["pipe", "pipe", "pipe"],
});

server.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));

let buf = "";
server.stdout.on("data", (d) => {
  buf += d.toString();
  const lines = buf.split("\n");
  buf = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      handleMessage(msg);
    } catch {
      process.stderr.write(`[stdout non-json] ${line}\n`);
    }
  }
});

function send(obj) {
  const text = JSON.stringify(obj) + "\n";
  server.stdin.write(text);
}

let step = 0;
function handleMessage(msg) {
  if (step === 0) {
    // Got initialize response — send initialized notification then tools/call
    console.log("✅ initialize response received, id:", msg.id);
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    step = 1;
    // Now call open_chart
    send({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "open_chart",
        arguments: { symbol: "SOLUSDT", tf: "4H" },
      },
    });
    console.log("→ sent tools/call open_chart SOLUSDT 4H");
  } else if (step === 1 && msg.id === 2) {
    if (msg.error) {
      console.error("❌ open_chart error:", JSON.stringify(msg.error));
      server.kill();
      process.exit(1);
    }
    const text = msg.result?.content?.[0]?.text;
    if (text === "ok") {
      console.log("✅ open_chart returned: ok — chart loaded!");
    } else {
      console.error("❌ unexpected response:", JSON.stringify(msg.result));
      server.kill();
      process.exit(1);
    }
    server.kill();
    process.exit(0);
  }
}

// Send initialize
send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" },
  },
});

setTimeout(() => {
  console.error("❌ Timeout — no response in 30s");
  server.kill();
  process.exit(1);
}, 40_000);
