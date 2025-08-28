const { defineConfig, devices } = require('@playwright/test')
const { timeouts } = require('./tests/e2e/config')

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  maxFailures: 1,
  reporter: [
    ['list'],
    ['html', { port: 9327, host: '0.0.0.0' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    // Only include monocart reporter when explicitly enabled via env var
    ...(process.env.ENABLE_MONOCART_REPORTER === 'true'
      ? [
          [
            'monocart-reporter',
            {
              name: 'Playwright Code Coverage Report',
              reportDir: 'monocart-report',
              json: true,
              // Disable auto-opening of reports to prevent hanging
              open: 'never',
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
        ]
      : []),
  ],
  timeout: 600_000,
  outputDir: 'test-results',
  // Force video directory
  videoDir: 'test-results/videos',
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://freegle.localhost',
    testEmailDomain: process.env.TEST_EMAIL_DOMAIN || 'yahoogroups.com',
    // viewport set at test level for better control
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'on',
    // Video recording configuration
    contextOptions: {
      recordVideo: {
        dir: 'test-results',
        size: { width: 1280, height: 720 }
      }
    },
    // Docker-friendly navigation settings
    navigationTimeout: timeouts.navigation.default,
    actionTimeout: timeouts.api.default,
    // Increase expect timeout for Docker environment data loading
    expect: {
      timeout: timeouts.api.slowApi,
    },
  },

  // Use existing Docker server instead of starting our own
  webServer: undefined,

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
        viewport: null, // Remove viewport constraints to use full screen
        video: 'on',
        // Use Playwright's downloaded Chromium browser with security flags for Docker
        launchOptions: {
          args: [
            '--start-maximized', // Maximize browser window
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-features=VizDisplayCompositor',
            '--disable-ipc-flooding-protection',
            '--ignore-certificate-errors',
            '--allow-insecure-localhost',
            '--disable-extensions',
            '--disable-plugins',
          ],
        },
        contextOptions: {
          // Disable background sync and other features that might prevent network idle
          reducedMotion: 'reduce',
        },
      },
    },
  ],
})
