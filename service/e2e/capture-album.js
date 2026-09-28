const { chromium } = require('@playwright/test');
const path = require('path');

const ARTIFACTS_DIR = '/opt/cursor/artifacts/service-a';
const BASE_URL = 'http://localhost:8081/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
  });
  const page = await context.newPage();

  console.log('페이지 로딩...');
  await page.goto(BASE_URL);
  await page.waitForTimeout(5000);

  console.log('내 앨범 (보유 카드 있음) 스크린샷');
  const albumTab = page.locator('text=내 앨범').last();
  if (await albumTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await albumTab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'issue8-album-owned.png'), fullPage: true });
    console.log('✅ issue8-album-owned.png 저장');
  } else {
    console.log('⚠️  내 앨범 탭을 찾을 수 없음');
  }

  console.log('\\n로컬 스토리지 초기화 (보유 카드 0장)');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await page.waitForTimeout(3000);

  const albumTab2 = page.locator('text=내 앨범').last();
  if (await albumTab2.isVisible({ timeout: 5000 }).catch(() => false)) {
    await albumTab2.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'issue8-album-empty.png'), fullPage: true });
    console.log('✅ issue8-album-empty.png 저장');
  } else {
    console.log('⚠️  내 앨범 탭을 찾을 수 없음 (빈 상태)');
  }

  console.log('\\n완료!');
  await browser.close();
})();
