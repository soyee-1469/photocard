import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/binder';

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function takeScreenshot(page: Page, name: string) {
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const images = Array.from(document.querySelectorAll('img'));
      let loadedCount = 0;
      const totalImages = images.length;

      if (totalImages === 0) {
        resolve();
        return;
      }

      images.forEach((img) => {
        if (img.complete) {
          loadedCount++;
          if (loadedCount === totalImages) resolve();
        } else {
          img.addEventListener('load', () => {
            loadedCount++;
            if (loadedCount === totalImages) resolve();
          });
        }
      });
    });
  });

  await page.waitForTimeout(500);

  const filename = `${name}.png`;
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, filename), fullPage: false });
  console.log(`📸 스크린샷 저장: ${filename}`);
}

test.describe('바인더 검증', () => {
  test.use({
    viewport: { width: 360, height: 740 },
    hasTouch: true,
  });

  test('바인더-1: 앨범 홈 (A)', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('tab-album').first().click();
    await page.waitForTimeout(1500);

    await takeScreenshot(page, 'A-home');

    await expect(page.locator('text=보유 카드 14장')).toBeVisible();
    await expect(page.locator('text=앨범 열기')).toBeVisible();

    const lockIcons = await page.locator('text=🔒').count();
    expect(lockIcons).toBe(0);

    const questionMarks = await page.locator('text=?').count();
    expect(questionMarks).toBe(0);

    expect(consoleErrors).toHaveLength(0);
  });

  test('바인더-2: 앨범 빈 상태 (A-empty)', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/album?seed=empty');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await takeScreenshot(page, 'A-empty');

    await expect(page.locator('text=보유 카드 0장')).toBeVisible();
    await expect(page.locator('text=아직 보유한 카드가 없습니다.')).toBeVisible();

    expect(consoleErrors).toHaveLength(0);
  });

  test('바인더-3: 바인더 페이지 1 (B)', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByTestId('tab-album').first().click();
    await page.waitForTimeout(1500);

    await page.locator('text=앨범 열기').click();
    await page.waitForTimeout(1500);

    await takeScreenshot(page, 'B-page1');

    await expect(page.locator('text=1 / 3')).toBeVisible();

    const emptyPockets = await page.locator('[data-testid="pocket-empty"]').count();
    expect(emptyPockets).toBe(0);

    expect(consoleErrors).toHaveLength(0);
  });

  test('바인더-4: 페이지 3 빈 칸 (B-page3-empty-slots)', async ({ page }) => {
    await page.goto('/album/binder?page=3');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await takeScreenshot(page, 'B-page3-empty-slots');

    await expect(page.locator('text=3 / 3')).toBeVisible();

    const emptyPockets = await page.locator('[data-testid="pocket-empty"]').count();
    expect(emptyPockets).toBe(2);
  });

  test('바인더-5: 아티스트 필터 (B-filter-artist)', async ({ page }) => {
    await page.goto('/album/binder?page=1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.locator('text=ARTIST A').first().click();
    await page.waitForTimeout(1000);

    await takeScreenshot(page, 'B-filter-artist');

    await expect(page.locator('text=1 / 2')).toBeVisible();
  });

  test('바인더-6: 필터 결과 없음 (B-filter-none)', async ({ page }) => {
    await page.goto('/album/binder?artist=artist-b&rarity=legend');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await takeScreenshot(page, 'B-filter-none');

    await expect(page.locator('text=조건에 맞는 카드가 없어요')).toBeVisible();
  });

  test('바인더-7: 카드 상세 앞면 (C-front)', async ({ page }) => {
    await page.goto('/album/binder?page=1&card=prod-01-card-1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await takeScreenshot(page, 'C-front');

    await expect(page.locator('[data-testid="card-face-front"]')).toBeVisible();
    await expect(page.locator('text=보유 수량')).toBeVisible();
  });

  test('바인더-8: 카드 플립 뒷면 (C-back)', async ({ page }) => {
    await page.goto('/album/binder?page=1&card=prod-01-card-1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await page.locator('[data-testid="card-face-front"]').click();
    await page.waitForTimeout(500);

    await takeScreenshot(page, 'C-back');

    await expect(page.locator('[data-testid="card-face-back"]')).toBeVisible();
  });

  test('바인더-9: 중복 ×3 (C-dup-x3)', async ({ page }) => {
    await page.goto('/album/binder?page=1&card=prod-01-card-1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await takeScreenshot(page, 'C-dup-x3');

    await expect(page.locator('text=×3')).toBeVisible();
  });

  test('바인더-10: 공급 종료 (C-discontinued)', async ({ page }) => {
    await page.goto('/album/binder?page=2&card=prod-08-card-13');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await takeScreenshot(page, 'C-discontinued');

    await expect(page.locator('text=공급 종료')).toBeVisible();
  });

  test('바인더-11: 상세 닫기 후 페이지 2 (B-after-close-page2)', async ({ page }) => {
    await page.goto('/album/binder?page=2&card=prod-03-card-7');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await page.locator('text=닫기').click();
    await page.waitForTimeout(500);

    await takeScreenshot(page, 'B-after-close-page2');

    await expect(page.locator('text=2 / 3')).toBeVisible();
  });
});
