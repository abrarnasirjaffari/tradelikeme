import { chromium, Browser, Page } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHART_HTML = path.resolve(__dirname, "../../chart/index.html");
const CHART_URL = `http://localhost:8765/klinechart-mcp/chart/index.html`;
const DATA_READY_TIMEOUT = 20_000;

let browser: Browser | null = null;
let page: Page | null = null;
let currentSymbol: string = "SOLUSDT";
let currentTf: string = "4H";

export function getCurrentSymbol(): string { return currentSymbol; }
export function getCurrentTf(): string { return currentTf; }

export async function launch(): Promise<void> {
  if (browser) return;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 700 },
  });
  page = await context.newPage();
}

export async function navigate(symbol: string, tf: string): Promise<void> {
  if (!browser || !page) await launch();
  currentSymbol = symbol;
  currentTf = tf;
  const url = `${CHART_URL}?symbol=${encodeURIComponent(symbol)}&tf=${encodeURIComponent(tf)}`;
  await page!.goto(url, { waitUntil: "domcontentloaded" });
  await page!.waitForSelector("#chart[data-ready='true']", {
    state: "attached",
    timeout: DATA_READY_TIMEOUT,
  });
}

export async function screenshot(): Promise<string> {
  if (!page) throw new Error("Browser not launched — call navigate() first");
  const buffer = await page.screenshot({ type: "png" });
  return buffer.toString("base64");
}

export async function close(): Promise<void> {
  await browser?.close();
  browser = null;
  page = null;
}

export function getPage(): Page {
  if (!page) throw new Error("Browser not launched — call navigate() first");
  return page;
}
