import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function setupAuth() {
  const storagePath = path.resolve(process.cwd(), 'storageState.json');
  
  console.log('--- Auth Setup Starting ---');
  console.log('1. ブラウザが立ち上がります。');
  console.log('2. Xにログインしてください。');
  console.log('3. ログインが完了し、ホーム画面が表示されたらブラウザを閉じてください。');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://x.com/login');
  
  // Wait for the browser to be closed by the user
  await new Promise((resolve) => {
    page.on('close', resolve);
    browser.on('disconnected', resolve);
  });
  
  // After closed, save state
  if (fs.existsSync(storagePath)) {
      console.log('Existing storageState.json found. Overwriting...');
  }
  
  try {
    await context.storageState({ path: storagePath });
    console.log(`--- Success! Auth state saved to: ${storagePath} ---`);
  } catch (err) {
    console.error('Failed to save auth state:', err);
  } finally {
    await browser.close();
  }
}

setupAuth();
