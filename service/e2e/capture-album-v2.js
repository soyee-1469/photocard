const { chromium } = require('@playwright/test');
const path = require('path');

const ARTIFACTS_DIR = '/opt/cursor/artifacts/service-a';
const BASE_URL = 'http://localhost:8081/';

(async () => {
  const browser = await chromium.launch({ headless: true });

  console.log('1. 내 앨범 (보유 카드 있음)');
  const context1 = await browser.newContext({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
  });
  const page1 = await context1.newPage();
  await page1.goto(BASE_URL);
  await page1.waitForTimeout(3000);

  await page1.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button, [role="button"]'));
    const albumLink = links.find(el => el.textContent?.includes('내 앨범') || el.textContent?.includes('앨범'));
    if (albumLink) albumLink.click();
  });
  await page1.waitForTimeout(3000);
  await page1.screenshot({ path: path.join(ARTIFACTS_DIR, 'issue8-album-owned.png'), fullPage: true });
  console.log('✅ issue8-album-owned.png');
  await context1.close();

  console.log('\\n2. 내 앨범 (보유 카드 0장)');
  const context2 = await browser.newContext({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
  });
  const page2 = await context2.newPage();
  await page2.goto(BASE_URL);
  await page2.waitForTimeout(2000);

  await page2.evaluate(() => {
    localStorage.clear();
  });
  await page2.reload();
  await page2.waitForTimeout(3000);

  await page2.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button, [role="button"]'));
    const albumLink = links.find(el => el.textContent?.includes('내 앨범') || el.textContent?.includes('앨범'));
    if (albumLink) albumLink.click();
  });
  await page2.waitForTimeout(3000);
  await page2.screenshot({ path: path.join(ARTIFACTS_DIR, 'issue8-album-empty.png'), fullPage: true });
  console.log('✅ issue8-album-empty.png');
  await context2.close();

  console.log('\\n완료!');
  await browser.close();
})();
