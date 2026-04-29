// KC39 — Test set_timeframe + screenshot: confirm different TF candles render
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
    try { handleMessage(JSON.parse(line)); }
    catch { process.stderr.write(`[non-json] ${line}\n`); }
  }
});

function send(obj) { server.stdin.write(JSON.stringify(obj) + "\n"); }

// Sequence: initialize → open_chart 4H → screenshot → set_timeframe 1D → screenshot
// Verify both PNGs are valid and different (different candle counts = different pixel data)
const screenshots = {};
let step = 0;

function handleMessage(msg) {
  if (step === 0) {
    console.log("✅ initialize ok");
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    step = 1;
    send({ jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: "open_chart", arguments: { symbol: "SOLUSDT", tf: "4H" } } });
    console.log("→ open_chart SOLUSDT 4H");

  } else if (step === 1 && msg.id === 2) {
    if (msg.result?.isError) { fail("open_chart", msg); return; }
    console.log("✅ open_chart 4H ok");
    step = 2;
    send({ jsonrpc: "2.0", id: 3, method: "tools/call",
      params: { name: "screenshot", arguments: {} } });
    console.log("→ screenshot (4H)");

  } else if (step === 2 && msg.id === 3) {
    if (msg.error) { fail("screenshot 4H", msg); return; }
    screenshots["4H"] = validatePng(msg, "4H");
    if (!screenshots["4H"]) { server.kill(); process.exit(1); }
    fs.writeFileSync("test_tf_4H.png", screenshots["4H"]);
    console.log(`✅ 4H screenshot: valid PNG, ${screenshots["4H"].length} bytes → test_tf_4H.png`);
    step = 3;
    send({ jsonrpc: "2.0", id: 4, method: "tools/call",
      params: { name: "set_timeframe", arguments: { tf: "1D" } } });
    console.log("→ set_timeframe 1D");

  } else if (step === 3 && msg.id === 4) {
    if (msg.result?.isError) { fail("set_timeframe 1D", msg); return; }
    console.log("✅ set_timeframe 1D ok");
    step = 4;
    send({ jsonrpc: "2.0", id: 5, method: "tools/call",
      params: { name: "screenshot", arguments: {} } });
    console.log("→ screenshot (1D)");

  } else if (step === 4 && msg.id === 5) {
    if (msg.error) { fail("screenshot 1D", msg); return; }
    screenshots["1D"] = validatePng(msg, "1D");
    if (!screenshots["1D"]) { server.kill(); process.exit(1); }
    fs.writeFileSync("test_tf_1D.png", screenshots["1D"]);
    console.log(`✅ 1D screenshot: valid PNG, ${screenshots["1D"].length} bytes → test_tf_1D.png`);

    // Verify images are different (different TFs should produce different candle patterns)
    if (screenshots["4H"].equals(screenshots["1D"])) {
      console.error("❌ 4H and 1D screenshots are identical — timeframe change had no effect");
      server.kill(); process.exit(1);
    }
    console.log("✅ 4H and 1D screenshots differ — timeframe change confirmed working");
    server.kill(); process.exit(0);
  }
}

function validatePng(msg, label) {
  const content = msg.result?.content?.[0];
  if (!content || content.type !== "image" || content.mimeType !== "image/png") {
    console.error(`❌ ${label}: unexpected content:`, JSON.stringify(content));
    return null;
  }
  const buf = Buffer.from(content.data, "base64");
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
    console.error(`❌ ${label}: not a PNG`);
    return null;
  }
  return buf;
}

function fail(label, msg) {
  console.error(`❌ ${label} failed:`, JSON.stringify(msg.error ?? msg.result));
  server.kill(); process.exit(1);
}

send({
  jsonrpc: "2.0", id: 1,
  method: "initialize",
  params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1.0" } },
});

setTimeout(() => {
  console.error("❌ Timeout after 60s");
  server.kill(); process.exit(1);
}, 60_000);
