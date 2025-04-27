// @ts-check
const { defineConfig, devices } = require('@playwright/test')

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retry tests once when they fail, even in development
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: 'html',
  timeout: 60_000,
  use: {
    // Allow overriding the base URL via TEST_BASE_URL environment variable
    // Default to the development server if not specified
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3002',
    // Capture trace on retry (and first failure)
    trace: 'on-first-retry',
    // Always capture screenshots on failure
    screenshot: 'only-on-failure',
    // Capture video only when retrying
    video: 'on-first-retry',
  },
  projects: [
    // Start with just Chromium to make it easier to run tests
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /* Uncomment these for more comprehensive testing
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    */
  ],
})
