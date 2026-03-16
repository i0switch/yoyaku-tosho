import fs from 'fs';
import path from 'path';
import { Page } from 'playwright';

export class Logger {
  constructor(private logsDir: string, private screenshotsDir: string) {
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  private writeLine(level: string, message: string, logFile: string) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] ${message}\n`;
    console.log(line.trim());
    fs.appendFileSync(path.join(this.logsDir, logFile), line);
  }

  log(message: string) {
    this.writeLine('INFO', message, 'app.log');
  }

  warn(message: string) {
    this.writeLine('WARN', message, 'app.log');
  }

  error(message: string, error?: any) {
    const detail = error?.message || (typeof error === 'string' ? error : '');
    const fullMessage = detail ? `${message} - ${detail}` : message;
    this.writeLine('ERROR', fullMessage, 'error.log');
    this.writeLine('ERROR', fullMessage, 'app.log');
  }

  async takeScreenshot(page: Page, name: string): Promise<string> {
    const filename = `${new Date().getTime()}_${name}.png`;
    const filePath = path.join(this.screenshotsDir, filename);
    await page.screenshot({ path: filePath });
    return filePath;
  }
}
