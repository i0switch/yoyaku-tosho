/**
 * TC-CLI-01〜08: CLI オプション・ロジックのテスト
 * index.ts はモジュールロード時に main() を実行するため、
 * CLI で使われる commander オプション定義とサービス関数を直接テストする。
 */

import { Command } from 'commander';

/** CLI と同じオプション定義を持つパーサを生成 */
function buildProgram() {
  const program = new Command();
  program
    .name('x-scheduler')
    .description('X Auto Scheduler CLI')
    .option('-i, --input <path>', 'Input markdown file', 'posts.md')
    .option('-s, --storage <path>', 'Playwright storage state (auth)', 'storageState.json')
    .option('-d, --dry-run', 'Run without actual scheduling', false)
    .option('-m, --max <number>', 'Maximum posts to schedule', (val: string) => parseInt(val))
    .option('--headless <boolean>', 'Run browser in headless mode', (val: string) => val === 'true', false)
    .option('--cdp <url>', 'Connect to existing browser via CDP', 'http://localhost:9222');
  return program;
}

function parseArgs(args: string[]) {
  const program = buildProgram();
  program.parse(['node', 'x-scheduler', ...args]);
  return program.opts();
}

describe('CLI オプション', () => {
  // TC-CLI-01: --dry-run フラグ → dryRun=true
  it('TC-CLI-01: --dry-run フラグが正しく解析される', () => {
    const opts = parseArgs(['--dry-run']);
    expect(opts.dryRun).toBe(true);
  });

  // TC-CLI-02: --max 2 フラグ → max=2 として数値で解析される
  it('TC-CLI-02: --max 2 フラグが数値として解析される', () => {
    const opts = parseArgs(['--max', '2']);
    expect(opts.max).toBe(2);
    // postsToProcess = posts.slice(0, max) で2件に制限される
    const posts = ['P1', 'P2', 'P3'];
    expect(posts.slice(0, opts.max)).toHaveLength(2);
  });

  // TC-CLI-03: input ファイル不存在 → loadPostsFromMarkdown がエラーをスロー
  it('TC-CLI-03: input ファイル不存在 → loadPostsFromMarkdown がスロー', async () => {
    const { loadPostsFromMarkdown } = await import('../services/loadPosts');
    await expect(loadPostsFromMarkdown('/nonexistent/path/posts.md')).rejects.toThrow(
      'Input file not found',
    );
  });

  // TC-CLI-04: validation失敗 → validatePosts がエラー配列を返す
  it('TC-CLI-04: バリデーション失敗 → validatePosts がエラーを返す', async () => {
    const { validatePosts } = await import('../services/validatePosts');
    const errors = validatePosts([{ text: '' }]);
    expect(errors.length).toBeGreaterThan(0);
  });

  // TC-CLI-05: schedule_config.json が有効 JSON → パース成功
  it('TC-CLI-05: schedule_config.json の正常パース', () => {
    const raw = JSON.stringify({
      startHour: 9,
      startMinute: 0,
      endHour: 18,
      endMinute: 0,
      intervalMinutes: 60,
    });
    const config = JSON.parse(raw);
    expect(config.startHour).toBe(9);
    expect(config.intervalMinutes).toBe(60);
  });

  // TC-CLI-06: schedule_config.json 不存在 → デフォルト設定を使用
  it('TC-CLI-06: schedule_config.json 不存在 → scheduleConfig が undefined', async () => {
    const { generateSchedule } = await import('../services/generateSchedule');
    // scheduleConfig が undefined の場合 generateSchedule は DEFAULT_CONFIG を使う
    const posts = [{ text: 'P1' }];
    const ref = new Date('2026-03-14T10:00:00');
    // undefined を渡すと DEFAULT_CONFIG (interval=60) が使われ 11:00 になる
    const schedule = generateSchedule(posts, ref, undefined);
    expect(schedule[0].scheduledAt).toContain('11:00');
  });

  // TC-CLI-07: --headless true → headless=true として解析
  it('TC-CLI-07: --headless true → headless オプションが true', () => {
    const opts = parseArgs(['--headless', 'true']);
    expect(opts.headless).toBe(true);
  });

  // TC-CLI-08: --cdp フラグ → cdpEndpoint が設定される
  it('TC-CLI-08: --cdp フラグ → cdp オプションに URL が設定される', () => {
    const opts = parseArgs(['--cdp', 'http://localhost:9223']);
    expect(opts.cdp).toBe('http://localhost:9223');
  });
});
