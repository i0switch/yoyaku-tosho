import http from 'http';
import path from 'path';
import { readFileSync } from 'fs';
import { spawn, ChildProcess, exec } from 'child_process';

const PORT = 51234;
const CWD = path.resolve(__dirname, '../..');

// ─── State ────────────────────────────────────────────────────────────────────

type ChromeStatus = 'stopped' | 'starting' | 'running';
type SchedulerStatus = 'stopped' | 'running' | 'finished' | 'error';

let chromeStatus: ChromeStatus = 'stopped';
let schedulerStatus: SchedulerStatus = 'stopped';
let schedulerProc: ChildProcess | null = null;

interface LogEntry { target: string; line: string; ts: string }
const logs: LogEntry[] = [];
const MAX_LOGS = 500;

// ─── SSE Clients ──────────────────────────────────────────────────────────────

const clients = new Set<http.ServerResponse>();

function sendSSE(res: http.ServerResponse, data: object) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcast(data: object) {
  for (const c of clients) sendSSE(c, data);
}

function addLog(target: 'chrome' | 'scheduler' | 'system', text: string) {
  const entry: LogEntry = { target, line: text, ts: new Date().toISOString() };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.shift();
  broadcast({ type: 'log', ...entry });
}

function broadcastStatus() {
  broadcast({ type: 'status', chrome: chromeStatus, scheduler: schedulerStatus });
}

// ─── Chrome ───────────────────────────────────────────────────────────────────

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome(): string | null {
  const { existsSync } = require('fs') as typeof import('fs');
  for (const p of CHROME_CANDIDATES) {
    if (p && existsSync(p)) return p;
  }
  return null;
}

async function checkChromePort(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:9222/json', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => { req.destroy(); resolve(false); });
  });
}

async function startChrome() {
  const already = await checkChromePort();
  if (already) {
    chromeStatus = 'running';
    broadcastStatus();
    addLog('chrome', 'Chrome はすでに起動しています (port 9222)');
    return;
  }

  const chromePath = findChrome();
  if (!chromePath) {
    addLog('chrome', 'エラー: Chrome が見つかりませんでした。手動で起動してください');
    addLog('chrome', '  コマンド: chrome --remote-debugging-port=9222');
    return;
  }

  chromeStatus = 'starting';
  broadcastStatus();
  addLog('chrome', `Chrome を起動中: ${chromePath}`);

  const userDataDir = (process.env.TEMP || process.env.TMP || 'C:\\Temp') + '\\chrome-automation';

  spawn(chromePath, [
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
  ], {
    detached: true,
    stdio: 'ignore',
  }).unref();

  // Poll until Chrome responds on 9222
  let attempts = 0;
  const poll = setInterval(async () => {
    attempts++;
    if (await checkChromePort()) {
      clearInterval(poll);
      chromeStatus = 'running';
      broadcastStatus();
      addLog('chrome', 'Chrome 起動完了！ポート 9222 が準備できました');
    } else if (attempts >= 20) {
      clearInterval(poll);
      chromeStatus = 'stopped';
      broadcastStatus();
      addLog('chrome', 'タイムアウト: Chrome が応答しませんでした。手動で確認してください');
    }
  }, 1000);
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

function startScheduler() {
  if (schedulerProc) return;

  schedulerStatus = 'running';
  broadcastStatus();
  addLog('scheduler', 'スケジューラーを起動中...');

  schedulerProc = spawn(
    'node', ['dist/cli/index.js', '--cdp', 'http://localhost:9222'],
    { cwd: CWD, shell: true }
  );

  schedulerProc.stdout?.on('data', (d: Buffer) => {
    String(d).trim().split('\n').filter(Boolean).forEach((l) => addLog('scheduler', l));
  });

  schedulerProc.stderr?.on('data', (d: Buffer) => {
    String(d).trim().split('\n').filter(Boolean).forEach((l) => addLog('scheduler', l));
  });

  schedulerProc.on('exit', (code) => {
    schedulerProc = null;
    schedulerStatus = code === 0 ? 'finished' : 'error';
    broadcastStatus();
    addLog('scheduler', `スケジューラーが終了しました (exit: ${code})`);
  });
}

function stopScheduler() {
  if (!schedulerProc) return;
  schedulerProc.kill();
  schedulerProc = null;
  schedulerStatus = 'stopped';
  broadcastStatus();
  addLog('scheduler', 'スケジューラーを停止しました');
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────

const HTML = readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

function parseBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => resolve(body));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:${PORT}`);
  const { method } = req;

  // GUI
  if (method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  // SSE
  if (method === 'GET' && url.pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');
    clients.add(res);
    // Send current state to new client
    sendSSE(res, { type: 'status', chrome: chromeStatus, scheduler: schedulerStatus });
    for (const l of logs) sendSSE(res, { type: 'log', ...l });
    req.on('close', () => clients.delete(res));
    return;
  }

  // API
  if (method === 'POST' && url.pathname === '/api/chrome/start') {
    await startChrome();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (method === 'POST' && url.pathname === '/api/scheduler/start') {
    startScheduler();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (method === 'POST' && url.pathname === '/api/scheduler/stop') {
    stopScheduler();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`X Scheduler GUI → ${url}`);
  addLog('system', `GUI 起動: ${url}`);
  // Auto-open browser
  exec(`start ${url}`);
});
