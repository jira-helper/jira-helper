#!/usr/bin/env node
/**
 * Persistent Chrome runner for jira-helper extension testing.
 *
 * Why this exists:
 *   - Chrome >= M142 ignores --load-extension flag.
 *   - chrome-devtools-mcp launches Chrome with --disable-extensions, can't override.
 *   - Loading unpacked extension now requires CDP `Extensions.loadUnpacked`,
 *     which only works over `--remote-debugging-pipe` + `--enable-unsafe-extension-debugging`.
 *
 * What it does:
 *   1. Launches Chrome (channel=chrome) via Playwright with pipe transport.
 *   2. Calls `Extensions.loadUnpacked` over CDP browser session, prints extension id.
 *   3. Polls /tmp/jh-cmd.json for incoming RPC commands and writes results to
 *      /tmp/jh-result.json. This lets the agent drive the browser via
 *      simple file IO from Shell tool calls.
 *
 * Supported commands (see handlers below):
 *   { op: "list_pages" }
 *   { op: "goto", url: "<url>", waitUntil?: "load"|"domcontentloaded"|"networkidle" }
 *   { op: "screenshot", path?: "<file>", fullPage?: bool }
 *   { op: "evaluate", expr: "<js function source>" }
 *   { op: "click", selector: "..." }
 *   { op: "fill", selector: "...", value: "..." }
 *   { op: "wait", ms: 1000 }
 *   { op: "console", clear?: bool }   // returns recent console messages
 *   { op: "shutdown" }
 */

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const EXT_PATH = path.join(ROOT, 'dist');
const USER_DATA_DIR =
  process.env.JH_PROFILE ||
  '/Users/m.sosnov/.cache/jira-helper-chrome-profile';
const CMD_FILE = '/tmp/jh-cmd.json';
const RESULT_FILE = '/tmp/jh-result.json';
const LOG_FILE = '/tmp/jh-runner.log';
const SCREENSHOT_DIR = '/tmp/jh-shots';

await mkdir(SCREENSHOT_DIR, { recursive: true });

const log = async (...args) => {
  const line = `[${new Date().toISOString()}] ${args
    .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
    .join(' ')}\n`;
  await writeFile(LOG_FILE, line, { flag: 'a' });
  process.stdout.write(line);
};

await log('Launching Chrome (channel=chrome) with persistent context at', USER_DATA_DIR);
await log('Extension path:', EXT_PATH);

const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
  channel: 'chrome',
  headless: false,
  args: ['--enable-unsafe-extension-debugging', '--no-first-run', '--no-default-browser-check'],
  ignoreDefaultArgs: ['--disable-extensions', '--disable-component-extensions-with-background-pages'],
  viewport: null,
});

const browser = context.browser();
const cdp = await browser.newBrowserCDPSession();

let extId;
try {
  const r = await cdp.send('Extensions.loadUnpacked', { path: EXT_PATH });
  extId = r.id;
  await log('Extension loaded. id =', extId);
} catch (e) {
  await log('Extensions.loadUnpacked FAILED:', e.message);
  await log('Continuing without extension (browser still usable).');
}

const consoleBuf = [];
const attachConsole = (p) => {
  p.on('console', (msg) => {
    consoleBuf.push({ t: Date.now(), type: msg.type(), text: msg.text(), url: p.url() });
    if (consoleBuf.length > 1000) consoleBuf.shift();
  });
  p.on('pageerror', (err) => {
    consoleBuf.push({ t: Date.now(), type: 'pageerror', text: String(err), url: p.url() });
  });
};
context.on('page', (p) => {
  log('new page:', p.url());
  attachConsole(p);
});
context.pages().forEach(attachConsole);

const attachWorker = (sw) => {
  log('SW attached:', sw.url());
};
context.on('serviceworker', attachWorker);
context.serviceWorkers().forEach(attachWorker);

const initial = context.pages()[0] ?? (await context.newPage());
await log('Initial page:', initial.url());

async function readCmd() {
  try {
    await stat(CMD_FILE);
    const raw = await readFile(CMD_FILE, 'utf8');
    await unlink(CMD_FILE).catch(() => {});
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeResult(data) {
  await writeFile(RESULT_FILE, JSON.stringify(data, null, 2));
}

async function activePage() {
  const pages = context.pages();
  return pages[pages.length - 1];
}

async function handle(cmd) {
  const op = cmd.op;
  switch (op) {
    case 'list_pages': {
      return context.pages().map((p, i) => ({ index: i, url: p.url() }));
    }
    case 'goto': {
      const page = cmd.newTab ? await context.newPage() : await activePage();
      await page.goto(cmd.url, { waitUntil: cmd.waitUntil || 'load', timeout: cmd.timeout || 30000 });
      return { url: page.url(), title: await page.title() };
    }
    case 'screenshot': {
      const page = await activePage();
      const file =
        cmd.path ||
        path.join(SCREENSHOT_DIR, `shot-${Date.now()}.png`);
      await page.screenshot({ path: file, fullPage: !!cmd.fullPage });
      return { file };
    }
    case 'evaluate': {
      const page = await activePage();
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${cmd.expr})`)();
      const r = await page.evaluate(fn, cmd.arg);
      return { value: r };
    }
    case 'click': {
      const page = await activePage();
      await page.click(cmd.selector, { timeout: cmd.timeout || 10000 });
      return { ok: true };
    }
    case 'fill': {
      const page = await activePage();
      await page.fill(cmd.selector, cmd.value, { timeout: cmd.timeout || 10000 });
      return { ok: true };
    }
    case 'wait': {
      await new Promise((r) => setTimeout(r, cmd.ms || 1000));
      return { ok: true };
    }
    case 'console': {
      const out = consoleBuf.slice(-200);
      if (cmd.clear) consoleBuf.length = 0;
      return out;
    }
    case 'cdp_browser': {
      const r = await cdp.send(cmd.method, cmd.params || {});
      return r;
    }
    case 'extension_info': {
      const list = await cdp.send('Extensions.getExtensions');
      return { id: extId, list };
    }
    case 'reload_extension': {
      if (extId) {
        try {
          await cdp.send('Extensions.unload', { id: extId });
        } catch (e) {
          await log('Extensions.unload error (non-fatal):', e.message);
        }
      }
      const r = await cdp.send('Extensions.loadUnpacked', { path: EXT_PATH });
      extId = r.id;
      await log('Extension reloaded. id =', extId);
      return { id: extId };
    }
    case 'shutdown': {
      setTimeout(() => process.exit(0), 200);
      return { bye: true };
    }
    default:
      throw new Error('unknown op: ' + op);
  }
}

await writeResult({ ready: true, extId, initialUrl: initial.url() });
await log('Runner ready. Polling', CMD_FILE);

while (true) {
  const cmd = await readCmd();
  if (cmd) {
    try {
      const res = await handle(cmd);
      await writeResult({ ok: true, op: cmd.op, result: res });
      await log('cmd', cmd.op, '->', 'ok');
    } catch (e) {
      await writeResult({ ok: false, op: cmd.op, error: e.message, stack: e.stack });
      await log('cmd', cmd.op, '->', 'ERR', e.message);
    }
  } else {
    await new Promise((r) => setTimeout(r, 250));
  }
}
