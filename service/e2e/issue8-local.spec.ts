import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/service-a';
const BASE_URL = 'http://localhost:8081/';

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function takeScreenshot(page: Page, name: string) {
  const filename = `${name}.png`;
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, filename), fullPage: true });
  console.log(`📸 스크린샷 저장: ${filename}`);
}

test.describe('Issue #8 검증', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
  });

  test('Issue8-1: 상품 목록 기본 (2열 그리드, 실제 이미지)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('text=상품').last().click();
    await page.waitForTimeout(2000);

    await takeScreenshot(page, 'issue8-product-list-default');

    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter((img) => img.complete && img.naturalWidth === 0).length;
    });
    expect(brokenImages).toBe(0);

    const questionMarks = await page.locator('text=?').count();
    expect(questionMarks).toBe(0);
  });

  test('Issue8-2: 상품 목록 아티스트 필터', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('text=상품').last().click();
    await page.waitForTimeout(2000);

    const artistChip = page.locator('text=ARTIST A').first();
    if (await artistChip.isVisible({ timeout: 1000 })) {
      await artistChip.click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'issue8-product-list-artist-filter');
    }
  });

  test('Issue8-3: 상품 상세 (카드 라인업 + 확률)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('text=상품').last().click();
    await page.waitForTimeout(2000);

    const productCards = await page.locator('[role="button"]').all();
    if (productCards.length > 0) {
      await productCards[0].click();
      await page.waitForTimeout(1500);

      await takeScreenshot(page, 'issue8-product-detail-lineup');

      await expect(page.locator('text=구성 카드')).toBeVisible();
      await expect(page.locator('text=등급별 획득 확률')).toBeVisible();
    }
  });

  test('Issue8-4: 내 앨범 (보유/미보유 혼합)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('text=내 앨범').last().click();
    await page.waitForTimeout(2000);

    await takeScreenshot(page, 'issue8-my-album-mixed');

    const lockIcons = await page.locator('text=🔒').count();
    console.log(`Lock icons found: ${lockIcons}`);

    const questionMarks = await page.locator('text=?').count();
    expect(questionMarks).toBe(0);
  });
});
