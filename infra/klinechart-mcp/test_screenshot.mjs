// KC38 — Test screenshot tool returns valid base64 PNG
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

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
      handleMessage(JSON.parse(line));
    } catch {
      process.stderr.write(`[stdout non-json] ${line}\n`);
    }
  }
});

function send(obj) {
  server.stdin.write(JSON.stringify(obj) + "\n");
}

let step = 0;
function handleMessage(msg) {
  if (step === 0) {
    // initialize response received
    console.log("✅ initialize ok");
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    step = 1;
    send({
      jsonrpc: "2.0", id: 2,
      method: "tools/call",
      params: { name: "open_chart", arguments: { symbol: "SOLUSDT", tf: "4H" } },
    });
    console.log("→ sent open_chart SOLUSDT 4H");
  } else if (step === 1 && msg.id === 2) {
    if (msg.error || msg.result?.isError) {
      console.error("❌ open_chart failed:", JSON.stringify(msg));
      server.kill(); process.exit(1);
    }
    console.log("✅ open_chart ok — now calling screenshot");
    step = 2;
    send({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "screenshot", arguments: {} } });
  } else if (step === 2 && msg.id === 3) {
    if (msg.error) {
      console.error("❌ screenshot error:", JSON.stringify(msg.error));
      server.kill(); process.exit(1);
    }
    const content = msg.result?.content?.[0];
    if (!content || content.type !== "image" || content.mimeType !== "image/png") {
      console.error("❌ unexpected content type:", JSON.stringify(content));
      server.kill(); process.exit(1);
    }
    const base64 = content.data;
    if (typeof base64 !== "string" || base64.length < 1000) {
      console.error("❌ base64 too short or missing:", base64?.length);
      server.kill(); process.exit(1);
    }
    // Verify it decodes to a valid PNG (magic bytes: 89 50 4E 47)
    const buf = Buffer.from(base64, "base64");
    const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    if (!isPng) {
      console.error("❌ decoded bytes are not a PNG — first 4 bytes:", buf.slice(0, 4));
      server.kill(); process.exit(1);
    }
    // Save to disk so we can visually inspect
    const outPath = path.join("test_screenshot_output.png");
    fs.writeFileSync(outPath, buf);
    console.log(`✅ screenshot returned valid PNG — ${buf.length} bytes, saved to ${outPath}`);
    server.kill(); process.exit(0);
  }
}

send({
  jsonrpc: "2.0", id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" },
  },
});

setTimeout(() => {
  console.error("❌ Timeout — no response in 40s");
  server.kill(); process.exit(1);
}, 40_000);
