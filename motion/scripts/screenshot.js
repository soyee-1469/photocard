const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/local/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Navigate to Remotion Studio
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait a bit for rendering
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: '../out/remotion-studio-screenshot.png', fullPage: false });
  
  await browser.close();
  console.log('Screenshot saved to out/remotion-studio-screenshot.png');
})();
