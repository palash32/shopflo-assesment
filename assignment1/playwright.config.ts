import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if test.only is accidentally committed */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Use 4 workers on CI, auto-detect locally */
  workers: process.env.CI ? 4 : undefined,

  /* Reporter config — HTML + list + JSON for CI artifacts */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: 'https://www.saucedemo.com',

    /* Capture trace on first retry for debugging */
    trace: 'on-first-retry',

    /* Screenshot and video only on failure */
    screenshot: 'only-on-failure',
    video: 'on-first-retry',

    /* Standard viewport */
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    /* Uncomment for full cross-browser on CI */
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  /* Global timeout per test */
  timeout: 30_000,
  expect: { timeout: 8_000 },
});
