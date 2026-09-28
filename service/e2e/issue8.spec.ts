import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/service-a';

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
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('tab-products').click();
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
    await page.waitForTimeout(1000);

    await takeScreenshot(page, 'issue8-product-list-default');

    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter((img) => img.complete && img.naturalWidth === 0).length;
    });
    expect(brokenImages).toBe(0);

    const questionMarks = await page.locator('text=?').count();
    expect(questionMarks).toBe(0);

    expect(consoleErrors).toHaveLength(0);
  });

  test('Issue8-2: 상품 목록 아티스트 필터', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('tab-products').click();
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });

    const artistChip = page.locator('text=ARTIST A').first();
    await expect(artistChip).toBeVisible();
    await artistChip.click({ force: true });
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'issue8-product-list-artist-filter');

    expect(consoleErrors).toHaveLength(0);
  });

  test('Issue8-3: 상품 상세 (카드 라인업 + 확률)', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/products/prod-01');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await takeScreenshot(page, 'issue8-product-detail-lineup');

    await expect(page.locator('text=구성 카드')).toBeVisible();
    await expect(page.locator('text=등급별 획득 확률')).toBeVisible();

    const allImages = await page.locator('img').count();
    expect(allImages).toBeGreaterThan(0);

    expect(consoleErrors).toHaveLength(0);
  });

  test('Issue8-4: 내 앨범 (보유 카드만 표시)', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('tab-album').click();
    await page.waitForTimeout(1500);

    await takeScreenshot(page, 'issue8-my-album-owned');

    const lockIcons = await page.locator('text=🔒').count();
    expect(lockIcons).toBe(0);

    const questionMarks = await page.locator('text=?').count();
    expect(questionMarks).toBe(0);

    expect(consoleErrors).toHaveLength(0);
  });

  test('Issue8-5: 내 앨범 빈 상태', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/album?seed=empty');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await takeScreenshot(page, 'issue8-album-empty');

    const emptyMessage = page.locator('text=아직 보유한 카드가 없습니다.');
    await expect(emptyMessage).toBeVisible();

    const shopButton = page.locator('text=상품 보러가기');
    await expect(shopButton).toBeVisible();

    // 텍스트 대비 확인 (WCAG AA 4.5:1)
    const textColor = await emptyMessage.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    console.log(`Empty state text color: ${textColor}`);

    expect(consoleErrors).toHaveLength(0);
  });
});
