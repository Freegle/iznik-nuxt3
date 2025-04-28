const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const base = require('@playwright/test')
const { timeouts, environment } = require('./config')

// Define the screenshots directory
const SCREENSHOTS_DIR = path.join(process.cwd(), 'playwright-screenshots')

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

  return `${prefix}-${datePart}-${randomHash}@${environment.email.domain}`
}

// Define a custom test function that wraps the base test to add automatic screenshot capture
const test = base.test.extend({
  // Add the testEmail fixture - basic version that just generates a random test email
  testEmail: async (_, use) => {
    // Generate a unique test email for this test
    const email = generateUniqueTestEmail()

    // Provide the email to the test
    await use(email)
  },

  // Function to generate custom test emails with specific prefixes
  getTestEmail: async (_, use) => {
    // Return a function that generates test emails with custom prefixes
    const emailGenerator = (prefix = 'test') => generateUniqueTestEmail(prefix)
    await use(emailGenerator)
  },

  page: async ({ page }, use) => {
    const consoleErrors = []

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push({
          text: message.text(),
          location: message.location(),
        })
      }
    })

    page.consoleErrors = () => consoleErrors

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
      /%cssr:error%c API count went negative/, // Low importance and not visible to client.
      /%cssr:error%c Could not find one or more icon/, // Can legitimately happen in SSR.
      /Not signed in with the identity provider/, // Not available in test.
      /Provider's accounts list is empty/, // Google Pay related error - can happen in test.
      /FedCM get\(\) rejects with/, // Not available in test
      /Hydration completed but contains mismatches/, // Not ideal, but not visible to user
      /ResizeObserver loop limit exceeded/, // Non-critical UI warning
      /The request has been aborted/, // Can happen during navigation.
      /Failed to load resource: the server responded with a status of 403.*pagead/, // Google ad-related 403s are expected
      /Failed to load resource: the server responded with a status of 403.*googleads/, // Google ad-related 403s
      /Failed to load resource: the server responded with a status of 403.*doubleclick/, // More ad-related 403s
      /Failed to load resource: the server responded with a status of 403.*ads/, // Generic ad-related 403s
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
        // Navigate with timeout
        await page.goto(path, { timeout })

        // Wait for network idle with timeout
        await page.waitForLoadState('networkidle', { timeout })

        // Verify page content is visible
        const body = page.locator('body')
        await body.waitFor({ state: 'visible', timeout })

        // Check if page contains error messages
        const errorTextContent = await page.textContent('body')

        // Check for general error message
        if (errorTextContent.includes('Something went wrong')) {
          // Take a screenshot of the error page
          await page.screenshot({
            path: getScreenshotPath(`error-page-${Date.now()}.png`),
            fullPage: true,
          })
          throw new Error(
            `Page loaded with 'Something went wrong' error message at ${path}`
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
        await page.screenshot({
          path: getScreenshotPath(`navigation-error-${Date.now()}.png`),
        })

        // Re-throw with more context
        throw new Error(`Failed to navigate to ${path}: ${error.message}`)
      }

      return page
    }

    // Internal method to handle teardown with error handling
    const performTeardown = async (options = {}) => {
      const timeout = options.timeout || timeouts.teardown.networkIdle
      try {
        await page.waitForLoadState('networkidle', { timeout })
        return true
      } catch (error) {
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

    // Wrap the use() call in a try-catch block to add automatic screenshot capturing
    try {
      // Call use() to run the test
      await use(page)

      // Automatically check for console errors at the end of each test
      await page.checkTestRanOK()
    } catch (error) {
      // Take a full page screenshot on any test failure
      const screenshotPath = getScreenshotPath(`test-failure-${Date.now()}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: true })

      // Log the error with screenshot info
      console.error(
        `Test failed: ${error.message}\nScreenshot saved to: ${screenshotPath}`
      )

      // Re-throw the error to fail the test
      throw error
    } finally {
      // Always perform teardown operations, regardless of test success/failure
      await performTeardown()
    }
  },
})

// Add a global hook to cleanup screenshots after all tests
test.afterAll(async () => {
  // Only clean up if the tests succeeded
  if (process.exitCode === undefined || process.exitCode === 0) {
    await cleanupScreenshots()
  } else {
    console.log('Tests failed, keeping screenshots for debugging')
  }
})

// Export our enhanced test function and expect
exports.test = test
exports.expect = base.expect
