const { chromium } = require('playwright');

const BASE_URL = 'https://soyee-1469.github.io/photocard/service/pr-7/';

async function testDeepLinks() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
  });
  const page = await context.newPage();

  console.log('딥링크 및 새로고침 테스트\n');

  const urls = [
    { path: 'products', name: '상품 목록' },
    { path: 'products/prod-06', name: '상품 상세 (prod-06)' },
    { path: 'album', name: '내 앨범' },
  ];

  for (const { path, name } of urls) {
    const url = BASE_URL + path;
    console.log(`테스트: ${name}`);
    console.log(`URL: ${url}`);

    try {
      await page.goto(url);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.waitForTimeout(1000);

      const title = await page.title();
      const hasApp = await page.locator('#root').count() > 0;

      console.log(`  상태: ✅`);
      console.log(`  제목: ${title}`);
      console.log(`  앱 렌더: ${hasApp ? '✅' : '❌'}`);

      // 새로고침 테스트
      await page.reload();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.waitForTimeout(1000);

      const hasAppAfterReload = await page.locator('#root').count() > 0;
      console.log(`  새로고침 후: ${hasAppAfterReload ? '✅' : '❌'}`);
    } catch (err) {
      console.log(`  상태: ❌ ${err.message}`);
    }
    console.log('');
  }

  await browser.close();
}

testDeepLinks().catch(console.error);
