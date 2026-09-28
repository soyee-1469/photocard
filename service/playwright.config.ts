import { defineConfig, devices } from '@playwright/test';

const BASE_PATH = '/photocard/service/pr-7';
const IS_CI = !!process.env.CI;
const BASE_URL = process.env.BASE_URL || `http://localhost:8765${BASE_PATH}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: IS_CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'mobile',
      use: {
        viewport: { width: 360, height: 740 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
      },
    },
  ],

  webServer: IS_CI ? undefined : {
    command: 'node scripts/test-server.js',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
