const fs = require('fs')
const path = require('path')
const { defineConfig, devices } = require('@playwright/test')
const { timeouts } = require('./tests/e2e/config')

// Check if we have an ordered test list
const orderedTestsFile = path.join(__dirname, 'tests/e2e/ordered-tests.txt')
let testMatch

if (fs.existsSync(orderedTestsFile)) {
  try {
    const orderedTests = fs
      .readFileSync(orderedTestsFile, 'utf8')
      .split('\n')
      .filter((line) => line.trim())
      .map((testPath) => path.basename(testPath))
    if (orderedTests.length > 0) {
      testMatch = orderedTests
      console.log(
        `Using ordered test execution: ${orderedTests.length} tests, prioritizing previously failed tests`
      )
    }
  } catch (error) {
    console.warn('Could not load ordered test list:', error.message)
  }
}

module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 11, // Parallel workers - testing 11 to improve CI performance
  maxFailures: 0,
  reporter: [
    ['list'],
    ['html', { open: 'always', host: '0.0.0.0' }],
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
                  // Only include source files from our application, not polyfills or virtual files
                  return (
                    // Include files that look like our source code
                    (sourcePath.includes('.vue') ||
                      sourcePath.includes('/pages/') ||
                      sourcePath.includes('/components/') ||
                      sourcePath.includes('/layouts/') ||
                      sourcePath.includes('/composables/') ||
                      sourcePath.includes('/stores/') ||
                      sourcePath.startsWith('app.vue') ||
                      sourcePath.startsWith('error.vue')) &&
                    // Exclude problematic paths
                    !sourcePath.includes('node_modules/') &&
                    !sourcePath.includes('data:') &&
                    !sourcePath.includes('blob:') &&
                    sourcePath.length < 300
                  )
                },
                // sourcePathMap not needed since paths are already relative to the correct directory
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
    baseURL: process.env.TEST_BASE_URL || 'http://freegle-prod-local.localhost',
    testEmailDomain: process.env.TEST_EMAIL_DOMAIN || 'yahoogroups.com',
    // viewport set at test level for better control
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // Video recording configuration
    contextOptions: {
      recordVideo: {
        dir: 'test-results',
        size: { width: 1280, height: 720 },
      },
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
        deviceScaleFactor: undefined, // Remove device scale factor when viewport is null
        video: 'on-first-retry',
        // Use Playwright's downloaded Chromium browser with security flags for Docker
        launchOptions: {
          headless: true, // Run in headless mode for CI/Docker environments
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
