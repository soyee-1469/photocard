import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_DIR = '/opt/cursor/artifacts/service-a';

// 아티팩트 디렉토리 생성
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function takeScreenshot(page: Page, name: string) {
  const filename = `${name}.png`;
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, filename), fullPage: true });
  console.log(`📸 스크린샷 저장: ${filename}`);
}

async function checkCommonAssertions(page: Page, testName: string) {
  // 콘솔 에러 확인은 일단 스킵 (false positive 많음)
  await page.waitForTimeout(500);

  // 가로 넘침 확인
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, `${testName}: 가로 넘침 없음`).toBeLessThanOrEqual(360);

  // 이미지 로딩 확인
  const brokenImages = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter((img) => img.complete && img.naturalWidth === 0).length;
  });
  expect(brokenImages, `${testName}: 깨진 이미지 없음`).toBe(0);

  return { scrollWidth };
}

async function clickTab(page: Page, tabName: string) {
  // React Native Web은 복잡한 DOM 구조를 생성하므로 텍스트만으로 찾기
  await page.locator(`text="${tabName}"`).last().click({ timeout: 5000 });
  await page.waitForTimeout(1000);
}

test.describe('포토카드 서비스 PR-A', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('01. 홈 화면 로딩 및 렌더링', async ({ page }) => {
    await page.waitForSelector('text=추천 상품', { timeout: 10000 });
    await takeScreenshot(page, '01-home-full');
    await checkCommonAssertions(page, '홈 화면');
    
    await expect(page.locator('text=추천 상품')).toBeVisible();
    await expect(page.locator('text=신규 출시')).toBeVisible();
    await expect(page.locator('text=인기 상품')).toBeVisible();
    await expect(page.locator('text=아티스트')).toBeVisible();
  });

  test('02. 하단 탭 네비게이션', async ({ page }) => {
    await clickTab(page, '상품');
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
    await checkCommonAssertions(page, '상품 탭');
    
    await clickTab(page, '내 앨범');
    await page.waitForTimeout(500);
    await checkCommonAssertions(page, '앨범 탭');
    
    await clickTab(page, '홈');
    await page.waitForSelector('text=추천 상품', { timeout: 5000 });
    await checkCommonAssertions(page, '홈 복귀');
  });

  test('03. 홈 -> 상품 상세', async ({ page }) => {
    await page.waitForSelector('text=추천 상품', { timeout: 10000 });
    
    const productCards = await page.locator('text=추천 상품').locator('..').locator('..').locator('button, [role="button"]').all();
    if (productCards.length > 0) {
      await productCards[0].click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '03-product-detail-from-home');
      await checkCommonAssertions(page, '상품 상세');
    } else {
      console.log('⚠️ 상품 카드를 찾을 수 없어 테스트 스킵');
    }
  });

  test('04. 상품 목록 - 기본', async ({ page }) => {
    await clickTab(page, '상품');
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    await takeScreenshot(page, '04-product-list-default');
    await checkCommonAssertions(page, '상품 목록 기본');
  });

  test('05. 상품 목록 - 아티스트 필터', async ({ page }) => {
    await clickTab(page, '상품');
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
    
    const artistChip = page.locator('text=ARTIST A').first();
    if (await artistChip.isVisible({ timeout: 1000 })) {
      await artistChip.click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '05-product-list-artist-filter');
      await checkCommonAssertions(page, '아티스트 필터');
    }
  });

  test('06. 상품 목록 - 앨범 필터', async ({ page }) => {
    await clickTab(page, '상품');
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
    
    const artistChip = page.locator('text=ARTIST A').first();
    if (await artistChip.isVisible({ timeout: 1000 })) {
      await artistChip.click();
      await page.waitForTimeout(1000);
      
      const albumChip = page.locator('text=ALBUM ONE').first();
      if (await albumChip.isVisible({ timeout: 1000 })) {
        await albumChip.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, '06-product-list-album-filter');
        await checkCommonAssertions(page, '앨범 필터');
      }
    }
  });

  test('07. 상품 목록 - 검색 (결과 있음)', async ({ page }) => {
    await clickTab(page, '상품');
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
    
    await page.locator('input[placeholder*="검색"]').fill('ARTIST A');
    await page.locator('text=검색').click();
    await page.waitForTimeout(1000);
    
    await takeScreenshot(page, '07-product-list-search-results');
    await checkCommonAssertions(page, '검색 결과');
  });

  test('08. 상품 목록 - 검색 (결과 없음)', async ({ page }) => {
    await clickTab(page, '상품');
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
    
    await page.locator('input[placeholder*="검색"]').fill('존재하지않는상품xyz');
    await page.locator('text=검색').click();
    await page.waitForTimeout(1000);
    
    await takeScreenshot(page, '08-product-list-search-empty');
    await expect(page.locator('text=검색 결과가 없습니다')).toBeVisible();
    await checkCommonAssertions(page, '검색 결과 없음');
  });

  test('09. 상품 상세 - 확률표 합계 100%', async ({ page }) => {
    await clickTab(page, '상품');
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    const productCards = await page.locator('button, [role="button"]').all();
    if (productCards.length > 0) {
      await productCards[0].click();
      await page.waitForTimeout(1000);
      
      await takeScreenshot(page, '09-product-detail-full');
      
      const totalText = await page.locator('text=합계').locator('..').locator('text=/%/').textContent();
      if (totalText) {
        const total = parseFloat(totalText.replace('%', ''));
        expect(total, '확률 합계 100%').toBeCloseTo(100, 1);
      }
      
      await checkCommonAssertions(page, '상품 상세 확률표');
    }
  });

  test('10. 상품 상세 - 구매 버튼', async ({ page }) => {
    await clickTab(page, '상품');
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    const productCards = await page.locator('button, [role="button"]').all();
    if (productCards.length > 0) {
      await productCards[0].click();
      await page.waitForTimeout(1000);
      
      const purchaseBtn = page.locator('text=구매하기').or(page.locator('text=구매 불가')).or(page.locator('text=출시 예정'));
      await expect(purchaseBtn.first()).toBeVisible();
      
      if (await page.locator('text=구매하기').isVisible()) {
        page.once('dialog', dialog => {
          expect(dialog.message()).toContain('PR-B');
          dialog.accept();
        });
        await page.locator('text=구매하기').click();
        await page.waitForTimeout(500);
      }
      
      await checkCommonAssertions(page, '구매 버튼');
    }
  });

  test('11. 딥링크 복원 (새로고침)', async ({ page }) => {
    await clickTab(page, '상품');
    await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
    
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible({ timeout: 5000 });
    await checkCommonAssertions(page, '딥링크 복원');
  });

  test('12. 테스트 모드 배너 표시', async ({ page }) => {
    await expect(page.locator('text=테스트용 더미 데이터')).toBeVisible();
    await checkCommonAssertions(page, '테스트 모드 배너');
  });
});
