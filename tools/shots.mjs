#!/usr/bin/env node
// Renders the landing prototypes with headless Chrome over the DevTools protocol.
// Usage: node tools/shots.mjs <outDir> <variant...>   (variants: A B C; serves the repo root on :8765)
// Per variant: <v>-phone.png (402×874 @2x, first screen), <v>-desktop.png (1440×900, first screen),
// <v>-phone-full.png and <v>-desktop-full.png (whole page, 1x), <v>-phone-mid / -desktop-mid (scrolled to 32 %). Full pages are captured beyond the viewport,
// so 100svh sections keep their real height. The page is scrolled through first so scroll-triggered states settle.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const [outDir, ...variants] = process.argv.slice(2);
if (!outDir || !variants.length) { console.error("usage: shots.mjs <outDir> A [B C]"); process.exit(2); }
await mkdir(outDir, { recursive: true });

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml" };
const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const body = await readFile(join(root, p));
    res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" }).end(body);
  } catch { res.writeHead(404).end("not found"); }
}).listen(8765);

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--remote-debugging-port=9333", "--hide-scrollbars", "--disable-gpu", "--no-first-run",
  `--user-data-dir=${process.env.TMPDIR || "/tmp"}/goodrep-shots-profile`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch("http://127.0.0.1:9333/json")).json()).find((t) => t.type === "page"); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0; const pending = new Map();
ws.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

async function shoot(url, name, width, height, scale, full, frac = 0) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: width < 600 });
  await send("Page.navigate", { url });
  await sleep(1500);
  await evaluate("document.fonts.ready.then(() => true)");
  // Walk the page so IntersectionObserver states fire, then return to the top.
  await evaluate(`(async () => { document.documentElement.style.scrollBehavior = 'auto'; const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += innerHeight / 2) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * ${frac}); await new Promise(r => setTimeout(r, 1600)); return true; })()`);
  let clip;
  if (full) {
    const h = await evaluate("document.documentElement.scrollHeight");
    clip = { x: 0, y: 0, width, height: h, scale: 1 };
  }
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: !!full, ...(clip ? { clip } : {}) });
  await writeFile(join(outDir, name), Buffer.from(shot.result.data, "base64"));
  console.log("wrote", name);
}

await send("Page.enable");
for (const v of variants) {
  const url = `http://127.0.0.1:8765/prototypes/${v}/`;
  await shoot(url, `${v}-phone.png`, 402, 874, 2, false);
  await shoot(url, `${v}-desktop.png`, 1440, 900, 1, false);
  await shoot(url, `${v}-phone-full.png`, 402, 874, 1, true);
  await shoot(url, `${v}-desktop-full.png`, 1440, 900, 1, true);
  await shoot(url, `${v}-phone-mid.png`, 402, 874, 2, false, 0.32);
  await shoot(url, `${v}-desktop-mid.png`, 1440, 900, 1, false, 0.32);
}
ws.close(); chrome.kill(); server.close();
