#!/usr/bin/env node
// Renders pages with headless Google Chrome over the DevTools protocol (/opt/homebrew/bin/chromium is broken here).
//
//   node tools/shots.mjs <outDir> <target...>
//
// A target is a prototype letter (A B C) or a site path such as / /privacy/ /support/.
// Prototypes: <v>-phone.png (402×874 @2x, first screen), <v>-desktop.png (1440×900, first screen),
// <v>-phone-full.png and <v>-desktop-full.png (whole page, 1x), <v>-phone-mid / -desktop-mid (scrolled to 32 %).
// Site paths: <slug>-<390|1440>-<light|dark>.png (first screen) and …-full.png (whole page), and report.json with,
// per page and colour scheme, every request that failed or returned 400+, console errors and the bytes transferred.
// Full pages are captured beyond the viewport, so 100svh sections keep their real height. The page is scrolled
// through first so scroll-triggered states settle and lazy images load.
//
// The repo root is served on :8765 unless SHOTS_BASE points at another server, e.g.
//   python3 -m http.server 8000 & SHOTS_BASE=http://127.0.0.1:8000 node tools/shots.mjs out / /privacy/ /support/
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const [outDir, ...targets] = process.argv.slice(2);
if (!outDir || !targets.length) { console.error("usage: shots.mjs <outDir> (A|B|C|/path/)..."); process.exit(2); }
await mkdir(outDir, { recursive: true });

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png",
  ".svg": "image/svg+xml", ".woff2": "font/woff2" };
let server;
const base = process.env.SHOTS_BASE || "http://127.0.0.1:8765";
if (!process.env.SHOTS_BASE) {
  server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (p.endsWith("/")) p += "index.html";
      const body = await readFile(join(root, p));
      res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" }).end(body);
    } catch { res.writeHead(404).end("not found"); }
  }).listen(8765);
}

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
let id = 0; const pending = new Map(); const listeners = new Set();
ws.addEventListener("message", (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  else if (d.method) listeners.forEach((f) => f(d));
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

// Network and console bookkeeping for one page load.
function watch() {
  const log = { failed: [], console: [], bytes: 0, requests: 0 };
  const urls = new Map();
  const f = ({ method, params: p }) => {
    if (method === "Network.requestWillBeSent") { urls.set(p.requestId, p.request.url); log.requests++; }
    if (method === "Network.responseReceived" && p.response.status >= 400) log.failed.push(`${p.response.status} ${p.response.url}`);
    if (method === "Network.loadingFinished") log.bytes += p.encodedDataLength;
    if (method === "Network.loadingFailed" && !p.canceled) log.failed.push(`${p.errorText} ${urls.get(p.requestId)}`);
    if (method === "Runtime.exceptionThrown") log.console.push(p.exceptionDetails.exception?.description || p.exceptionDetails.text);
    if (method === "Runtime.consoleAPICalled" && ["error", "warning", "assert"].includes(p.type))
      log.console.push(`${p.type}: ${p.args.map((a) => a.value ?? a.description).join(" ")}`);
    if (method === "Log.entryAdded" && ["error", "warning"].includes(p.entry.level)) log.console.push(`${p.entry.level}: ${p.entry.text} ${p.entry.url || ""}`);
  };
  listeners.add(f);
  return { log, stop: () => listeners.delete(f) };
}

async function shoot(url, name, width, height, scale, full, frac = 0, scheme) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: width < 600 });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: scheme || "dark" }] });
  const w = watch();
  await send("Page.navigate", { url });
  await sleep(1500);
  await evaluate("document.fonts.ready.then(() => true)");
  // Walk the page so IntersectionObserver states fire and lazy images load, then return to the top.
  await evaluate(`(async () => { document.documentElement.style.scrollBehavior = 'auto'; const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += innerHeight / 2) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * ${frac}); await new Promise(r => setTimeout(r, 1600)); return true; })()`);
  let clip;
  if (full) {
    const h = await evaluate("document.documentElement.scrollHeight");
    clip = { x: 0, y: 0, width, height: h, scale: 1 };
  }
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: !!full, ...(clip ? { clip } : {}) });
  w.stop();
  await writeFile(join(outDir, name), Buffer.from(shot.result.data, "base64"));
  console.log("wrote", name);
  return w.log;
}

await send("Page.enable");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Runtime.enable");
await send("Log.enable");
const report = {};
for (const t of targets) {
  if (!t.startsWith("/")) {
    const url = `${base}/prototypes/${t}/`;
    await shoot(url, `${t}-phone.png`, 402, 874, 2, false);
    await shoot(url, `${t}-desktop.png`, 1440, 900, 1, false);
    await shoot(url, `${t}-phone-full.png`, 402, 874, 1, true);
    await shoot(url, `${t}-desktop-full.png`, 1440, 900, 1, true);
    await shoot(url, `${t}-phone-mid.png`, 402, 874, 2, false, 0.32);
    await shoot(url, `${t}-desktop-mid.png`, 1440, 900, 1, false, 0.32);
    continue;
  }
  const slug = t.replace(/^\/|\/$/g, "") || "home";
  for (const scheme of ["light", "dark"]) {
    for (const [width, height, scale] of [[390, 844, 2], [1440, 900, 1]]) {
      // The full-page capture walks the whole page, so its log covers every request the page makes.
      report[`${t} ${scheme} ${width}`] = await shoot(base + t, `${slug}-${width}-${scheme}-full.png`, width, height, 1, true, 0, scheme);
      await shoot(base + t, `${slug}-${width}-${scheme}.png`, width, height, scale, false, 0, scheme);
    }
  }
}
if (Object.keys(report).length) {
  await writeFile(join(outDir, "report.json"), JSON.stringify(report, null, 2));
  for (const [k, v] of Object.entries(report))
    console.log(`${k}: ${v.requests} requests, ${(v.bytes / 1024).toFixed(0)} KB, failed ${v.failed.length}, console ${v.console.length}`);
}
ws.close(); chrome.kill(); server?.close();
