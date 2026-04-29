// KC40 — Test toggle_indicator: RSI appears/disappears on chart
import { spawn } from "child_process";
import fs from "fs";

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

function fail(label, msg) {
  console.error(`❌ ${label}:`, JSON.stringify(msg.error ?? msg.result));
  server.kill(); process.exit(1);
}

function extractPng(msg, label) {
  const content = msg.result?.content?.[0];
  if (!content || content.type !== "image" || content.mimeType !== "image/png") {
    console.error(`❌ ${label}: unexpected content:`, JSON.stringify(content));
    return null;
  }
  const buf = Buffer.from(content.data, "base64");
  if (buf[0] !== 0x89 || buf[1] !== 0x50) { console.error(`❌ ${label}: not PNG`); return null; }
  return buf;
}

const shots = {};
let step = 0;

function handleMessage(msg) {
  if (step === 0) {
    // initialize response
    console.log("✅ initialize ok");
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    step = 1;
    send({ jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: "open_chart", arguments: { symbol: "SOLUSDT", tf: "4H" } } });
    console.log("→ open_chart SOLUSDT 4H");

  } else if (step === 1 && msg.id === 2) {
    if (msg.result?.isError) { fail("open_chart", msg); return; }
    console.log("✅ open_chart ok");
    step = 2;
    send({ jsonrpc: "2.0", id: 3, method: "tools/call",
      params: { name: "screenshot", arguments: {} } });
    console.log("→ screenshot (RSI visible)");

  } else if (step === 2 && msg.id === 3) {
    shots.rsiOn = extractPng(msg, "RSI-on");
    if (!shots.rsiOn) { server.kill(); process.exit(1); }
    fs.writeFileSync("test_toggle_rsi_on.png", shots.rsiOn);
    console.log(`✅ RSI-on screenshot: ${shots.rsiOn.length} bytes`);
    step = 3;
    // Hide RSI
    send({ jsonrpc: "2.0", id: 4, method: "tools/call",
      params: { name: "toggle_indicator", arguments: { name: "RSI", visible: false } } });
    console.log("→ toggle_indicator RSI visible=false");

  } else if (step === 3 && msg.id === 4) {
    if (msg.result?.isError) { fail("toggle_indicator hide", msg); return; }
    console.log("✅ toggle_indicator RSI hidden:", msg.result?.content?.[0]?.text);
    step = 4;
    send({ jsonrpc: "2.0", id: 5, method: "tools/call",
      params: { name: "screenshot", arguments: {} } });
    console.log("→ screenshot (RSI hidden)");

  } else if (step === 4 && msg.id === 5) {
    shots.rsiOff = extractPng(msg, "RSI-off");
    if (!shots.rsiOff) { server.kill(); process.exit(1); }
    fs.writeFileSync("test_toggle_rsi_off.png", shots.rsiOff);
    console.log(`✅ RSI-off screenshot: ${shots.rsiOff.length} bytes`);
    step = 5;
    // Restore RSI
    send({ jsonrpc: "2.0", id: 6, method: "tools/call",
      params: { name: "toggle_indicator", arguments: { name: "RSI", visible: true } } });
    console.log("→ toggle_indicator RSI visible=true (restore)");

  } else if (step === 5 && msg.id === 6) {
    if (msg.result?.isError) { fail("toggle_indicator restore", msg); return; }
    console.log("✅ toggle_indicator RSI restored:", msg.result?.content?.[0]?.text);

    // The two screenshots must differ — RSI pane visible vs hidden changes the image
    if (shots.rsiOn.equals(shots.rsiOff)) {
      console.error("❌ RSI-on and RSI-off screenshots are identical — toggle had no effect");
      server.kill(); process.exit(1);
    }
    console.log("✅ RSI-on and RSI-off screenshots differ — toggle_indicator confirmed working");
    server.kill(); process.exit(0);
  }
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
