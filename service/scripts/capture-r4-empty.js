const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = '/opt/cursor/artifacts/service-a';
const BASE_URL = 'https://soyee-1469.github.io/photocard/service/pr-7/';

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function captureR4EmptyAlbum() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  console.log('📸 r4-album-empty 스크린샷 캡처...\n');

  await page.goto(BASE_URL + 'album?seed=empty');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const screenshotPath = path.join(ARTIFACTS_DIR, 'r4-album-empty.png');
  await page.screenshot({ path: screenshotPath });

  await browser.close();

  const stats = fs.statSync(screenshotPath);
  const sizeKB = (stats.size / 1024).toFixed(1);
  const status = stats.size > 10240 ? '✅' : '⚠️';

  console.log(`${status} r4-album-empty.png: ${sizeKB} KB`);
  console.log(`저장 위치: ${screenshotPath}`);
}

captureR4EmptyAlbum().catch(console.error);
