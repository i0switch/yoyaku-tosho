import fs from 'fs';
import path from 'path';
import { Page } from 'playwright';

export class Logger {
  constructor(private logsDir: string, private screenshotsDir: string) {
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  log(message: string) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    console.log(line.trim());
    fs.appendFileSync(path.join(this.logsDir, 'app.log'), line);
  }

  error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ERROR: ${message} - ${error?.message || error}\n`;
    console.error(line.trim());
    fs.appendFileSync(path.join(this.logsDir, 'error.log'), line);
  }

  async takeScreenshot(page: Page, name: string): Promise<string> {
    const filename = `${new Date().getTime()}_${name}.png`;
    const filePath = path.join(this.screenshotsDir, filename);
    await page.screenshot({ path: filePath });
    return filePath;
  }
}
