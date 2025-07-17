const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  globalSetup: require.resolve('./tests/e2e/global-setup.js'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.js'),
  reporter: [['html'], ['junit', { outputFile: 'test-results/junit.xml' }]],
  timeout: 240_000,
  outputDir: 'test-results',
  // Force video directory
  videoDir: 'test-results/videos',
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3000',
    testEmailDomain: process.env.TEST_EMAIL_DOMAIN || 'yahoogroups.com',
    viewport: { width: 1920, height: 1080 },
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'on',
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
        video: 'on',
      },
    },
  ],
})
