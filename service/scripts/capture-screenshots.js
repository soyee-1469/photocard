const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = '/opt/cursor/artifacts/service-a';
const BASE_URL = 'https://soyee-1469.github.io/photocard/service/pr-7/';

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  console.log('📸 스크린샷 캡처 시작...\n');

  // 1. 홈
  console.log('1. 홈 화면');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'r2-home.png') });

  // 2. 상품 목록
  console.log('2. 상품 목록');
  await page.getByTestId('tab-products').first().click();
  await page.waitForSelector('input[placeholder*="검색"]', { timeout: 5000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'r2-products.png') });

  // 3. 상품 상세
  console.log('3. 상품 상세');
  await page.goto(BASE_URL + 'products/prod-01');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'r2-product-detail.png') });

  // 4. 내 앨범 (보유)
  console.log('4. 내 앨범 (보유)');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.getByTestId('tab-album').first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'r2-album-owned.png') });

  // 5. 내 앨범 (빈 상태)
  console.log('5. 내 앨범 (빈 상태)');
  await page.goto(BASE_URL + '?seed=empty');
  await page.waitForLoadState('networkidle');
  await page.getByTestId('tab-album').first().click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'r2-album-empty.png') });

  // 6. 딥링크 새로고침
  console.log('6. 딥링크 새로고침 (/products/prod-06)');
  await page.goto(BASE_URL + 'products/prod-06');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'r2-deeplink-refresh.png') });

  await browser.close();

  console.log('\n✅ 모든 스크린샷 캡처 완료!');
  console.log(`저장 위치: ${ARTIFACTS_DIR}`);

  // 파일 크기 확인
  console.log('\n📊 파일 크기:');
  const files = ['r2-home.png', 'r2-products.png', 'r2-product-detail.png', 'r2-album-owned.png', 'r2-album-empty.png', 'r2-deeplink-refresh.png'];
  for (const file of files) {
    const filepath = path.join(ARTIFACTS_DIR, file);
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      const status = stats.size > 10240 ? '✅' : '⚠️';
      console.log(`  ${status} ${file}: ${sizeKB} KB`);
    } else {
      console.log(`  ❌ ${file}: 파일 없음`);
    }
  }
}

captureScreenshots().catch(console.error);
