import { EventEmitter } from 'events';

// --- モック定義 (jest.mock はホイスティングされるため先頭に置く) ---
jest.mock('http', () => ({
  get: jest.fn(),
  createServer: jest.fn(() => ({ listen: jest.fn() })),
}));

jest.mock('child_process', () => ({
  spawn: jest.fn(),
  exec: jest.fn(),
}));

jest.mock('net', () => ({
  createConnection: jest.fn(),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(false),
  readFileSync: jest.fn().mockReturnValue(''),
}));

import http from 'http';
import { spawn } from 'child_process';
import net from 'net';
import { existsSync } from 'fs';
import {
  checkChromePort,
  startChrome,
  startScheduler,
  stopScheduler,
  resetState,
  getState,
} from './server';

const mockGet = http.get as jest.Mock;
const mockSpawn = spawn as jest.Mock;
const mockCreateConnection = net.createConnection as jest.Mock;
const mockExistsSync = existsSync as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────

function makeReq() {
  return {
    on: jest.fn().mockReturnThis(),
    setTimeout: jest.fn().mockReturnThis(),
    destroy: jest.fn(),
  };
}

/**
 * http.get モック: cb(res) 直後に data/end を同期的に emit する。
 * process.nextTick 不使用なので fake timers と併用可能。
 */
function setupHttpMock(body: string, statusCode = 200) {
  mockGet.mockImplementation((_url: string, cb: (r: any) => void) => {
    const res = Object.assign(new EventEmitter(), { statusCode });
    cb(res);
    if (statusCode === 200) {
      res.emit('data', body);
      res.emit('end');
    }
    return makeReq();
  });
}

/**
 * net.createConnection モック: on() 呼び出し時に同期的にイベントを発火。
 * process.nextTick 不使用なので fake timers と併用可能。
 */
function makeNetSocketSync(scenario: 'connect' | 'error') {
  const sock: any = {
    destroy: jest.fn(),
    setTimeout: jest.fn(() => sock),
    on: jest.fn().mockImplementation((event: string, handler: Function) => {
      if (event === scenario) {
        if (scenario === 'error') handler(new Error('ECONNREFUSED'));
        else { sock.destroy(); handler(); } // connect
      }
      return sock;
    }),
  };
  return sock;
}

function makeMockChildProcess() {
  const proc = Object.assign(new EventEmitter(), {
    stdout: new EventEmitter(),
    stderr: new EventEmitter(),
    kill: jest.fn(),
  });
  return proc;
}

// ─────────────────────────────────────────────────────────────────────────────
// TC-SV-CP: checkChromePort
// ─────────────────────────────────────────────────────────────────────────────
describe('checkChromePort', () => {
  beforeEach(() => {
    resetState();
    jest.clearAllMocks();
  });

  it('TC-SV-CP-01: Chrome ブラウザが返る → true', async () => {
    setupHttpMock(JSON.stringify({ Browser: 'Chrome/100.0' }));
    expect(await checkChromePort()).toBe(true);
  });

  it('TC-SV-CP-02: Browser が Firefox → false', async () => {
    setupHttpMock(JSON.stringify({ Browser: 'Firefox/99' }));
    expect(await checkChromePort()).toBe(false);
  });

  it('TC-SV-CP-03: 非200ステータス → false', async () => {
    setupHttpMock('', 500);
    expect(await checkChromePort()).toBe(false);
  });

  it('TC-SV-CP-04: JSON parse失敗 → false', async () => {
    setupHttpMock('not-json-at-all');
    expect(await checkChromePort()).toBe(false);
  });

  it('TC-SV-CP-05: 接続エラー → false', async () => {
    const req = {
      on: jest.fn().mockImplementation((event: string, handler: Function) => {
        if (event === 'error') handler(new Error('ECONNREFUSED'));
        return req;
      }),
      setTimeout: jest.fn().mockReturnThis(),
      destroy: jest.fn(),
    };
    mockGet.mockReturnValue(req);
    expect(await checkChromePort()).toBe(false);
  });

  it('TC-SV-CP-06: タイムアウト → false', async () => {
    const req: any = {
      on: jest.fn().mockReturnThis(),
      setTimeout: jest.fn().mockImplementation((_ms: number, cb: () => void) => {
        req.destroy();
        cb();
        return req;
      }),
      destroy: jest.fn(),
    };
    mockGet.mockReturnValue(req);
    expect(await checkChromePort()).toBe(false);
  });

  it('TC-SV-CP-07: Browser フィールドなし → false', async () => {
    setupHttpMock(JSON.stringify({ version: '100' }));
    expect(await checkChromePort()).toBe(false);
  });

  it('TC-SV-CP-08: 大文字小文字混在 Chrome → true', async () => {
    setupHttpMock(JSON.stringify({ Browser: 'Chrome/120.0.6099.109' }));
    expect(await checkChromePort()).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TC-SV-SC: startChrome
// ─────────────────────────────────────────────────────────────────────────────
describe('startChrome', () => {
  beforeEach(() => {
    resetState();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('TC-SV-SC-01: checkChromePort=true → chromeStatus=running 即時', async () => {
    setupHttpMock(JSON.stringify({ Browser: 'Chrome/100' }));
    await startChrome();
    expect(getState().chromeStatus).toBe('running');
  });

  it('TC-SV-SC-02: ポート9222が他プロセスに使用中 → エラーログ追加', async () => {
    // checkChromePort = false
    setupHttpMock(JSON.stringify({ Browser: 'Firefox' }));
    // net: port in use (connect 同期発火)
    mockCreateConnection.mockImplementation(() => makeNetSocketSync('connect'));

    await startChrome();

    const state = getState();
    expect(state.logs.some((l) => l.line.includes('9222') || l.line.includes('エラー'))).toBe(true);
  });

  it('TC-SV-SC-03: Chrome実行ファイルなし → エラーログ追加', async () => {
    // checkChromePort = false (non-200)
    setupHttpMock('', 404);
    mockCreateConnection.mockImplementation(() => makeNetSocketSync('error'));
    mockExistsSync.mockReturnValue(false);

    await startChrome();

    const state = getState();
    expect(state.logs.some((l) => l.line.includes('Chrome') || l.line.includes('エラー'))).toBe(true);
  });

  it('TC-SV-SC-04: 正常起動フロー → spawn呼び出し確認', async () => {
    setupHttpMock('', 404); // checkChromePort = false
    mockCreateConnection.mockImplementation(() => makeNetSocketSync('error'));
    mockExistsSync.mockImplementation((p: string) => typeof p === 'string' && p.includes('chrome.exe'));
    mockSpawn.mockReturnValue({ unref: jest.fn() });

    jest.useFakeTimers();
    await startChrome();

    expect(mockSpawn).toHaveBeenCalled();
  });

  it('TC-SV-SC-05: ポーリングでrunning確認 → chromeStatus=running', async () => {
    let httpCallCount = 0;
    mockGet.mockImplementation((_: string, cb: (r: any) => void) => {
      httpCallCount++;
      const body =
        httpCallCount > 1
          ? JSON.stringify({ Browser: 'Chrome/100' })
          : JSON.stringify({ Browser: 'Firefox' });
      const res = Object.assign(new EventEmitter(), { statusCode: 200 });
      cb(res);
      res.emit('data', body);
      res.emit('end');
      return makeReq();
    });
    mockCreateConnection.mockImplementation(() => makeNetSocketSync('error'));
    mockExistsSync.mockImplementation((p: string) => typeof p === 'string' && p.includes('chrome.exe'));
    mockSpawn.mockReturnValue({ unref: jest.fn() });

    jest.useFakeTimers();
    await startChrome();

    expect(getState().chromeStatus).toBe('starting');

    await jest.advanceTimersByTimeAsync(1000);

    expect(getState().chromeStatus).toBe('running');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TC-SV-SS: startScheduler / stopScheduler
// ─────────────────────────────────────────────────────────────────────────────
describe('startScheduler / stopScheduler', () => {
  let mockProc: ReturnType<typeof makeMockChildProcess>;

  beforeEach(() => {
    resetState();
    jest.clearAllMocks();
    mockProc = makeMockChildProcess();
    mockSpawn.mockReturnValue(mockProc);
  });

  it('TC-SV-SS-01: startScheduler → schedulerStatus=running', () => {
    startScheduler();
    expect(getState().schedulerStatus).toBe('running');
  });

  it('TC-SV-SS-02: 2回呼び出しても spawn は1回のみ', () => {
    startScheduler();
    startScheduler();
    expect(mockSpawn).toHaveBeenCalledTimes(1);
  });

  it('TC-SV-SS-03: stdout data → addLog に記録', () => {
    startScheduler();
    mockProc.stdout.emit('data', Buffer.from('scheduler stdout line\n'));
    expect(getState().logs.some((l) => l.line === 'scheduler stdout line')).toBe(true);
  });

  it('TC-SV-SS-04: stderr data → addLog に記録', () => {
    startScheduler();
    mockProc.stderr.emit('data', Buffer.from('scheduler error line\n'));
    expect(getState().logs.some((l) => l.line === 'scheduler error line')).toBe(true);
  });

  it('TC-SV-SS-05: exit(0) → schedulerStatus=finished', () => {
    startScheduler();
    mockProc.emit('exit', 0);
    expect(getState().schedulerStatus).toBe('finished');
  });

  it('TC-SV-SS-06: exit(1) → schedulerStatus=error', () => {
    startScheduler();
    mockProc.emit('exit', 1);
    expect(getState().schedulerStatus).toBe('error');
  });

  it('TC-SV-SS-07: stopScheduler → schedulerStatus=stopped', () => {
    startScheduler();
    stopScheduler();
    expect(getState().schedulerStatus).toBe('stopped');
  });

  it('TC-SV-SS-08: stopScheduler 未起動時 → エラーなし', () => {
    expect(() => stopScheduler()).not.toThrow();
  });
});
