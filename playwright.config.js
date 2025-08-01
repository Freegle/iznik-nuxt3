const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    [
      'monocart-reporter',
      {
        name: 'Playwright Code Coverage Report',
        reportDir: 'monocart-report',
        json: true,
        coverage: {
          reports: ['v8', 'lcov', 'lcovonly'],
          lcov: true,
          outputDir: 'coverage',
          entryFilter: (entry) => {
            // Filter out entries from external domains and problematic URLs
            if (entry.url) {
              return (
                !entry.url.includes('accounts.google.com') &&
                !entry.url.includes('googleapis.com') &&
                !entry.url.includes('gstatic.com') &&
                !entry.url.startsWith('data:') &&
                !entry.url.startsWith('blob:') &&
                entry.url.length < 300
              )
            }
            return true
          },
          sourceFilter: (sourcePath) => {
            // Exclude node_modules and external URLs that cause filename issues
            return (
              !sourcePath.includes('node_modules/') &&
              !sourcePath.includes('http://') &&
              !sourcePath.includes('https://') &&
              !sourcePath.includes('accounts.google.com') &&
              !sourcePath.includes('googleapis.com') &&
              !sourcePath.includes('gstatic.com') &&
              !sourcePath.includes('data:') &&
              !sourcePath.includes('blob:') &&
              // Only include files with reasonable path lengths
              sourcePath.length < 200
            )
          },
        },
      },
    ],
  ],
  timeout: 600_000,
  outputDir: 'test-results',
  // Force video directory
  videoDir: 'test-results/videos',
  use: {
    baseURL: 'http://127.0.0.1:3000',
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
