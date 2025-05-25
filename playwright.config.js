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
  reporter: [['html'], ['junit', { outputFile: 'test-results/junit.xml' }]],
  // Increase timeout for CircleCI environment which can be slower
  timeout: 240_000, // 4 minutes global timeout
  use: {
    // Allow overriding the base URL via TEST_BASE_URL environment variable
    // Default to the development server if not specified
    // For WSL: Set TEST_BASE_URL=http://[WINDOWS_HOST_IP]:3002 where WINDOWS_HOST_IP is your Windows machine's IP
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3002',

    // Test email domain for fake email addresses
    testEmailDomain: process.env.TEST_EMAIL_DOMAIN || 'yahoogroups.com',

    // Default viewport size - full HD (1920x1080)
    viewport: { width: 1920, height: 1080 },

    // Capture trace on retry (and first failure)
    trace: 'on-first-retry',
    // Always capture screenshots on failure
    screenshot: 'only-on-failure',
    // Capture video only when retrying
    video: 'retry-with-video',
  },

  // Set environment variables for the tests
  // Disable Sentry during tests to avoid unnecessary error reporting
  env: {
    SENTRY_DSN: '', // Empty string to disable Sentry
    SENTRY_ENABLE_DEBUG: 'false',
    SENTRY_TRACES_SAMPLE_RATE: '0', // Don't sample any traces
  },

  // Note: webServer configuration removed per user request
  // In local development, assume dev server is already running on 127.0.0.1:3002
  // In CI, the server is managed manually to test against the production build
  projects: [
    // Start with just Chromium to make it easier to run tests
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Override the viewport size to ensure it's 1920x1080
        viewport: { width: 1920, height: 1080 },
      },
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
