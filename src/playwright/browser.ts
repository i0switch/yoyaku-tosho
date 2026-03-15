import { chromium, BrowserContext, Page } from 'playwright';
import { AppConfig } from '../domain/types';
import fs from 'fs';

export async function initBrowser(config: AppConfig): Promise<{ context: BrowserContext; page: Page }> {
  if (config.cdpEndpoint) {
    console.log(`Connecting to CDP: ${config.cdpEndpoint}...`);
    try {
      const browser = await chromium.connectOverCDP(config.cdpEndpoint);
      // Sometimes contexts might not be initialized yet, or we might need to create one
      let context = browser.contexts()[0];
      if (!context) {
        // If no context exists, we can't really "connect" to the existing user session easily
        // but we can try to create a new one in that instance.
        // Usually, a launched Chrome with debug port will have at least one context.
        throw new Error('No active browser context found in the target Chrome instance.');
      }
      const page = await context.newPage();
      await page.bringToFront();
      return { context, page };
    } catch (err: any) {
      throw new Error(`Failed to connect to Chrome via CDP (${config.cdpEndpoint}): ${err.message}. \nChromeを "--remote-debugging-port=9222" で起動しているか確認してね。`);
    }
  }

  // Use storage state for fresh launch
  const browser = await chromium.launch({
    headless: config.headless,
  });

  const context = await browser.newContext({
    storageState: fs.existsSync(config.storageStatePath) ? config.storageStatePath : undefined,
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();
  return { context, page };
}
