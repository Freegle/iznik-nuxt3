const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const base = require('@playwright/test')
const { addCoverageReport } = require('monocart-reporter')
const {
  SCREENSHOTS_DIR,
  timeouts,
  environment,
  DEFAULT_TEST_PASSWORD,
} = require('./config')
const logger = require('./logger')

const NUXT_TEST_UTILS_AVAILABLE = (() => {
  try {
    require.resolve('@nuxt/test-utils/e2e')
    return true
  } catch {
    return false
  }
})()

if (NUXT_TEST_UTILS_AVAILABLE) {
  console.log(
    '@nuxt/test-utils is available and can be used for enhanced testing'
  )
}

// Ensure the screenshots directory exists
const ensureScreenshotsDir = () => {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    try {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
      console.log(`Created screenshots directory: ${SCREENSHOTS_DIR}`)
    } catch (error) {
      console.error(`Failed to create screenshots directory: ${error.message}`)
    }
  }
  return SCREENSHOTS_DIR
}

// Get a path for a screenshot file
const getScreenshotPath = (filename) => {
  ensureScreenshotsDir()
  return path.join(SCREENSHOTS_DIR, filename)
}

// Function to remove screenshot files from the screenshots directory
const cleanupScreenshots = async () => {
  ensureScreenshotsDir()

  try {
    // Read directory contents using promises
    const files = await fs.promises.readdir(SCREENSHOTS_DIR)

    if (files.length === 0) {
      return
    }

    // Filter for PNG files only
    const pngFiles = files.filter((file) => path.extname(file) === '.png')

    if (pngFiles.length === 0) {
      return
    }

    // Delete all PNG files with Promise.all for better parallelism
    const deletePromises = pngFiles.map((file) => {
      const filePath = path.join(SCREENSHOTS_DIR, file)
      return fs.promises
        .unlink(filePath)
        .catch((err) =>
          console.error(`Error deleting screenshot ${file}:`, err)
        )
    })

    // Wait for all deletions to complete
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises)
    }
  } catch (err) {
    console.error('Error during screenshots cleanup:', err)
  }
}

// Store all generated test emails for later cleanup
const testEmailRegistry = new Set()

// File path for storing test emails
const TEST_EMAILS_LOG_FILE = path.join(process.cwd(), 'test-emails.json')

// Save all test emails to a file
const saveTestEmails = () => {
  try {
    const emails = Array.from(testEmailRegistry)
    if (emails.length > 0) {
      fs.writeFileSync(
        TEST_EMAILS_LOG_FILE,
        JSON.stringify({ emails, timestamp: new Date().toISOString() }, null, 2)
      )
      console.log(
        `Saved ${emails.length} test emails to ${TEST_EMAILS_LOG_FILE}`
      )
    }
  } catch (error) {
    console.error(`Failed to save test emails: ${error.message}`)
  }
}

// Load previously saved test emails
const loadTestEmails = () => {
  try {
    if (fs.existsSync(TEST_EMAILS_LOG_FILE)) {
      const data = JSON.parse(fs.readFileSync(TEST_EMAILS_LOG_FILE, 'utf-8'))
      if (data.emails && Array.isArray(data.emails)) {
        data.emails.forEach((email) => testEmailRegistry.add(email))
        console.log(
          `Loaded ${data.emails.length} test emails from previous runs`
        )
      }
    }
  } catch (error) {
    console.error(`Failed to load test emails: ${error.message}`)
  }
}

// Load existing emails at startup
loadTestEmails()

// Generate a globally unique, date-time stamped test email
const generateUniqueTestEmail = (prefix = 'test') => {
  // Format: prefix-YYYYMMDD-HHMMSS-randomhash@domain
  const now = new Date()
  const datePart = now
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 14) // YYYYMMDDHHmmSS format

  // Add a random hash for global uniqueness (8 characters should be plenty)
  const randomHash = crypto.randomBytes(4).toString('hex')

  const email = `${prefix}-${datePart}-${randomHash}@${environment.email.domain}`

  // Register this email for later cleanup
  testEmailRegistry.add(email)

  return email
}

// Define a custom test function that wraps the base test to add automatic screenshot capture
const test = base.test.extend({
  // Create a new isolated context for each test
  context: async ({ browser }, use) => {
    // Create a fresh context for this test
    const context = await browser.newContext({
      ignoreHTTPSErrors: true, // Useful for local dev environments
      acceptDownloads: true,
      viewport: { width: 1280, height: 720 },
    })

    console.log(`Created new isolated browser context for test`)

    // Use the context in the test
    await use(context)

    // Clean up the context after the test
    await context.close()
    console.log(`Closed browser context after test`)
  },

  // Add the testEmail fixture - basic version that just generates a random test email
  testEmail: async ({ browser }, use) => {
    // Generate a unique test email for this test
    const email = generateUniqueTestEmail()
    console.log(`Using test email: ${email}`)

    // Provide the email to the test
    await use(email)
  },

  // Function to generate custom test emails with specific prefixes
  getTestEmail: async ({ browser }, use) => {
    // Return a function that generates test emails with custom prefixes
    const emailGenerator = (prefix = 'test') => generateUniqueTestEmail(prefix)
    await use(emailGenerator)
  },

  // Override the page fixture to use our isolated context
  page: async ({ context }, use) => {
    // Create a page in our isolated context
    const page = await context.newPage()
    console.log(`Created new page in isolated context`)

    // Enable coverage collection only in Chromium
    let coverageStarted = false
    if (context.browser().browserType().name() === 'chromium') {
      try {
        await Promise.all([
          page.coverage.startJSCoverage({
            resetOnNavigation: false,
          }),
          page.coverage.startCSSCoverage({
            resetOnNavigation: false,
          }),
        ])
        coverageStarted = true
        console.log('Coverage collection started')
      } catch (error) {
        console.warn('Failed to start coverage collection:', error.message)
      }
    }

    // Create a logging proxy for the page
    const loggingPage = logger.createLoggingPage(page)

    const consoleErrors = []
    const navigationEvents = []

    // Track console errors
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push({
          text: message.text(),
          location: message.location(),
        })
      }
    })

    // Track navigation events and setup navigation inactivity timeout
    let navigationInactivityTimer = null
    const MAX_NAVIGATION_INACTIVITY =
      timeouts.navigation.inactivity || 9 * 60 * 1000 // Default to 9 minutes in milliseconds

    // Create a function to reset the inactivity timer
    const resetNavigationInactivityTimer = () => {
      // Clear any existing timer
      if (navigationInactivityTimer) {
        clearTimeout(navigationInactivityTimer)
      }

      // Set a new timer
      navigationInactivityTimer = setTimeout(() => {
        const lastNavTimestamp =
          navigationEvents.length > 0
            ? new Date(navigationEvents[navigationEvents.length - 1].timestamp)
            : new Date(0)

        const inactivityDuration = Date.now() - lastNavTimestamp.getTime()

        console.error(`\n\n==== NAVIGATION INACTIVITY TIMEOUT ====`)
        console.error(
          `No navigation events detected for ${
            inactivityDuration / 1000
          } seconds (threshold: ${MAX_NAVIGATION_INACTIVITY / 1000} seconds)`
        )
        console.error(`Last navigation: ${lastNavTimestamp.toISOString()}`)
        console.error(`Current URL: ${page.url()}`)
        console.error(
          `==== TERMINATING TEST DUE TO NAVIGATION INACTIVITY ====\n\n`
        )

        // Take screenshot before failing
        page
          .screenshot({
            path: getScreenshotPath(`navigation-inactivity-${Date.now()}.png`),
            fullPage: true,
          })
          .catch((err) => console.error('Failed to capture screenshot:', err))

        // Force test to fail
        throw new Error(
          `Navigation inactivity timeout: No navigation events detected for ${
            inactivityDuration / 1000
          } seconds. Test execution may be stuck.`
        )
      }, MAX_NAVIGATION_INACTIVITY)
    }

    // Start the initial timer
    resetNavigationInactivityTimer()

    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        const isHardNavigation =
          !frame._loaderId || frame._loaderId !== frame._lastLoaderId
        const url = frame.url()
        const timestamp = new Date().toISOString()
        const navType = isHardNavigation ? 'HARD' : 'SOFT'

        navigationEvents.push({
          type: navType,
          url,
          timestamp,
        })

        console.log(`[${timestamp}] [NAVIGATION:${navType}] ${url}`)

        // Reset the inactivity timer whenever a navigation event occurs
        resetNavigationInactivityTimer()
      }
    })

    // Add method to manually reset navigation timer (useful for long operations)
    page.resetNavigationTimer = resetNavigationInactivityTimer

    // Methods to access console errors
    page.consoleErrors = () => consoleErrors

    // Methods to access navigation data
    page.navigationEvents = () => navigationEvents

    // Get navigation history as a formatted string for debugging
    page.getNavigationHistory = () => {
      if (navigationEvents.length === 0) {
        return 'No navigation events recorded'
      }

      return navigationEvents
        .map((event) => `[${event.timestamp}] [${event.type}] ${event.url}`)
        .join('\n')
    }

    // Get navigation summary with counts
    page.getNavigationSummary = () => {
      const hardNavigations = navigationEvents.filter(
        (event) => event.type === 'HARD'
      )
      const softNavigations = navigationEvents.filter(
        (event) => event.type === 'SOFT'
      )

      return {
        total: navigationEvents.length,
        hardCount: hardNavigations.length,
        softCount: softNavigations.length,
        hard: hardNavigations,
        soft: softNavigations,
        all: navigationEvents,
      }
    }

    // Method to get all console errors grouped by allowed vs non-allowed
    page.getErrorSummary = () => {
      const allowed = consoleErrors.filter((err) => isAllowedError(err.text))
      const notAllowed = consoleErrors.filter(
        (err) => !isAllowedError(err.text)
      )

      return {
        allowed,
        notAllowed,
        total: consoleErrors.length,
        allowedCount: allowed.length,
        notAllowedCount: notAllowed.length,
      }
    }

    // List of allowed console error patterns (using regex)
    const allowedErrorPatterns = [
      /API count went negative/, // Not visible to client and can happen during navigation.
      /%cssr:error%c Could not find one or more icon/, // Can legitimately happen in SSR.
      /Not signed in with the identity provider/, // Not available in test.
      /Provider's accounts list is empty/, // Google Pay related error - can happen in test.
      /The given origin is not allowed for the given client ID/, // Not available in test.
      /FedCM get\(\) rejects with/, // Not available in test
      /Hydration completed but contains mismatches/, // Not ideal, but not visible to user
      /ResizeObserver loop limit exceeded/, // Non-critical UI warning
      /The request has been aborted/, // Can happen during navigation.
      /Failed to load resource: the server responded with a status of 403/, // Ad or social sign-in related 403s are expected
      /Failed to load resource: the server responded with a status of 503/, // Server unavailable during startup
      /Failed to load resource: net::ERR_CONNECTION_REFUSED/, // Can happen when server is starting up
      /stripe.com/, // Stripe related errors are expected in test.
      /has been blocked by CORS policy/, // CORS errors can happen in test environments due to ads
      /Failed to save credentials NotSupportedError: The user agent does not support public key credentials./, // Can happen in test environments
      /Refused to frame/, // Can happen in test.
      /Failed to load resource.*sentry/, // Sentry errors can happen in test environments
    ]

    // Method to add additional allowed error patterns for specific tests
    page.addAllowedErrorPattern = (pattern) => {
      if (pattern instanceof RegExp) {
        allowedErrorPatterns.push(pattern)
      } else if (typeof pattern === 'string') {
        // If a string is provided, convert it to a RegExp that matches the exact string
        allowedErrorPatterns.push(
          new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        )
      } else {
        throw new TypeError('Error pattern must be a RegExp or string')
      }
    }

    // Helper to check if an error message matches any allowed pattern
    // console.log each pattern and the errorText, and whether or not it matched
    // This is useful for debugging
    const isAllowedError = (errorText) => {
      return allowedErrorPatterns.some((pattern) => {
        return pattern.test(errorText)
      })
    }

    page.checkTestRanOK = async () => {
      // Get error summary
      const { notAllowed, allowedCount, notAllowedCount, total } =
        page.getErrorSummary()

      // If there are relevant (non-allowed) errors, fail the test
      if (notAllowedCount > 0) {
        // Take a screenshot when console errors are found
        await page.screenshot({
          path: getScreenshotPath(`console-errors-${Date.now()}.png`),
          fullPage: true,
        })

        const errorDetails = notAllowed
          .map((err) => {
            const location = err.location
              ? `${err.location.url}:${err.location.lineNumber}`
              : 'unknown location'
            return `  • ${err.text} (at ${location})`
          })
          .join('\n')

        throw new Error(
          `Found ${notAllowedCount} console errors (${total} total, ${allowedCount} allowed):\n${errorDetails}`
        )
      }
    }

    // For backwards compatibility
    page.expectNoConsoleErrors = page.checkTestRanOK

    page.gotoAndVerify = async (path, options = {}) => {
      const timeout = options.timeout || timeouts.navigation.default

      try {
        console.log(`Navigating to ${path} with timeout ${timeout}ms`)

        // Navigate with timeout
        await page.goto(path, { timeout })

        // Wait for initial load
        await page.waitForLoadState('domcontentloaded', { timeout })

        // Wait for network to settle (helps with slow JavaScript loading)
        try {
          await page.waitForLoadState('networkidle', {
            timeout: Math.min(timeout, 30000),
          })
        } catch (networkError) {
          console.log(
            `Network didn't become idle within timeout, continuing anyway: ${networkError.message}`
          )
        }

        // Verify page content is visible
        const body = page.locator('body')
        await body.waitFor({
          state: 'visible',
          timeout: Math.min(timeout, 10000),
        })

        // Check if page contains error messages
        const errorTextContent = await page.textContent('body')

        // Check for general error message
        if (errorTextContent.includes('Something went wrong')) {
          // Take a screenshot of the error page
          await page.screenshot({
            path: getScreenshotPath(`error-page-${Date.now()}.png`),
            fullPage: true,
          })

          // Extract the "Error was" text if present
          let errorDetails = ''
          const errorWasMatch = errorTextContent.match(
            /Error was[:\s]*(.*?)(?=\n|$)/i
          )
          if (errorWasMatch) {
            errorDetails = ` - Error was: ${errorWasMatch[1].trim()}`
            console.log(`Error details extracted: ${errorWasMatch[1].trim()}`)
          }

          throw new Error(
            `Page loaded with 'Something went wrong' error message at ${path}${errorDetails}`
          )
        }

        // Check for 404 error message
        if (
          errorTextContent.includes("Oh no! That page doesn't seem to exist")
        ) {
          // Take a screenshot of the 404 page
          await page.screenshot({
            path: getScreenshotPath(`404-error-${Date.now()}.png`),
            fullPage: true,
          })
          throw new Error(
            `Page loaded with '404 page not found' error message at ${path}`
          )
        }
      } catch (error) {
        // Take a screenshot if navigation fails
        try {
          await page.screenshot({
            path: getScreenshotPath(`navigation-error-${Date.now()}.png`),
            fullPage: true,
          })
        } catch (screenshotError) {
          console.warn(
            `Could not take navigation error screenshot: ${screenshotError.message}`
          )
        }

        // Log current page state for debugging
        try {
          const currentUrl = page.url()
          const currentTitle = await page.title()
          console.log(
            `Navigation failed. Current URL: ${currentUrl}, Title: "${currentTitle}"`
          )
        } catch (debugError) {
          console.warn(
            `Could not get page state for debugging: ${debugError.message}`
          )
        }

        // Check if it's a connection refused error (dev server not running)
        if (error.message.includes('ERR_CONNECTION_REFUSED')) {
          throw new Error(
            `Cannot connect to dev server at ${path}. Make sure the dev server is running`
          )
        }

        // Re-throw with more context
        throw new Error(`Failed to navigate to ${path}: ${error.message}`)
      }

      return page
    }

    // Internal method to handle teardown with error handling
    const performTeardown = async (options = {}) => {
      const timeout = options.timeout || timeouts.teardown.networkIdle
      try {
        // Clear the navigation inactivity timer during teardown
        if (navigationInactivityTimer) {
          clearTimeout(navigationInactivityTimer)
          navigationInactivityTimer = null
          console.log('Navigation inactivity timer cleared during teardown')
        }

        // Clear browser storage before ending the test
        try {
          await page
            .evaluate(() => {
              try {
                // Check if localStorage is accessible before trying to clear it
                if (typeof Storage !== 'undefined' && window.localStorage) {
                  localStorage.clear()
                  console.log('LocalStorage cleared during teardown')
                }
              } catch (e) {
                console.warn('Could not clear localStorage:', e.message)
              }

              try {
                // Check if sessionStorage is accessible before trying to clear it
                if (typeof Storage !== 'undefined' && window.sessionStorage) {
                  sessionStorage.clear()
                  console.log('SessionStorage cleared during teardown')
                }
              } catch (e) {
                console.warn('Could not clear sessionStorage:', e.message)
              }

              // Safe IndexedDB cleanup
              if (window.indexedDB) {
                try {
                  // Add common database names that might be used in the application
                  // This approach is more reliable than indexedDB.databases() which is not widely supported
                  const possibleDBNames = [
                    'localforage',
                    'keyval-store',
                    'firebaseLocalStorageDb',
                    'iznik-db', // Add app-specific DB names
                    'app-state',
                    'user-data',
                  ]

                  for (const dbName of possibleDBNames) {
                    try {
                      console.log(`Attempting to delete IndexedDB: ${dbName}`)
                      indexedDB.deleteDatabase(dbName)
                    } catch (e) {
                      // Silent fail is acceptable for DB deletion attempts
                    }
                  }
                } catch (e) {
                  // Ignore IndexedDB errors during cleanup
                }
              }

              // Clear all cookies via JavaScript as an extra precaution
              try {
                if (document.cookie) {
                  const cookies = document.cookie.split(';')
                  cookies.forEach((cookie) => {
                    const name = cookie.split('=')[0].trim()
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
                  })
                  console.log('Cookies cleared during teardown')
                }
              } catch (e) {
                console.warn('Could not clear cookies:', e.message)
              }
            })
            .catch((e) => {
              // Only log if it's not a SecurityError about localStorage access
              if (
                !e.message.includes('localStorage') &&
                !e.message.includes('Access is denied')
              ) {
                console.warn(`Storage cleanup error: ${e.message}`)
              }
            })
        } catch (err) {
          // Log but continue if this fails
          console.warn(`Unable to clear page storage: ${err.message}`)
        }

        await page.waitForLoadState('networkidle', { timeout })
        return true
      } catch (error) {
        // Clear the navigation inactivity timer even if teardown fails
        if (navigationInactivityTimer) {
          clearTimeout(navigationInactivityTimer)
          navigationInactivityTimer = null
          console.log(
            'Navigation inactivity timer cleared during teardown (after error)'
          )
        }

        console.warn(`Teardown warning: ${error.message}`)
        // Take a screenshot if network doesn't become idle
        await page.screenshot({
          path: getScreenshotPath(`teardown-warning-${Date.now()}.png`),
        })
        return false
      }
    }

    // Public method for manual teardown invocation
    page.waitForTeardown = async (options = {}) => {
      return await performTeardown(options)
    }

    // Copy all custom methods from the original page to the logging page
    Object.keys(page).forEach((key) => {
      if (typeof page[key] === 'function' && !loggingPage[key]) {
        loggingPage[key] = page[key]
      }
    })

    // Override methods that need both the original page and logging functionality
    loggingPage.checkTestRanOK = page.checkTestRanOK
    loggingPage.expectNoConsoleErrors = page.expectNoConsoleErrors
    loggingPage.gotoAndVerify = page.gotoAndVerify
    loggingPage.waitForTeardown = page.waitForTeardown

    // Add configuration options for the logger
    console.log('Command logging enabled for Playwright tests')
    logger.configure({
      enabled: true,
      timestampFormat: 'simple',
      level: 'normal',
    })

    // Wrap the use() call in a try-catch block to add automatic screenshot capturing
    try {
      // Call use() with the logging page instead of the original page
      await use(loggingPage)

      // Clear navigation inactivity timer after test completes successfully
      if (navigationInactivityTimer) {
        clearTimeout(navigationInactivityTimer)
        navigationInactivityTimer = null
        console.log('Navigation inactivity timer cleared after successful test')
      }

      // Automatically check for console errors at the end of each test
      await loggingPage.checkTestRanOK()

      // Log navigation summary at the end of successful tests
      const navSummary = loggingPage.getNavigationSummary()
      console.log(
        `Navigation summary: ${navSummary.total} total (${navSummary.hardCount} hard, ${navSummary.softCount} soft)`
      )
    } catch (error) {
      // Clear navigation inactivity timer even if test fails
      if (navigationInactivityTimer) {
        clearTimeout(navigationInactivityTimer)
        navigationInactivityTimer = null
        console.log('Navigation inactivity timer cleared after test failure')
      }

      // Take a full page screenshot on any test failure
      const screenshotPath = getScreenshotPath(`test-failure-${Date.now()}.png`)
      await loggingPage.screenshot({ path: screenshotPath, fullPage: true })

      // Log the navigation history on failure for debugging
      console.log('Navigation history:')
      console.log(loggingPage.getNavigationHistory())

      // Log the error with screenshot info
      console.error(
        `Test failed: ${error.message}\nScreenshot saved to: ${screenshotPath}`
      )

      // Re-throw the error to fail the test
      throw error
    } finally {
      // Stop coverage collection and save results before teardown
      if (coverageStarted) {
        try {
          const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage(),
          ])

          // Combine coverage data
          const coverage = [...jsCoverage, ...cssCoverage]
          if (coverage.length > 0) {
            // Add coverage data to monocart-reporter using the proper API
            await addCoverageReport(coverage, test.info())
            console.log(`Collected ${coverage.length} coverage entries`)
          }
        } catch (error) {
          console.warn('Failed to collect coverage data:', error.message)
        }
      }

      // Always perform teardown operations, regardless of test success/failure
      await performTeardown()
    }
  },
})

// Add a global hook to cleanup screenshots after all tests, save email registry, and unsubscribe test emails
test.afterAll(async () => {
  // Save the test emails regardless of whether tests succeeded or failed
  saveTestEmails()

  // Only clean up if the tests succeeded
  if (process.exitCode === undefined || process.exitCode === 0) {
    await cleanupScreenshots()

    // Attempt to unsubscribe all the test emails
    console.log('Skipping test email unsubscription for now due to port issues')
    // try {
    //   await unsubscribeTestEmails()
    //   console.log('Successfully processed test email unsubscriptions')
    // } catch (error) {
    //   console.error(`Error during test email unsubscription: ${error.message}`)
    // }
  } else {
    console.log('Tests failed, keeping screenshots for debugging')
  }
})

// Define our extended test with custom fixtures
const testWithFixtures = test.extend({
  // Add a fixture to manually register test emails that may be created during tests
  // eslint-disable-next-line no-empty-pattern
  registerTestEmail: async ({}, use) => {
    /**
     * Function to manually register a test email for cleanup
     * @param {string} email - The email address to register
     * @returns {boolean} - True if registered successfully, false otherwise
     */
    const registerEmail = (email) => {
      if (email && typeof email === 'string' && email.includes('@')) {
        testEmailRegistry.add(email)
        console.log(`Registered test email for cleanup: ${email}`)
        return true
      }
      console.warn(`Invalid email format, not registering: ${email}`)
      return false
    }

    await use(registerEmail)
  },

  // Add a fixture to get all registered test emails
  // eslint-disable-next-line no-empty-pattern
  getRegisteredEmails: async ({}, use) => {
    /**
     * Function to retrieve all registered test emails
     * @returns {Array<string>} - Array of all registered email addresses
     */
    await use(() => Array.from(testEmailRegistry))
  },

  postMessage: async ({ page, setNewUserPassword }, use) => {
    /**
     * Helper function to post a message to Freegle
     * @param {Object} options - Configuration options for posting
     * @param {string} options.type - The type of post ('OFFER' or 'WANTED')
     * @param {string} options.item - The item title/name
     * @param {string} options.description - The item description
     * @param {string} options.postcode - The postcode for the item
     * @param {string} options.email - The email to use for posting
     * @returns {Promise<{id: string|null, description: string}>} - Information about the created post
     */
    const postMessage = async (options) => {
      const {
        type = 'OFFER',
        item = 'test post - please delete',
        description = `Created by automated test at ${new Date().toISOString()}`,
        postcode = environment.postcode,
        email,
      } = options

      if (!email) {
        throw new Error('Email is required for posting a message')
      }

      // Navigate to the correct page based on type
      const startPath = type.toLowerCase() === 'wanted' ? '/find' : '/give'
      await page.gotoAndVerify(startPath, {
        timeout: timeouts.navigation.initial,
      })

      // Verify we're on the correct page
      const pageTitle = await page.title()
      base.expect(pageTitle).toContain(type.toUpperCase())

      // Fill in the item type (item)
      await page
        .locator('[id^="what"], .type-input, input[placeholder*="give"]')
        .click()
      await page
        .locator('[id^="what"], .type-input, input[placeholder*="give"]')
        .fill(item)

      // Fill in the post details
      await page.waitForSelector(
        '[id^="description"], textarea.description, textarea.form-control',
        { timeout: timeouts.ui.appearance }
      )

      // Add the description
      await page
        .locator(
          '[id^="description"], textarea.description, textarea.form-control'
        )
        .fill(description)

      // Click the Next/Continue button to go to location page
      await page
        .locator('.btn:has-text("Next")')
        .filter({ visible: true })
        .first()
        .click()

      // Fill in location details
      await page.waitForSelector('.pcinp, input[placeholder="Type postcode"]', {
        timeout: timeouts.ui.appearance,
      })

      // Fill in the postcode
      await page
        .locator('.pcinp, input[placeholder="Type postcode"]')
        .fill(postcode)

      // Wait for the location to be confirmed using locator.waitFor()
      const confirmationIcon = page.locator(
        '.text-success.fa-bh, .fa-check-circle, .v-icon[icon="check-circle"]'
      )
      await confirmationIcon.waitFor({
        state: 'visible',
        timeout: timeouts.api.default,
      })

      // Click the Next/Continue button to go to email page
      await page
        .locator('.btn:has-text("Next")')
        .filter({ visible: true })
        .first()
        .click()

      // Fill in the email - wait for email input to be visible using locator.waitFor()
      const emailField = page
        .locator('input[name="email"], input.email, input[type="email"]')
        .first()
      await emailField.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Fill in our generated test email
      const emailInput = page
        .locator('input[name="email"], input.email, input[type="email"]')
        .first()
      await emailInput.click()
      await emailInput.fill(email)

      // Take a debug screenshot
      const emailScreenshotTimestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
      await page.screenshot({
        path: `playwright-screenshots/email-filled-${emailScreenshotTimestamp}.png`,
        fullPage: true,
      })

      // Wait for validation to complete and the button to appear using web assertions
      console.log(
        'Waiting for Freegle it button to appear after email validation'
      )
      const freegleButton = page
        .locator('.btn:has-text("Freegle it!")')
        .filter({ visible: true })

      // Wait for button to be visible
      await freegleButton.waitFor({
        state: 'visible',
        timeout: timeouts.api.default,
      })

      console.log('Button appeared, submit')

      // Click the Submit/Post button to finalize
      await freegleButton.click()

      // Wait for page url to contain myposts
      console.log('Waiting for navigation to My Posts page', page.url())
      const myPostsUrl = /\/myposts/
      await page.waitForURL(myPostsUrl, {
        timeout: timeouts.navigation.default,
      })

      // Take a screenshot of the success
      const screenshotTimestamp = new Date().toISOString().replace(/[:.]/g, '-')
      await page.screenshot({
        path: `playwright-screenshots/item-post-success-${screenshotTimestamp}.png`,
        fullPage: true,
      })

      // Check for the posted item
      const messageCard = page.locator(`.messagecard:has-text("${item}")`)
      await messageCard.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Try to extract the post ID
      let postId = null
      try {
        postId =
          (await messageCard.getAttribute('data-id')) ||
          (await messageCard.getAttribute('id'))

        if (postId) {
          console.log(`Successfully created post with ID: ${postId}`)
        }
      } catch (error) {
        console.log(
          'Post appears to be created but could not find details:',
          error.message
        )
      }

      // Handle deadline modal if it appears
      const deadlineModal = page.locator(
        '.modal:has-text("Is there a deadline?")'
      )
      await deadlineModal.waitFor({
        state: 'visible',
        timeout: timeouts.navigation.default,
      })
      const noDeadlineButton = page.locator('.btn:has-text("No deadline")')
      await noDeadlineButton.click()
      console.log('Clicked "No deadline" in deadline modal')

      // Handle delivery modal if it appears (only for OFFER posts)
      if (type.toUpperCase() === 'OFFER') {
        const deliveryModal = page.locator(
          '.modal:has-text("Could you deliver?")'
        )
        await deliveryModal.waitFor({
          state: 'visible',
          timeout: timeouts.navigation.default,
        })
        const maybeButton = page.locator('.btn:has-text("Maybe")')
        await maybeButton.click()
        console.log('Clicked "Maybe" in delivery modal')
      } else {
        console.log('Skipping delivery modal for WANTED post')
      }

      // Set password to default test password in NewUserInfo component
      await setNewUserPassword()

      // Clear out the ids and type values from window.history.state to prevent modals showing again on renavigation
      await page.evaluate(() => {
        if (window.history.state) {
          const newState = { ...window.history.state }
          delete newState.ids
          delete newState.type
          window.history.replaceState(newState, '', window.location.href)
        }
      })
      console.log(
        'Cleared ids and type from history state to prevent modal reappearance'
      )

      // Return information about the post
      return {
        id: postId,
        item,
        description,
      }
    }

    await use(postMessage)
  },

  waitForNuxtPageLoad: async ({ page }, use) => {
    const waitForNuxtPageLoad = async (options = {}) => {
      const timeout = options.timeout || 30000
      return await page.waitForFunction(
        () => {
          return (
            document.title !== 'Starting Nuxt... | Nuxt' &&
            document.title !==
              'Error while loading Nuxt. Please check console and fix errors. | Nuxt' &&
            document.title.length > 0 &&
            document.body?.textContent?.includes('Loading... Stuck here') ===
              false
          )
        },
        { timeout }
      )
    }
    await use(waitForNuxtPageLoad)
  },

  findAndClickButton: async ({ page }, use) => {
    const findAndClickButton = async (selectors, options = {}) => {
      for (const selector of selectors) {
        const modifiedSelector = `${selector}:not([disabled]):not([disabled="true"])`
        const button = page.locator(modifiedSelector).first()
        if (
          (await button.count()) > 0 &&
          (await button.isVisible().catch(() => false))
        ) {
          await button.click()
          return true
        }
      }
      return false
    }
    await use(findAndClickButton)
  },

  setupTestPage: async ({ page }, use) => {
    const setupTestPage = async (options = {}) => {
      await page.setViewportSize(
        options.viewport || { width: 1280, height: 800 }
      )
      await page.gotoAndVerify(options.path || '/', {
        timeout: timeouts.navigation.initial,
      })
      if (options.waitForLoad !== false) {
        await page.waitForFunction(
          () => {
            return (
              document.title !== 'Starting Nuxt... | Nuxt' &&
              document.title !==
                'Error while loading Nuxt. Please check console and fix errors. | Nuxt' &&
              document.title.length > 0 &&
              document.body?.textContent?.includes('Loading... Stuck here') ===
                false
            )
          },
          { timeout: options.timeout || 30000 }
        )
      }
    }
    await use(setupTestPage)
  },

  takeTimestampedScreenshot: async ({ page }, use) => {
    const takeTimestampedScreenshot = async (description, options = {}) => {
      const timestamp = options.timestamp || Date.now()
      const path = getScreenshotPath(`${description}-${timestamp}.png`)
      return await page.screenshot({ path, fullPage: true, ...options })
    }
    await use(takeTimestampedScreenshot)
  },

  withdrawPost: async ({ page }, use) => {
    /**
     * Finds a post on the My Posts page and withdraws it
     * @param {Object} options - The withdrawal options
     * @param {string} options.item - The item text to search for
     * @returns {Promise<boolean>} - True if post was withdrawn successfully
     */
    const withdrawPost = async (options) => {
      const { item } = options

      if (!item) {
        throw new Error('Item text is required for withdrawing a post')
      }

      // Load My Posts page from scratch
      await page.goto('/myposts', {
        timeout: timeouts.navigation.default,
        waitUntil: 'load',
      })

      // Find the post we want to withdraw
      const postSelector = `.card-body:has-text("${item}")`
      const postCard = page.locator(postSelector)
      await postCard.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Look for the withdraw button within the post card
      const withdrawButton = postCard.locator('.btn:has-text("Withdraw")')
      await withdrawButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Click the withdraw button
      await withdrawButton.click()

      // Wait for confirmation modal to appear if needed
      const confirmButtons = ['.modal .btn:has-text("Withdraw")']

      // Try to find and click any confirmation button that appears
      for (const selector of confirmButtons) {
        try {
          const confirmButton = page.locator(selector).filter({ visible: true })
          await confirmButton.waitFor({
            state: 'visible',
            timeout: 2000,
          })
          await confirmButton.first().click()
          console.log(`Clicked confirmation button: ${selector}`)
          break
        } catch (error) {
          // This confirmation button doesn't exist, try the next one
          continue
        }
      }

      // The post should disappear entirely
      await postCard.waitFor({
        state: 'detached',
        timeout: timeouts.api.default,
      })
      console.log('Post successfully withdrawn and removed from page')

      return true
    }

    await use(withdrawPost)
  },

  setNewUserPassword: async ({ page }, use) => {
    /**
     * Sets the password for a new user in the NewUserInfo component
     * @param {string} [password=DEFAULT_TEST_PASSWORD] - The password to set
     * @returns {Promise<boolean>} - True if password was set successfully
     */
    const setNewUserPassword = async (password = DEFAULT_TEST_PASSWORD) => {
      console.log('Looking for password input field to set password')

      try {
        const passwordInput = page
          .locator('input[type="password"]')
          .filter({ visible: true })
        const saveButton = page
          .locator('.btn:has-text("Save")')
          .filter({ visible: true })

        // Check if password input is visible (NewUserInfo component)
        if (
          (await passwordInput.count()) > 0 &&
          (await saveButton.count()) > 0
        ) {
          console.log('Found password input, setting password')
          await passwordInput.fill(password)
          await saveButton.click()
          console.log('Set password successfully')

          // Wait a moment for the password to be saved
          await page.waitForTimeout(1000)
          return true
        } else {
          console.log('Password input not visible, may not be needed')
          return false
        }
      } catch (error) {
        console.log('Password input not found or not needed:', error.message)
        return false
      }
    }

    await use(setNewUserPassword)
  },

  replyToMessageWithSignup: async ({ page }, use) => {
    /**
     * Navigates to a message page and replies with signup as a new user
     * @param {Object} options - The reply options
     * @param {string} options.messageId - The message ID to reply to
     * @param {string} options.itemName - The item name to verify on the page
     * @param {string} options.email - The email address to use for signup
     * @param {string} [options.replyMessage] - The reply message text
     * @param {string} [options.collectDetails] - Collection details for OFFER messages
     * @returns {Promise<boolean>} - True if reply was sent successfully
     */
    const replyToMessageWithSignup = async (options) => {
      const {
        messageId,
        itemName,
        email,
        replyMessage = 'I would love to have this item please! I can collect anytime this week.',
        collectDetails = 'I can collect Monday-Friday after 6pm or weekends anytime',
      } = options

      if (!messageId || !itemName || !email) {
        throw new Error(
          'messageId, itemName, and email are required for replying to a message'
        )
      }

      // Navigate to the specific message page
      const messageUrl = `/message/${messageId}`
      await page.gotoAndVerify(messageUrl)
      console.log(`Navigated to message page: ${messageUrl}`)

      // Wait for the message content to load
      await page.locator('textarea[name="reply"]').waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Fill in the email field (for non-logged-in users)
      const emailInput = page
        .locator('input[type="email"]')
        .filter({ visible: true })
      await emailInput.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await emailInput.fill(email)
      console.log(`Filled email: ${email}`)

      // Fill in the reply message
      const replyTextarea = page
        .locator('textarea[name="reply"]')
        .filter({ visible: true })
      await replyTextarea.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await replyTextarea.fill(replyMessage)
      console.log('Filled reply message')

      // Fill in collection details (for OFFER messages)
      const collectTextarea = page
        .locator('textarea[name="collect"]')
        .filter({ visible: true })
      await collectTextarea.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await collectTextarea.fill(collectDetails)
      console.log('Filled collection details')

      // Click the "Send your reply" button
      const sendReplyButton = page
        .locator('.btn:has-text("Send your reply")')
        .filter({ visible: true })
      await sendReplyButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await sendReplyButton.first().click()
      console.log('Clicked Send your reply button')

      // Wait for "Welcome to Freegle" modal containing "It looks like this is your first time"
      console.log('Waiting for Welcome to Freegle modal')
      try {
        const welcomeModal = page
          .locator('.modal-content')
          .filter({
            hasText: 'Welcome to Freegle',
          })
          .filter({
            hasText: 'It looks like this is your first time',
          })

        await welcomeModal.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })

        console.log('Welcome to Freegle modal appeared')

        // Click "Close and Continue" button and wait for navigation
        const closeButton = welcomeModal.locator(
          '.btn:has-text("Close and Continue")'
        )
        await closeButton.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })

        console.log(
          'Clicking Close and Continue button and waiting for navigation'
        )

        // Use Promise.all to handle the click and navigation simultaneously
        await Promise.all([
          page.waitForURL('**/chats/**', {
            timeout: timeouts.navigation.default,
          }),
          closeButton.click(),
        ])

        console.log(
          'Successfully clicked Close and Continue and redirected to chats page'
        )

        // Handle ContactDetailsAskModal if it appears on the chats page
        try {
          console.log('Checking for ContactDetailsAskModal on chats page')
          const contactModal = page.locator('.modal-content').filter({
            hasText: 'Contact details',
          })

          // Wait briefly to see if the modal appears
          await contactModal.waitFor({
            state: 'visible',
            timeout: 3000,
          })

          console.log('ContactDetailsAskModal appeared, filling details')

          // Fill in postcode - look for the postcode input
          const postcodeInput = contactModal.locator(
            'input[placeholder*="postcode"], .pcinp'
          )
          await postcodeInput.waitFor({
            state: 'visible',
            timeout: timeouts.ui.appearance,
          })
          await postcodeInput.fill('EH3 6SS')
          console.log('Filled postcode')

          // Fill in phone number - look for the phone input
          const phoneInput = contactModal.locator(
            'input[placeholder*="mobile"]'
          )
          await phoneInput.waitFor({
            state: 'visible',
            timeout: timeouts.ui.appearance,
          })
          await phoneInput.fill('07700900123')
          console.log('Filled phone number')

          // Click OK/Save button
          const okButton = contactModal.locator(
            '.btn:has-text("OK"), .btn:has-text("Save")'
          )
          await okButton.waitFor({
            state: 'visible',
            timeout: timeouts.ui.appearance,
          })
          await okButton.first().click()
          console.log('Clicked OK button in ContactDetailsAskModal')

          // Wait for the contact modal to disappear
          await contactModal.waitFor({
            state: 'detached',
            timeout: timeouts.ui.response,
          })
          console.log('ContactDetailsAskModal closed')
        } catch (contactModalError) {
          console.log(
            'ContactDetailsAskModal did not appear, continuing:',
            contactModalError.message
          )
        }

        // Wait for the chat list to load and look for a chat entry
        await page.waitForSelector('.chatentry', {
          timeout: timeouts.ui.appearance,
        })

        // Check that there's one chat entry
        const chatEntries = page.locator('.chatentry').filter({ visible: true })
        const chatCount = await chatEntries.count()

        if (chatCount > 0) {
          console.log(`Found ${chatCount} chat entries in /chats after reply`)
        } else {
          console.log('Warning: No chat entries found in /chats after reply')
          return false
        }

        console.log(
          'Reply process completed successfully with signup and contact details filled'
        )
        return true
      } catch (error) {
        console.log(
          'Welcome to Freegle modal did not appear or signup failed:',
          error.message
        )
        return false
      }
    }

    await use(replyToMessageWithSignup)
  },
})

// Export our enhanced test function with all fixtures and expect
exports.test = testWithFixtures
exports.expect = base.expect
exports.NUXT_TEST_UTILS_AVAILABLE = NUXT_TEST_UTILS_AVAILABLE
