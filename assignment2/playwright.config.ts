import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  webServer: {
    command: 'node mock-server.js',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    /* Base URL for local mock server */
    baseURL: 'http://localhost:3000',

    /* API requests get JSON content-type by default */
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
  },

  /* API tests typically don't need a browser timeout this long */
  timeout: 20_000,
  expect: { timeout: 5_000 },
});
