import path from 'path';
import fs from 'fs/promises';
import { program } from 'commander';
import dotenv from 'dotenv';
import { AppConfig, RunSummary } from '../domain/types';
import { loadPostsFromMarkdown } from '../services/loadPosts';
import { validatePosts } from '../services/validatePosts';
import { generateSchedule } from '../services/generateSchedule';
import { initBrowser } from '../playwright/browser';
import { scheduleXPost } from '../playwright/xScheduler';
import { Logger } from '../utils/logger';

dotenv.config();

async function main() {
  program
    .name('x-scheduler')
    .description('X Auto Scheduler CLI')
    .option('-i, --input <path>', 'Input markdown file', 'posts.md')
    .option('-s, --storage <path>', 'Playwright storage state (auth)', 'storageState.json')
    .option('-d, --dry-run', 'Run without actual scheduling', false)
    .option('-m, --max <number>', 'Maximum posts to schedule', (val) => parseInt(val))
    .option('--headless <boolean>', 'Run browser in headless mode', (val) => val === 'true', false)
    .option('--cdp <url>', 'Connect to existing browser via CDP', 'http://localhost:9222')
    .parse(process.argv);

  const options = program.opts();

  const config: AppConfig = {
    inputPath: path.resolve(process.cwd(), options.input),
    storageStatePath: path.resolve(process.cwd(), options.storage),
    screenshotsDir: path.resolve(process.cwd(), 'screenshots'),
    logsDir: path.resolve(process.cwd(), 'logs'),
    dryRun: options.dryRun,
    maxPosts: options.max,
    headless: options.headless,
    cdpEndpoint: options.cdp,
  };

  const logger = new Logger(config.logsDir, config.screenshotsDir);
  const summary: RunSummary = { total: 0, success: 0, failure: 0, skipped: 0, results: [] };

  try {
    logger.log('--- X Scheduler Builder Starting ---');
    logger.log(`Config: ${JSON.stringify({ ...config, storageStatePath: 'REDACTED' }, null, 2)}`);

    // 0. Load Schedule Config
    const scheduleConfigPath = path.resolve(process.cwd(), 'schedule_config.json');
    let scheduleConfig;
    try {
      const raw = await fs.readFile(scheduleConfigPath, 'utf-8');
      scheduleConfig = JSON.parse(raw);
      logger.log(`Loaded schedule config: ${JSON.stringify(scheduleConfig)}`);
    } catch {
      logger.warn('schedule_config.json not found or invalid. Using defaults.');
    }

    // 1. Load & Validate
    const rawPosts = await loadPostsFromMarkdown(config.inputPath);
    const validationErrors = validatePosts(rawPosts);
    if (validationErrors.length > 0) {
      logger.error('Validation failed:');
      validationErrors.forEach((err) => logger.log(` - ${err}`));
      process.exit(1);
    }

    // 2. Schedule
    const posts = generateSchedule(rawPosts, new Date(), scheduleConfig);
    const postsToProcess = config.maxPosts ? posts.slice(0, config.maxPosts) : posts;

    summary.total = postsToProcess.length;
    logger.log(`Plan: ${summary.total} posts to schedule.`);
    postsToProcess.forEach((p) => logger.log(` - [${p.scheduledAt}] ${p.text.substring(0, 30)}...`));

    if (config.dryRun) {
      logger.log('Dry-run enabled. Skipping browser interaction.');
      logger.log('--- Dry-run Completed Successfully ---');
      return;
    }

    // 3. Browser Interaction
    const { context, page } = await initBrowser(config);

    for (const post of postsToProcess) {
      const result = await scheduleXPost(page, post, logger);
      summary.results.push(result);
      if (result.status === 'success') summary.success++;
      else summary.failure++;

      // Moderate delay between posts to avoid detection/spam
      const delay = 5000 + Math.random() * 5000;
      await page.waitForTimeout(delay);
    }

    await context.close();

    // 4. Summary
    logger.log('--- Execution Summary ---');
    logger.log(`Total: ${summary.total}`);
    logger.log(`Success: ${summary.success}`);
    logger.log(`Failure: ${summary.failure}`);
    logger.log('--------------------------');

  } catch (err: any) {
    logger.error('Critical application error', err);
    process.exit(1);
  }
}

main();
