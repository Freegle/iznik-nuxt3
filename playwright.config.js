const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['html'], ['junit', { outputFile: 'test-results/junit.xml' }]],
  timeout: 240_000,
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3000',
    testEmailDomain: process.env.TEST_EMAIL_DOMAIN || 'yahoogroups.com',
    viewport: { width: 1920, height: 1080 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retry-with-video',
  },

  env: {
    SENTRY_DSN: '',
    SENTRY_ENABLE_DEBUG: 'false',
    SENTRY_TRACES_SAMPLE_RATE: '0',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
})
