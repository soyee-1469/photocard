const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ARTIFACTS_DIR = '/opt/cursor/artifacts/service-a';
const BASE_URL = 'https://soyee-1469.github.io/photocard/service/pr-7/';

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

function getFileHash(filepath) {
  if (!fs.existsSync(filepath)) return null;
  const content = fs.readFileSync(filepath);
  return crypto.createHash('sha256').update(content).digest('hex');
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

  console.log('📸 r3 스크린샷 캡처 시작...\n');

  // 1. 내 앨범 (보유)
  console.log('1. 내 앨범 (보유)');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.getByRole('tab', { name: '🎴 🃏 내 앨범' }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'r3-album-owned.png') });

  // 2. 내 앨범 (빈 상태)
  console.log('2. 내 앨범 (빈 상태)');
  await page.goto(BASE_URL + 'album?seed=empty');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'r3-album-empty.png') });

  // 3. 홈 내 카드 미리보기 (스크롤하여 섹션이 보이게)
  console.log('3. 홈 내 카드 미리보기');
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // 내 카드 미리보기 섹션으로 스크롤
  const myCardsSection = page.locator('text=내 카드 미리보기');
  if (await myCardsSection.isVisible()) {
    await myCardsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'r3-home-mycards.png') });

  await browser.close();

  console.log('\n✅ 모든 스크린샷 캡처 완료!');
  console.log(`저장 위치: ${ARTIFACTS_DIR}`);

  // 파일 크기 및 해시 확인
  console.log('\n📊 파일 검증:');
  const files = ['r3-album-owned.png', 'r3-album-empty.png', 'r3-home-mycards.png'];
  const hashes = {};

  for (const file of files) {
    const filepath = path.join(ARTIFACTS_DIR, file);
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      const hash = getFileHash(filepath);
      hashes[file] = hash.substring(0, 12);

      const status = stats.size > 10240 ? '✅' : '⚠️';
      console.log(`  ${status} ${file}: ${sizeKB} KB (${hashes[file]}...)`);
    } else {
      console.log(`  ❌ ${file}: 파일 없음`);
    }
  }

  // 해시 중복 확인
  console.log('\n🔍 중복 확인:');
  const hashValues = Object.values(hashes);
  const uniqueHashes = new Set(hashValues);
  if (hashValues.length === uniqueHashes.size) {
    console.log('  ✅ 모든 스크린샷이 서로 다릅니다');
  } else {
    console.log('  ⚠️ 일부 스크린샷이 중복될 수 있습니다');
  }
}

captureScreenshots().catch(console.error);
