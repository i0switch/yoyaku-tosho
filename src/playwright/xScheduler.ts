import { Page } from 'playwright';
import { ScheduledPost, RunResult } from '../domain/types';
import { X_SELECTORS } from './selectors';
import { Logger } from '../utils/logger';
import { format, parseISO } from 'date-fns';

const MAX_RETRIES = 2;

export async function scheduleXPost(
  page: Page,
  post: ScheduledPost,
  logger: Logger,
): Promise<RunResult> {
  const result: RunResult = {
    postId: post.id,
    status: 'failure',
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await doScheduleXPost(page, post, logger);
      result.status = 'success';
      logger.log(`Successfully scheduled post: ${post.id} for ${post.scheduledAt}`);
      return result;
    } catch (err: any) {
      if (attempt < MAX_RETRIES) {
        logger.warn(`[リトライ ${attempt}/${MAX_RETRIES}] 投稿 ${post.id} 失敗: ${err.message}。5秒後に再試行...`);
        await page.waitForTimeout(5000);
      } else {
        logger.error(`[失敗] 投稿 ${post.id} を ${MAX_RETRIES} 回試みましたが失敗しました。Xの画面構成が変わった可能性があります。スクリーンショットを確認してください。`, err);
        result.error = err.message;
        result.screenshotPath = await logger.takeScreenshot(page, `fail_${post.id}`);
      }
    }
  }

  return result;
}

async function doScheduleXPost(page: Page, post: ScheduledPost, logger: Logger): Promise<void> {
  logger.log(`Starting scheduling for post: ${post.id}`);

  // 1. Ensure we are on X and clear stuck dialogs
  if (!page.url().includes('x.com')) {
    logger.log(`Xホームへ移動中...`);
    await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } else {
    logger.log(`X上のダイアログをクリア中...`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
  }

  // Aggressive clearing of masks and overlays
  const clearAggressiveMasks = async () => {
    await page.evaluate(() => {
      // 1. Remove common mask test-ids
      const masks = document.querySelectorAll('[data-testid="twc-cc-mask"], [data-testid="mask"]');
      masks.forEach(m => m.remove());

      // 2. Remove blocking backdrops in #layers that aren't modals
      // X often puts dialogs in #layers. We only want to remove things that look like backdrops.
      const layerDivs = document.querySelectorAll('#layers > div > div > div > div');
      layerDivs.forEach(div => {
        const style = window.getComputedStyle(div);
        if (style.backgroundColor.includes('rgba(0, 0, 0') || style.backgroundColor.includes('rgb(0, 0, 0')) {
           if (style.position === 'absolute' || style.position === 'fixed') {
              div.remove();
           }
        }
      });
    });
    await page.waitForTimeout(500);
  };

  await clearAggressiveMasks();

  // 2. Open Compose Dialog
  // Try sidebar button first, but if it fails or is blocked, nav directly to compose URL
  try {
    logger.log(`「ポスト」ボタンをクリック中...`);
    await page.waitForSelector(X_SELECTORS.postButton, { timeout: 5000 });
    await page.click(X_SELECTORS.postButton, { timeout: 5000 });
  } catch (e) {
    logger.log(`ボタンのクリックに失敗。直接 /compose/post へ移動します... (Xの画面構成が変わった可能性があります)`);
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded' });
  }

  // 3. Wait for compose dialog and input text
  // X can have multiple textareas, wait for the one that is visible
  const textarea = page.locator(X_SELECTORS.postTextInput).filter({ visible: true }).first();
  await textarea.waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500 + Math.random() * 500);

  logger.log(`投稿内容を入力中...`);
  await textarea.fill(post.text); // fill is faster and more reliable for long texts

  // 4. Handle Media
  if (post.mediaPaths && post.mediaPaths.length > 0) {
    await page.waitForTimeout(1000 + Math.random() * 1000);
    await page.setInputFiles(X_SELECTORS.mediaInput, post.mediaPaths);
    await page.waitForTimeout(3000 + Math.random() * 2000); // Wait for upload
  }

  // 5. Open Schedule Dialog
  await page.waitForTimeout(1000 + Math.random() * 1000);

  // Ensure no masks blocking the schedule button
  await clearAggressiveMasks();

  logger.log(`スケジュールボタンをクリック中...`);
  try {
    // Primary: data-testid
    await page.click(X_SELECTORS.scheduleButton, { timeout: 5000 });
  } catch (e) {
    logger.log(`スケジュールボタンのクリックに失敗。強制クリックを試みます... (Xの画面構成が変わった可能性があります)`);
    // Fallback: force click or svg-based discovery
    await page.click(X_SELECTORS.scheduleButton, { force: true });
  }

  // Wait longer for the dialog to be fully rendered
  await page.waitForSelector(X_SELECTORS.scheduleDialogTitle, { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1000); // UI animation wait

  // 6. Set Schedule Date/Time
  const dateObj = parseISO(post.scheduledAt);
  const monthNum = format(dateObj, 'M');
  const monthFull = format(dateObj, 'MMMM'); // e.g. "3月"
  const day = format(dateObj, 'd');
  const year = format(dateObj, 'yyyy');
  const hour = format(dateObj, 'H');
  const minute = format(dateObj, 'm').padStart(2, '0');

  const dialog = page.locator('div[role="dialog"]').filter({ has: page.locator(X_SELECTORS.scheduleDialogTitle) }).last();

  // Helper to find and set select by its associated label text
  const setSelectByLabel = async (labelText: string, value: string, indexFallback: number, fallbackLabels: string[] = []) => {
    await page.waitForTimeout(500 + Math.random() * 500);
    try {
      logger.log(`Setting ${labelText} to ${value}...`);

      // Strategy 1: Standard getByLabel (X often uses aria-labelledby correctly)
      let targetSelect = dialog.getByLabel(labelText, { exact: true });

      // Strategy 2: If not found, look for label/span with text and find sibling/child select
      if (await targetSelect.count() === 0) {
        const labelOrSpan = dialog.locator('label, span').filter({ hasText: new RegExp(`^${labelText}$`) }).first();
        if (await labelOrSpan.count() > 0) {
          // Find the closest select (sibling or in parent div)
          targetSelect = labelOrSpan.locator('xpath=./following::select | ./ancestor::div[1]//select').first();
        }
      }

      // Strategy 3: Absolute fallback - use index if we're still stuck
      if (await targetSelect.count() === 0) {
        logger.warn(`Label "${labelText}" not found, using index fallback ${indexFallback}`);
        targetSelect = dialog.locator('select').nth(indexFallback);
      }

      if (await targetSelect.count() === 0) {
        throw new Error(`Select for "${labelText}" not found (Strategy 1, 2, 3 failed)`);
      }

      // Perform selection
      try {
        // Try by value (usually works for numbers)
        await targetSelect.selectOption(value);
      } catch {
        // Try by label (Japanese month names, etc.)
        const labelsToTry = [value, ...fallbackLabels];
        for (const l of labelsToTry) {
          try {
            await targetSelect.selectOption({ label: l });
            return;
          } catch {}
        }
        throw new Error(`Value/Label "${value}" not found in select for "${labelText}"`);
      }
    } catch (err: any) {
      logger.error(`Error setting select for ${labelText}`, err);
      throw err;
    }
  };

  // X usually has: Month, Day, Year, Hour, Minute
  await setSelectByLabel(X_SELECTORS.labelMonth, monthNum, 0, [monthFull, `${monthNum}月`]);
  await setSelectByLabel(X_SELECTORS.labelDay, day, 1);
  await setSelectByLabel(X_SELECTORS.labelYear, year, 2);
  await setSelectByLabel(X_SELECTORS.labelHour, hour, 3);
  await setSelectByLabel(X_SELECTORS.labelMinute, minute, 4);

  await page.waitForTimeout(1000 + Math.random() * 1000);

  // 7. Confirm Schedule in Dialog (The "Confirm" button)
  await page.waitForTimeout(1000 + Math.random() * 1000);

  // Specifically target the button in the top-right of the dialog
  const confirmBtn = dialog.locator('button').filter({ hasText: X_SELECTORS.buttonConfirm }).first();
  if (await confirmBtn.count() > 0) {
    logger.log(`Clicking "${X_SELECTORS.buttonConfirm}" button...`);
    await confirmBtn.click();
  } else {
    // Emergency backup
    logger.warn(`"${X_SELECTORS.buttonConfirm}" not found by text, trying data-testid...`);
    await dialog.locator(X_SELECTORS.scheduleConfirmButton).click();
  }

  // 8. Final Submit (The "Schedule" button in the compose dialog)
  await page.waitForSelector(X_SELECTORS.scheduleDialogTitle, { state: 'hidden' });
  await page.waitForTimeout(1500 + Math.random() * 1000); // UI animation wait

  // The button text changes to "予約設定"
  const finalBtn = page.locator('button[data-testid*="tweetButton"]').filter({ hasText: X_SELECTORS.buttonSchedule }).first();
  if (await finalBtn.count() > 0) {
    logger.log(`Clicking final "${X_SELECTORS.buttonSchedule}" button...`);
    await finalBtn.click();
  } else {
    logger.warn(`Final button with text "${X_SELECTORS.buttonSchedule}" not found, trying generic submit button...`);
    await page.click(X_SELECTORS.submitPostButton);
  }

  // 9. Verify success
  await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
}
