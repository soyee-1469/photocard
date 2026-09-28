import { test, expect, Page } from '@playwright/test';

test.describe('포토카드 서비스 PR-A', () => {
  test('01. 홈 화면 로딩', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=추천 상품')).toBeVisible({ timeout: 10000 });
  });

  test('02. 상품 탭 네비게이션', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('tab-products').click();
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
  });

  test('03. 앨범 탭 네비게이션', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('tab-album').click();
    await page.waitForTimeout(1000);
  });

  test('04. 상품 상세 이동', async ({ page }) => {
    await page.goto('/products/prod-01');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=등급별 획득 확률')).toBeVisible();
  });

  test('05. 딥링크 새로고침', async ({ page }) => {
    await page.goto('/products/prod-01');
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=등급별 획득 확률')).toBeVisible();
  });
});
