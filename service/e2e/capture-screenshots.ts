import { chromium } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/service-a';
const BASE_URL = 'http://localhost:8081/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
  });
  const page = await context.newPage();

  console.log('로딩 중...');
  await page.goto(BASE_URL);
  await page.waitForTimeout(5000);

  console.log('1. 상품 목록 스크린샷');
  await page.locator('text=상품').last().click({ timeout: 10000 }).catch(() => console.log('상품 탭 클릭 실패'));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'issue8-product-list-default.png'), fullPage: true });

  console.log('2. 아티스트 필터 스크린샷');
  const artistChip = page.locator('text=ARTIST A').first();
  if (await artistChip.isVisible({ timeout: 2000 }).catch(() => false)) {
    await artistChip.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'issue8-product-list-artist-filter.png'), fullPage: true });
  }

  console.log('3. 상품 상세 스크린샷');
  await page.goto(BASE_URL);
  await page.waitForTimeout(3000);
  await page.locator('text=상품').last().click({ timeout: 10000 }).catch(() => console.log('상품 탭 클릭 실패'));
  await page.waitForTimeout(2000);
  const productCards = await page.locator('[role="button"]').all();
  if (productCards.length > 0) {
    await productCards[0].click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'issue8-product-detail-lineup.png'), fullPage: true });
  }

  console.log('4. 내 앨범 스크린샷');
  await page.goto(BASE_URL);
  await page.waitForTimeout(3000);
  await page.locator('text=내 앨범').last().click({ timeout: 10000 }).catch(() => console.log('앨범 탭 클릭 실패'));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'issue8-my-album-mixed.png'), fullPage: true });

  console.log('완료!');
  await browser.close();
})();
