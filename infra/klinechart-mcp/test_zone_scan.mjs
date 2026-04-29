// KC42 — Full zone scan: open_chart + screenshot for 7 TFs (SOLUSDT), then Claude Opus 4.6
// identifies S/D zones from each screenshot via AWS Bedrock.
import { spawn } from "child_process";
import fs from "fs";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// ── Config ────────────────────────────────────────────────────────────────────
const SYMBOL = "SOLUSDT";
const TF_STACK = ["1M", "1W", "1D", "4H", "1H", "30M", "15M"];
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const MODEL_ID = "us.anthropic.claude-opus-4-7"; // Claude Opus 4.7 on Bedrock

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.error("❌ AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY not set in env");
  process.exit(1);
}

// ── MCP Client ────────────────────────────────────────────────────────────────
const server = spawn("node", ["dist/index.js"], {
  cwd: new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"),
  stdio: ["pipe", "pipe", "pipe"],
  env: { ...process.env },
});

server.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));

let buf = "";
const pendingCallbacks = new Map(); // id -> resolve
let nextId = 10;

server.stdout.on("data", (d) => {
  buf += d.toString();
  const lines = buf.split("\n");
  buf = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id !== undefined && pendingCallbacks.has(msg.id)) {
        const resolve = pendingCallbacks.get(msg.id);
        pendingCallbacks.delete(msg.id);
        resolve(msg);
      }
    } catch {
      process.stderr.write(`[non-json] ${line}\n`);
    }
  }
});

function send(obj) {
  server.stdin.write(JSON.stringify(obj) + "\n");
}

function rpc(method, params) {
  return new Promise((resolve) => {
    const id = nextId++;
    pendingCallbacks.set(id, resolve);
    send({ jsonrpc: "2.0", id, method, params });
  });
}

// ── Bedrock ───────────────────────────────────────────────────────────────────
const bedrock = new BedrockRuntimeClient({
  region: AWS_REGION,
  credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
});

async function analyzeZones(base64Png, symbol, tf) {
  const prompt = `You are an expert Supply & Demand zone trader analyzing a ${tf} candlestick chart for ${symbol}.

Identify all significant Supply and Demand zones visible on this chart. For each zone provide:
- type: "supply" or "demand"
- top: approximate price level (top of zone)
- bottom: approximate price level (bottom of zone)
- strength: "strong" | "moderate" | "weak" (based on origin candle momentum + volume)
- notes: brief reason (e.g. "3 candle base, high volume at origin")

Also note:
- Overall trend direction on this TF: "uptrend" | "downtrend" | "sideways"
- Any Fair Value Gaps (FVG) visible
- Key equal highs or equal lows (liquidity levels)

Respond in JSON only, no prose:
{
  "tf": "${tf}",
  "symbol": "${symbol}",
  "trend": "...",
  "zones": [{ "type": "...", "top": 0, "bottom": 0, "strength": "...", "notes": "..." }],
  "fvg": [{ "top": 0, "bottom": 0, "direction": "bullish|bearish" }],
  "liquidity_levels": [{ "price": 0, "type": "equal_highs|equal_lows" }]
}`;

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: base64Png },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const cmd = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const resp = await bedrock.send(cmd);
  const result = JSON.parse(new TextDecoder().decode(resp.body));
  const text = result.content?.[0]?.text ?? "";
  // Strip markdown fences if present
  const jsonStr = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    return { tf, symbol, raw: text, parse_error: true };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Initialize
  const initResp = await rpc("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "zone-scan-test", version: "1.0.0" },
  });
  if (!initResp.result) { console.error("❌ initialize failed:", JSON.stringify(initResp)); server.kill(); process.exit(1); }
  send({ jsonrpc: "2.0", method: "notifications/initialized" });
  console.log("✅ MCP initialized\n");

  const allZones = {};

  for (const tf of TF_STACK) {
    console.log(`─── TF: ${tf} ─────────────────────────────────`);

    // Open / navigate chart
    const chartResp = await rpc("tools/call", {
      name: "open_chart",
      arguments: { symbol: SYMBOL, tf },
    });
    if (chartResp.result?.isError) {
      console.error(`❌ open_chart ${tf} failed:`, JSON.stringify(chartResp.result));
      server.kill(); process.exit(1);
    }
    console.log(`  ✅ chart loaded`);

    // Screenshot
    const ssResp = await rpc("tools/call", { name: "screenshot", arguments: {} });
    const content = ssResp.result?.content?.[0];
    if (!content || content.type !== "image" || content.mimeType !== "image/png") {
      console.error(`❌ screenshot ${tf} bad response:`, JSON.stringify(content));
      server.kill(); process.exit(1);
    }
    const base64 = content.data;
    const pngBuf = Buffer.from(base64, "base64");
    const isPng = pngBuf[0] === 0x89 && pngBuf[1] === 0x50 && pngBuf[2] === 0x4e && pngBuf[3] === 0x47;
    if (!isPng) { console.error(`❌ ${tf}: not a valid PNG`); server.kill(); process.exit(1); }
    const outFile = `test_zone_scan_${tf.replace("/", "")}.png`;
    fs.writeFileSync(outFile, pngBuf);
    console.log(`  ✅ screenshot: ${pngBuf.length} bytes → ${outFile}`);

    // Analyze with Claude Opus 4.6
    console.log(`  → sending to Claude Opus for zone analysis...`);
    try {
      const zones = await analyzeZones(base64, SYMBOL, tf);
      allZones[tf] = zones;
      if (zones.parse_error) {
        console.log(`  ⚠️  Claude responded but JSON parse failed. Raw:\n${zones.raw}`);
      } else {
        console.log(`  ✅ trend: ${zones.trend}`);
        console.log(`  ✅ zones: ${zones.zones?.length ?? 0} found`);
        if (zones.zones?.length) {
          for (const z of zones.zones) {
            console.log(`     [${z.type.toUpperCase()}] ${z.bottom}–${z.top}  strength=${z.strength}  (${z.notes})`);
          }
        }
        if (zones.fvg?.length) console.log(`  ✅ FVGs: ${zones.fvg.length}`);
        if (zones.liquidity_levels?.length) console.log(`  ✅ liquidity levels: ${zones.liquidity_levels.length}`);
      }
    } catch (err) {
      console.error(`  ❌ Bedrock error on ${tf}:`, err.message);
      allZones[tf] = { error: err.message };
    }
    console.log();
  }

  // Save full zone report
  const reportPath = "test_zone_scan_report.json";
  fs.writeFileSync(reportPath, JSON.stringify(allZones, null, 2));
  console.log(`\n✅ Zone scan complete — full report saved to ${reportPath}`);
  console.log(`\n═══ SUMMARY ════════════════════════════════════`);
  for (const tf of TF_STACK) {
    const z = allZones[tf];
    if (z?.error) {
      console.log(`  ${tf}: ERROR — ${z.error}`);
    } else if (z?.parse_error) {
      console.log(`  ${tf}: parse error`);
    } else {
      console.log(`  ${tf}: trend=${z?.trend ?? "?"}, zones=${z?.zones?.length ?? 0}, fvgs=${z?.fvg?.length ?? 0}`);
    }
  }

  server.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  server.kill();
  process.exit(1);
});

setTimeout(() => {
  console.error("❌ Timeout after 5 minutes");
  server.kill();
  process.exit(1);
}, 300_000);
